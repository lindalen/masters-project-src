from pydantic import BaseModel, validator
from typing import Literal

class ModelFamily(BaseModel):
    model: Literal["gpt", "mistral"]

    @validator('model')
    def validate_role(cls, v):
        if v not in ["gpt", "mistral"]:
            raise ValueError("Role must be one of 'gpt' or 'mistral'")
        return v