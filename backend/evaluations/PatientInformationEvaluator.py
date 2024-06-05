import json
import os
import pandas as pd
from langchain_openai import ChatOpenAI
from models import StandardChatMessage, PatientInformation
from prompts import get_doctor_system_prompt, get_patient_information_prompt
from evaluations.utils import get_client_from_model
from langchain.schema import HumanMessage, SystemMessage
from utils import standard_to_langchain_msgs

diagnoses_prompt_msg = StandardChatMessage(
    role="user",
    content="Can you give me the three most probable diagnoses/causes based on the conversation so far?",
)


class PatientInformationEvaluator:
    def __init__(self, patient_file, conversation_file, model, output_folder):
        self.patient_data = self.load_data(patient_file)
        conversation_data = self.load_data(conversation_file)
        self.conversation = conversation_data["conversation"]
        self.target_diagnosis = conversation_data["target"]
        self.output_folder = output_folder
        self.model_name = model
        self.llm = get_client_from_model(model)
        self.extractor = ChatOpenAI(
            model="gpt-4o",
            temperature=0,
            model_kwargs={"response_format": {"type": "json_object"}},
        )

    @staticmethod
    def load_data(file_path):
        with open(file_path, "r") as f:
            return json.load(f)

    def get_diagnosis(self, with_patient=False):
        conversation = [StandardChatMessage(**msg) for msg in self.conversation]
        conversation.append(diagnoses_prompt_msg)

        if with_patient:
            patient_info = PatientInformation(**self.patient_data)
            conversation.insert(0, get_patient_information_prompt(patient_info))
        conversation.insert(0, get_doctor_system_prompt())
        conversation = standard_to_langchain_msgs(conversation)
        return self.llm.invoke(conversation).content

    def extract_diagnoses_as_list(self, diagnoses):
        messages = [
            SystemMessage(
                content="Extract any diagnoses, in order, into a JSON object with key 'diagnoses' in a list, from the following message:"
            ),
            HumanMessage(content=f"{diagnoses}. Respond in JSON."),
        ]
        response = self.extractor.invoke(messages)
        return json.loads(response.content)["diagnoses"]

    def evaluate(self):
        uninformed_diagnosis = self.get_diagnosis(with_patient=False)
        informed_diagnosis = self.get_diagnosis(with_patient=True)
        return {
            "model_name": self.model_name,
            "target_diagnosis": self.target_diagnosis,
            "uninformed_diagnoses": self.extract_diagnoses_as_list(
                uninformed_diagnosis
            ),
            "informed_diagnoses": self.extract_diagnoses_as_list(informed_diagnosis),
        }

    @staticmethod
    def save_results(output_folder, results):
        os.makedirs(output_folder, exist_ok=True)
        output_file = os.path.join(output_folder, f"results.json")
        with open(output_file, "w") as f:
            json.dump(results, f, indent=4)


if __name__ == "__main__":
    models = [
        "gpt-4o",
        "gpt-4-turbo",
        "gpt-4",
        "gpt-3.5-turbo",
        "mistral-large-latest",
        "mistral-medium-latest",
        "mistral-small-latest",
        "open-mixtral-8x22b",
        "open-mixtral-8x7b",
        "open-mistral-7b",
    ]
    patient_names = ["patient_1"]

    for patient in patient_names:
        conversation = f"{patient}_conversation.json"

        output_folder = f"evaluations/patient_information/{patient}"
        results = []
        for model in models:  # [6:7]
            evaluator = PatientInformationEvaluator(
                f"evaluations/patient_information/{patient}.json",
                f"evaluations/patient_information/{conversation}",
                model,
                output_folder,
            )
            results.append(evaluator.evaluate())
        PatientInformationEvaluator.save_results(output_folder, results)
