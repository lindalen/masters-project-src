import json
import os
import asyncio
from langchain_openai import ChatOpenAI
from evaluations.utils import get_client_from_model
from models import StandardChatMessage
from services.ObservationService import ObservationService
from dotenv import load_dotenv, find_dotenv

load_dotenv(find_dotenv())

grading_prompt = """
Compare the following lists of medical observations and provide a detailed justification and score:

Ground Truth List:
{ground_truth_observations}

Student's Answer List:
{given_observations}

Instructions:
1. For each observation in the Ground Truth List, check if it is included in the Student's Answer List by matching the key facts.
    - A key fact is a critical piece of information that conveys the main point of the observation.
2. Provide a detailed justification for each observation match or mismatch.
3. Assign a score for each observation:
    - 1 if fully included.
    - 0.5 if partially included (some but not all key facts).
    - 0 if not included.
4. Handle cases where an observation is distributedly represented or implied in the Student's Answer List:
    - If a key fact is broken down into several parts across different observations, consider the collective information.
    - If a key fact is implied rather than explicitly stated, consider whether the implication logically conveys the same information.
5. Output the results as a JSON object containing:
    - "ground_truth": The original observation.
    - "student_answer": The corresponding observation(s) from the student's list.
    - "details": A detailed explanation of the match or mismatch.
    - "score": The assigned score (1, 0.5, or 0).

Note:
- A fact is considered fully included (score=1) even if it is combined with another fact in the student's answer.
- Consider the collective information from multiple observations if a key fact is distributed across them.
- Consider logical implications that convey the same information as the key facts.

Examples:
1. 
Ground Truth: "The patient has asthma and uses an inhaler twice daily."
Student Answers:
- "The patient uses an inhaler in the morning."
- "The patient uses an inhaler in the evening."
Details: The student's answers collectively contain the key facts that the patient has asthma and uses an inhaler twice daily.
Score: 1 (fully included)

2. 
Ground Truth: "The patient was diagnosed with hypertension."
Student Answer: "The patient takes medication for high blood pressure."
Details: The student's answer implies the diagnosis of hypertension by mentioning the medication for high blood pressure.
Score: 1 (fully included)

Please respond with **ONLY** a list of JSON objects.
"""

grading_prompt_patient = """
Compare the following patient information and provide a detailed justification and score:

Ground Truth Patient Information:
{ground_truth_patient}

Extracted Patient Information:
{extracted_patient}

Instructions:
1. For each field in the Ground Truth Patient Information, check if it is included and correct in the Extracted Patient Information.
    - Fields to check: name, age, gender, height, weight.
2. Provide a plain text justification for the match or mismatch of the fields.
3. Assign a total score out of 5 based on the number of correct fields:
    - 1 point for each correct field.
4. Respond with a JSON object containing:
    - "explanation": A plain text justification for the match or mismatch of the fields.
    - "total_score": The total score out of 5.

Example Response:
{{
    "explanation": "The name is correct. The age is missing. The gender is correct. The height is correct. The weight is incorrect.",
    "total_score": "4/5"
}}

Please respond **ONLY** with the JSON object.
"""


