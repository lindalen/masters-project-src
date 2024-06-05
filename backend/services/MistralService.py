import os
from typing import List, AsyncGenerator, Optional
from fastapi import HTTPException
from mistralai.async_client import MistralAsyncClient
from mistralai.models.chat_completion import ChatMessage
from models.StandardChatMessage import StandardChatMessage


class MistralService:
    def __init__(self, model: str):
        _api_key = os.getenv("MISTRAL_API_KEY")
        self.client = MistralAsyncClient(api_key=_api_key)
        self.model = model

    def format_messages(self, messages: List[StandardChatMessage]) -> List[ChatMessage]:
        return [
            ChatMessage(role=message.role, content=message.content)
            for message in messages
        ]

    async def query(
        self, messages: List[StandardChatMessage], model: Optional[str] = None
    ) -> str:
        formatted_messages = self.format_messages(messages)
        model_to_use = model if model else self.model

        response = await self.client.chat(
            model=model_to_use, messages=formatted_messages, max_tokens=200
        )

        if response is None or len(response.choices) == 0:
            raise HTTPException(status_code=500, detail="Invalid response.")
        return response.choices[0].message.content

    async def stream_response(
        self, messages: List[StandardChatMessage]
    ) -> AsyncGenerator[str, None]:
        formatted_messages = self.format_messages(messages)
        async for chunk in self.client.chat_stream(
            model=self.model, messages=formatted_messages
        ):
            if chunk is None or len(chunk.choices) == 0:
                raise HTTPException(status_code=500, detail="Invalid response.")
            yield chunk.choices[0].delta.content

    async def embed(self, input_texts: List[str], return_all=False) -> list[float]:
        embedding_response = await self.client.embeddings(
            model="mistral-embed", input=input_texts
        )
        if embedding_response is None or len(embedding_response.data) == 0:
            raise HTTPException(status_code=500, detail="Invalid response.")

        if return_all:
            return [row.embedding for row in embedding_response.data]
        else:
            return embedding_response.data[0].embedding
