from pydantic import BaseModel, validator
from typing import Literal

class StandardChatMessage(BaseModel):
    role: Literal["assistant", "user", "system"]
    content: str

    @validator('role')
    def validate_role(cls, v):
        if v not in ["assistant", "user", "system"]:
            raise ValueError("Role must be one of 'assistant', 'user', or 'system'")
        return v