class ExtractionEvaluator:
    def __init__(
        self,
        patient_file,
        observations_file,
        conversation_file,
        model: str,
        output_folder: str,
    ):
        _oa_api_key = os.getenv("OPENAI_API_KEY")

        self.patient_data = self.load_data(patient_file)
        self.observations_data = self.load_data(observations_file)
        self.conversation_data = self.load_data(conversation_file)
        self.output_folder = output_folder
        self.observation_service = ObservationService(
            extractor=get_client_from_model(model)
        )
        self.model_name = model
        self.grading_llm = ChatOpenAI(
            model="gpt-4o",
            temperature=0,
            api_key=_oa_api_key,
        )

    def load_data(self, file_path):
        if os.path.exists(file_path):
            with open(file_path, "r") as f:
                return json.load(f)
        else:
            raise FileNotFoundError(f"{file_path} does not exist")

    async def evaluate_observations(self):
        messages = [
            StandardChatMessage(**message) for message in self.conversation_data
        ]
        extracted_observations = await self._retry_extraction(messages)
        return {
            "actual_patient": self.patient_data,
            "actual_observations": self.observations_data,
            "extracted_patient": extracted_observations.patient_information.dict(),
            "extracted_observations": extracted_observations.as_dicts(),
        }

    async def grade_observations(self, evaluation_data):
        ground_truth = evaluation_data.get("actual_observations", [])
        extracted = evaluation_data.get("extracted_observations", [])

        ground_truth_str = json.dumps(ground_truth, indent=4)
        extracted_str = json.dumps(extracted, indent=4)

        prompt = grading_prompt.format(
            ground_truth_observations=ground_truth_str,
            given_observations=extracted_str,
        )

        grading_response = self.grading_llm.invoke(prompt)
        grading_result = json.loads(grading_response.content)

        # Calculate total score
        total_score = sum(entry["score"] for entry in grading_result)
        print(f"Total Score for {self.model_name}: {total_score}/{len(grading_result)}")
        return {
            "actual_observations": ground_truth,
            "actual_patient": evaluation_data["actual_patient"],
            "extracted_observations": extracted,
            "extracted_patient": evaluation_data["extracted_patient"],
            "scoring_details": grading_result,
            "total_score": f"Total Score: {total_score}/{len(grading_result)}",
        }

    async def grade_patient_info(self, evaluation_data):
        ground_truth = evaluation_data.get("actual_patient", {})
        extracted = evaluation_data.get("extracted_patient", {})

        ground_truth_str = json.dumps(ground_truth, indent=4)
        extracted_str = json.dumps(extracted, indent=4)

        prompt = grading_prompt_patient.format(
            ground_truth_patient=ground_truth_str,
            extracted_patient=extracted_str,
        )

        grading_response = self.grading_llm.invoke(prompt)
        grading_result = json.loads(grading_response.content)

        # Calculate total score
        print(
            f"Total Patient Info Score for {self.model_name}: {grading_result['total_score']}"
        )
        return {
            "actual_patient": ground_truth,
            "extracted_patient": extracted,
            "explanation": grading_result["explanation"],
            "total_score": grading_result["total_score"],
        }

    async def _retry_extraction(self, messages, max_retries=3):
        for attempt in range(max_retries):
            try:
                extraction_result = (
                    await self.observation_service.extract_observations_from_messages(
                        messages
                    )
                )
                # Validate JSON structure by converting it to dict
                json.loads(json.dumps(extraction_result.json()))
                return extraction_result
            except Exception as e:
                print(f"Error during extraction attempt {attempt + 1}: {e}")
                if attempt == max_retries - 1:
                    raise
                await asyncio.sleep(1)

    async def save_evaluations(self):
        evaluation = await self.evaluate_observations()
        graded_evaluation = await self.grade_observations(evaluation)
        graded_patient_info = await self.grade_patient_info(evaluation)

        os.makedirs(f"evaluations/{self.output_folder}", exist_ok=True)
        os.makedirs(f"evaluations/{self.output_folder}/patient_info", exist_ok=True)

        output_file_observations = (
            f"evaluations/{self.output_folder}/graded_{self.model_name}.json"
        )
        output_file_patient_info = f"evaluations/{self.output_folder}/patient_info/graded_{self.model_name}.json"

        with open(output_file_observations, "w") as f:
            json.dump(graded_evaluation, f, indent=4)

        with open(output_file_patient_info, "w") as f:
            json.dump(graded_patient_info, f, indent=4)


if __name__ == "__main__":
    models = [
        "gpt-4o",
        "gpt-4-turbo",
        "gpt-4",
        "gpt-3.5-turbo",
        "mistral-large-latest",
        "open-mixtral-8x22b",
        "mistral-small-latest",
    ]

    conversations = [
        "conversation_simple.json",
        "conversation_complex.json",
    ]
    for conversation in conversations:
        output_folder = f"extraction/{conversation.split('.')[0]}"
        for model in models[3:4]:
            evaluator = ExtractionEvaluator(
                "evaluations/extraction/patient.json",
                "evaluations/extraction/observations.json",
                f"evaluations/extraction/{conversation}",
                model,
                output_folder,
            )
            asyncio.run(evaluator.save_evaluations())
