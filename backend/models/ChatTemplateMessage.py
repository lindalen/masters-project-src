from pydantic import BaseModel, validator
from typing import List, Literal, Tuple
from models import StandardChatMessage


class ChatTemplateMessage(BaseModel):
    role: str
    content: str

    @classmethod
    def from_messages(
        cls, messages: List[StandardChatMessage]
    ) -> List["ChatTemplateMessage"]:
        result = []
        for message in messages:
            if message.role == "assistant":
                role = "ai"
            elif message.role == "user":
                role = "human"
            else:
                continue  # Skip 'system' messages for this transformation
            result.append(cls(role=role, content=message.content))
        return result
