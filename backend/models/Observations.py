from typing import Optional, List, Dict
from langchain_core.pydantic_v1 import BaseModel, Field
from datetime import datetime


class SymptomObservation(BaseModel):
    """Encapsulates details about a single instance of a symptom in a narrative format, including its name, duration, severity, and frequency."""

    observation: str = Field(
        description="Describe a single symptom in one sentence, including its name, how long it has lasted (duration), how severe it is (severity), and how often it occurs (frequency). Example: 'Emily has been feeling constantly tired for the past month, despite getting enough sleep, with symptoms occurring daily.'"
    )
    type: str = Field(default="symptom")


class MedicalConditionObservation(BaseModel):
    """Narratively captures information about a single instance of a medical condition, including its name, symptoms, status, and any mentioned treatments."""

    observation: str = Field(
        description="Summarize a single instance of a medical condition in one sentence, including whether it is suspected or confirmed, its name, symptoms, and current status or necessary treatments. Example: 'Emily is suspected to have Type 2 Diabetes based on her symptoms of increased thirst, frequent urination, and fatigue, and she requires a blood test for confirmation.'"
    )
    type: str = Field(default="condition")


class MedicationObservation(BaseModel):
    """Summarizes details of a single medication including the name, dosage, purpose, and frequency in a narrative format."""

    observation: str = Field(
        description="Provide a detailed description of a single medication in one sentence, including its name, dosage, purpose (what it is for), and how often it is taken (frequency). Example: 'Emily takes Lisinopril, 10 mg, once daily to manage her hypertension.'"
    )
    type: str = Field(default="medication")


class LifestyleHabitObservation(BaseModel):
    """Describes a single lifestyle habit relevant to the patient’s health, such as smoking or an exercise routine, in a narrative manner."""

    observation: str = Field(
        description="Detail a single lifestyle habit impacting health in one comprehensive sentence, including what the habit is and how it affects health. Example: 'Emily works a desk job and spends most of her day sitting, contributing to her sedentary lifestyle.'"
    )
    type: str = Field(default="lifestyle")


class PatientInformation(BaseModel):
    """
    Captures basic and potentially relevant patient information disclosed during conversation. This model
    is designed to accommodate a range of data points that are commonly of interest in a medical context,
    understanding that not all information may be provided or provided precisely.
    """

    name: Optional[str] = Field(None, description="The patient's name.")
    age: Optional[int] = Field(None, description="The patient's age.")
    weight: Optional[float] = Field(
        None, description="The patient's weight in kilograms."
    )
    height: Optional[float] = Field(
        None, description="The patient's height in centimeters."
    )
    gender: Optional[str] = Field(
        None, description="The patient's gender as disclosed."
    )


class Observations(BaseModel):
    """
    Captures comprehensive medical data extracted from patient conversations, reformatted into a narrative style.
    This model synthesizes narrative observations about symptoms, medical conditions, medications, and lifestyle
    habits into a unified view that supports informed decision-making and healthcare guidance by the medical assistant.

    Attributes:
        date (str): The date on which the observations were recorded, defaulting to the current date.
        symptoms_observation (Optional[SymptomObservation]): Narrative description of symptoms.
        conditions_observation (Optional[MedicalConditionObservation]): Narrative description of medical conditions.
        medications_observation (Optional[MedicationObservation]): Narrative description of medications.
        lifestyle_habits_observation (Optional[LifestyleHabitObservation]): Narrative description of lifestyle habits.
        patient_information (Optional[PatientInformation]): Comprehensive details including personal and health-related information about the patient.
    """

    date: str = Field(default_factory=lambda: datetime.now().strftime("%Y-%m-%d"))
    symptoms_observations: Optional[List[SymptomObservation]] = Field(
        None, description="Narrative descriptions of symptoms reported by the user."
    )
    conditions_observations: Optional[List[MedicalConditionObservation]] = Field(
        None,
        description="Narrative descriptions of the user's existing and suspected medical conditions.",
    )
    medications_observations: Optional[List[MedicationObservation]] = Field(
        None, description="Narrative descriptions of medications the user is taking."
    )
    lifestyle_habits_observations: Optional[List[LifestyleHabitObservation]] = Field(
        None, description="Narrative descriptions of lifestyle habits impacting health."
    )
    patient_information: Optional[PatientInformation] = Field(
        None,
        description="Consolidates personal and health-related information about the patient as disclosed during the conversation, including age, weight, gender, and lifestyle habits. This data provides a holistic view of the patient's health background and personal context, aiding in personalized and informed medical assistance.",
    )

    def as_dicts(self) -> List[Dict[str, str]]:
        """Converts all observations into a list of dictionaries with a uniform structure."""
        today = datetime.now().strftime("%Y-%m-%d")
        # Consolidate all observation lists into one list
        all_observations = (
            (self.symptoms_observations or [])
            + (self.conditions_observations or [])
            + (self.medications_observations or [])
            + (self.lifestyle_habits_observations or [])
        )

        # Use list comprehension to build the results list
        results = [
            {"text": f"{obs.observation} ({today})", "type": obs.type}
            for obs in all_observations
            if obs and obs.observation
        ]

        return results
