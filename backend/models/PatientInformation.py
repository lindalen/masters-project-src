from sqlalchemy import Column, Integer, Float, String, ForeignKey
from sqlalchemy.orm import relationship
from services.database import Base


class PatientInformation(Base):
    __tablename__ = "user_patient_information"

    user_id = Column(Integer, ForeignKey("users.id"), primary_key=True)
    name = Column(String(255), nullable=True)
    age = Column(Integer, nullable=True)
    weight = Column(Float, nullable=True)
    height = Column(Float, nullable=True)
    gender = Column(String(50), nullable=True)

    # Relationship to link back to the User model
    user = relationship("User", back_populates="patient_information")

    def to_dict(self):
        return {
            "age": self.age,
            "weight": self.weight,
            "name": self.name,
            "height": self.height,
            "gender": self.gender,
        }
