from typing import List
from utils import standard_to_langchain_msgs
from models import StandardChatMessage, PatientInformation
from prompts import (
    format_patient_information,
    get_patient_information_prompt,
    intent_system_prompt,
    doctor_system_prompt,
    diagnosis_system_prompt_template,
    treatment_system_prompt_template,
    explanation_system_prompt_template,
)
from services import PatientService, ObservationService, MedicalFactsService
from sqlalchemy.orm import Session
from evaluations.utils import get_client_from_model
import json
from langchain.schema import SystemMessage, BaseMessage
import asyncio
from pprint import pprint


class ConversationService:

    def __init__(self, db: Session, user_id: int, model: str, memory: bool = True):
        self.db = db
        self.llm = get_client_from_model(model)
        self.user_id = user_id
        self.memory = memory
        self.medical_facts_service = MedicalFactsService()
        self.observations_service = ObservationService()
        self.patient_service = PatientService(db)

    async def classify_intent(
        self, messages: List[BaseMessage], patient_info: PatientInformation
    ):
        intent_prompt = SystemMessage(content=intent_system_prompt)
        if patient_info:
            patient_info_prompt = SystemMessage(
                content=format_patient_information(patient_info)
            )
            conversation = [intent_prompt, patient_info_prompt] + messages
        else:
            conversation = [intent_prompt] + messages

        intent_response = await self.llm.ainvoke(conversation)
        return intent_response.content

    async def get_response(self, messages: List[StandardChatMessage]):
        messages = standard_to_langchain_msgs(messages)
        patient_info = await self.get_patient_information()
        patient_info_str = (
            format_patient_information(patient_info)
            if patient_info
            else "No patient information."
        )
        intent_json = await self.classify_intent(messages, patient_info)

        try:
            intent_data = json.loads(intent_json)
            intent = intent_data.get("intent", "").lower()
            print("INTENT:", intent)

            medical_facts_query = intent_data.get("medical_facts_query", "")
            print("Medical facts query:", medical_facts_query)
            patient_history_query = intent_data.get("patient_history_query", "")
            print("Patient history query:", patient_history_query)

            medical_facts, patient_history = await asyncio.gather(
                self.get_medical_facts(medical_facts_query),
                self.get_patient_history(patient_history_query),
            )

            if intent == "explanation":
                continuation_prompt = await self.get_explanation(
                    medical_facts_query,
                    patient_info_str,
                    medical_facts,
                    patient_history,
                )
            elif intent == "diagnosis":
                continuation_prompt = await self.get_diagnosis(
                    medical_facts_query,
                    patient_info_str,
                    medical_facts,
                    patient_history,
                )
            elif intent == "treatment":
                continuation_prompt = await self.get_treatment(
                    medical_facts_query,
                    patient_info_str,
                    medical_facts,
                    patient_history,
                )
            else:
                continuation_prompt = None

        except json.JSONDecodeError:
            continuation_prompt = None

        return await self.get_continuation(messages, patient_info, continuation_prompt)

    async def get_explanation(
        self, query: str, patient_info: str, medical_facts="", patient_history=""
    ):
        explanation_system_prompt = explanation_system_prompt_template.format(
            query=query,
            patient_info=patient_info,
            patient_history=patient_history,
            medical_facts=medical_facts,
        )

        explanation_msg = SystemMessage(content=explanation_system_prompt)
        explanation = await self.llm.ainvoke([explanation_msg])
        explanation = explanation.content

        print("Explanation:", explanation)
        explanation_continuation_wrapper = f"""
        Given this explanation:
        {explanation}

        Adapt it to the needs of the patient and continue the conversation naturally.
        """
        return explanation_continuation_wrapper

    async def get_diagnosis(
        self, query: str, patient_info: str, medical_facts="", patient_history=""
    ):
        diagnosis_system_prompt = diagnosis_system_prompt_template.format(
            query=query,
            patient_info=patient_info,
            patient_history=patient_history,
            medical_facts=medical_facts,
        )

        diagnosis_msg = SystemMessage(content=diagnosis_system_prompt)
        diagnosis = await self.llm.ainvoke([diagnosis_msg])
        diagnosis = diagnosis.content
        print("Diagnosis:", diagnosis)

        diagnosis_continuation_wrapper = f"""
        Given this diagnosis:
        {diagnosis}

        Adapt it to the needs of the patient and continue the conversation naturally.
        """
        return diagnosis_continuation_wrapper

    async def get_treatment(
        self, query: str, patient_info: str, medical_facts="", patient_history=""
    ):
        treatment_system_prompt = treatment_system_prompt_template.format(
            query=query,
            patient_info=patient_info,
            patient_history=patient_history,
            medical_facts=medical_facts,
        )

        treatment_msg = SystemMessage(content=treatment_system_prompt)
        treatment = await self.llm.ainvoke([treatment_msg])
        treatment = treatment.content
        print("Treatment:", treatment)

        treatment_continuation_wrapper = f"""
        Given this treatment plan:
        {treatment}

        Summarize the most impactful steps, adapt it to the patient and continue the conversation naturally.
        """
        return treatment_continuation_wrapper

    async def get_continuation(
        self,
        messages: List[BaseMessage],
        patient_info: PatientInformation,
        continuation_prompt=None,
    ):
        doctor_sys_prompt = SystemMessage(content=doctor_system_prompt)
        messages.insert(0, doctor_sys_prompt)

        if patient_info:
            patient_info_prompt = SystemMessage(
                content=get_patient_information_prompt(patient_info).content
            )
            messages.insert(1, patient_info_prompt)

        if continuation_prompt:
            continuation_msg = SystemMessage(content=continuation_prompt)
            messages.append(continuation_msg)

        response = await self.llm.ainvoke(messages)
        return {"role": "assistant", "content": response.content}

    async def get_medical_facts(self, medical_facts_query: str):
        if medical_facts_query == "":
            return ""

        facts = await self.medical_facts_service.query(medical_facts_query)
        formatted_medical_facts = self.medical_facts_service.format_results(facts)
        print("== FACTS FETCHED ==")
        pprint(formatted_medical_facts)
        print("===================")

        return formatted_medical_facts

    async def get_patient_history(self, patient_history_query: str):
        if patient_history_query == "" or not self.memory:
            return ""

        observations = await self.observations_service.query(
            self.user_id, patient_history_query
        )
        formatted_observations = self.observations_service.format_results(observations)
        print("== OBSERVATIONS FETCHED ==")
        pprint(formatted_observations)
        print("==========================")

        return formatted_observations

    async def get_patient_information(self) -> PatientInformation:
        if not self.memory:
            return None

        patient_info = await self.patient_service.get(self.user_id)
        if patient_info:
            print("== PATIENT FETCHED ==")
            print(format_patient_information(patient_info))
        else:
            print("== PATIENT INFORMATION NOT AVAILABLE ==")
        return patient_info
