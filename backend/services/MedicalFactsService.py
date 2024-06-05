import os
from utils import filter_pinecone_results_by_score
from models.StandardChatMessage import StandardChatMessage
from prompts import messages_to_dialogue_string
from services import MistralService
from typing import List
from pinecone import Pinecone


class MedicalFactsService:
    def __init__(self, llm=None):
        _api_key = os.getenv("PINECONE_API_KEY")
        self.client = Pinecone(api_key=_api_key)
        self.index = self.client.Index("mediplus-corpus")
        self.llm = (
            llm if llm is not None else MistralService(model="mistral-large-latest")
        )
        self.score_threshold = 0.8

    async def query(self, messages: List[StandardChatMessage]):
        embedding = await self.llm.embed([messages_to_dialogue_string(messages)])

        response = self.index.query(
            vector=embedding,
            top_k=5,
            include_metadata=True,
        )

        return filter_pinecone_results_by_score(
            response["matches"], self.score_threshold
        )

    async def query(self, query_str: str):
        embedding = await self.llm.embed([query_str])

        response = self.index.query(
            vector=embedding,
            top_k=5,
            include_metadata=True,
        )

        return filter_pinecone_results_by_score(
            response["matches"], self.score_threshold
        )

    def format_results(self, results):
        if not results:
            return "No medical facts."

        formatted_medical_facts = "\n\n".join(
            f"- Title: {fact['metadata']['Title']}\n  Text: {fact['metadata']['text']}"
            for fact in results
        )

        return formatted_medical_facts
