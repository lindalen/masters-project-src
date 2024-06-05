from pydantic import BaseModel
from typing import List
from models.SupportedModels import ModelType
from models import StandardChatMessage


class ChatRequestPayload(BaseModel):
    user_id: int
    messages: List[StandardChatMessage]
    model: ModelType
    memory: bool
