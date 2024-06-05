from models.PatientInformation import PatientInformation
from models import Observations
from sqlalchemy.orm import Session
from sqlalchemy import delete


class PatientService:
    def __init__(self, db: Session):
        self.db = db

    async def upsert_from_observations(self, user_id: int, observations: Observations):
        new_information = {
            k: v
            for k, v in observations.patient_information.dict().items()
            if v is not None
        }

        old_information = (
            self.db.query(PatientInformation)
            .filter(PatientInformation.user_id == user_id)
            .first()
        )

        if old_information:
            for key, value in new_information.items():
                setattr(old_information, key, value)
        else:
            patient_info = PatientInformation(user_id=user_id, **new_information)
            self.db.add(patient_info)

        self.db.commit()

    async def delete_all(self, user_id: int):
        self.db.execute(
            delete(PatientInformation).where(PatientInformation.user_id == user_id)
        )
        self.db.commit()

    async def get(self, user_id: int) -> PatientInformation:
        patient_info = (
            self.db.query(PatientInformation)
            .filter(PatientInformation.user_id == user_id)
            .first()
        )
        return patient_info
