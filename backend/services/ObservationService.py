from typing import List, Tuple
from services import MistralService
from utils import filter_pinecone_results_by_score
from prompts import messages_to_dialogue_string
from models.Observations import Observations
from models import StandardChatMessage
from langchain_core.prompts import ChatPromptTemplate
from langchain_mistralai import ChatMistralAI
import asyncio
import concurrent.futures
import os
import uuid
from pinecone import Pinecone
import pprint


class ObservationService:
    def __init__(self, llm=None, extractor=None):
        self.executor = concurrent.futures.ThreadPoolExecutor()
        _pc_api_key = os.getenv("PINECONE_API_KEY")
        _ms_api_key = os.getenv("MISTRAL_API_KEY")
        self.client = Pinecone(api_key=_pc_api_key)
        self.index = self.client.Index("observations")
        self.llm = (
            llm if llm is not None else MistralService(model="mistral-large-latest")
        )
        self.extractor = (
            extractor
            if extractor is not None
            else ChatMistralAI(
                model="mistral-large-latest", temperature=0, mistral_api_key=_ms_api_key
            )
        )
        self.score_threshold = 0.65

    async def extract_observations_from_messages(
        self, messages: List[StandardChatMessage]
    ) -> Observations:
        dialogue = messages_to_dialogue_string(messages)

        prompt = ChatPromptTemplate.from_messages(
            [
                (
                    "system",
                    "You are an expert medical information extraction algorithm. "
                    "Extract relevant medical information such as symptoms, conditions, medications, and patient details. "
                    "If unsure about any information, return null for that attribute.",
                ),
                ("human", "{text}"),
            ]
        )

        runnable = prompt | self.extractor.with_structured_output(schema=Observations)

        loop = asyncio.get_running_loop()
        extraction_result = await loop.run_in_executor(
            self.executor,
            lambda: runnable.invoke({"text": dialogue}),
        )

        return extraction_result

    def namespace_exists(self, namespace):
        namespaces = self.index.describe_index_stats()["namespaces"]
        return namespace in namespaces

    async def save(self, user_id: int, observations: Observations):
        observation_dicts = observations.as_dicts()

        print("=== SAVED OBSERVATIONS ===")
        pprint.pprint(observation_dicts)

        if len(observation_dicts) == 0:
            print("No observations!")
            return

        texts_for_embedding = [observation["text"] for observation in observation_dicts]

        embedded_observations = await self.llm.embed(
            input_texts=texts_for_embedding, return_all=True
        )

        zipped_observations = zip(embedded_observations, observation_dicts)

        vectors = [
            {
                "id": f"{user_id}-{str(uuid.uuid4())[:8]}",
                "values": embedding,
                "metadata": observation_dict,
            }
            for embedding, observation_dict in zipped_observations
        ]

        self.index.upsert(vectors=vectors, namespace=f"user-{user_id}")

    async def query(self, user_id: int, messages: List[StandardChatMessage]):
        embedding = await self.llm.embed([messages_to_dialogue_string(messages)])

        response = self.index.query(
            vector=embedding,
            top_k=10,
            include_metadata=True,
            namespace=f"user-{user_id}",
        )

        return filter_pinecone_results_by_score(
            response["matches"], self.score_threshold
        )

    async def query(self, user_id: int, query_str: str):
        embedding = await self.llm.embed([query_str])

        response = self.index.query(
            vector=embedding,
            top_k=10,
            include_metadata=True,
            namespace=f"user-{user_id}",
        )

        return filter_pinecone_results_by_score(
            response["matches"], self.score_threshold
        )

    def format_results(self, results):
        formatted_observations = (
            "\n".join(f"- {obs['metadata']['text']}" for obs in results)
            if results
            else "No observations."
        )

        return formatted_observations

    async def get(self, user_id: int):
        observation_vectors = await self.query_all(user_id)
        observations = [
            {"id": observation["id"], "content": observation["metadata"]["text"]}
            for observation in observation_vectors
        ]

        return observations

    async def query_all(self, user_id: int):
        embedding = [0 for _ in range(1024)]

        response = self.index.query(
            vector=embedding,
            top_k=1000,
            include_metadata=True,
            namespace=f"user-{user_id}",
        )

        return response["matches"]

    async def delete_all(self, user_id: int):
        namespace = f"user-{user_id}"

        if self.namespace_exists(namespace):
            self.index.delete(namespace=f"user-{user_id}", delete_all=True)

    async def delete(self, user_id: int, row_id: str):
        namespace = f"user-{user_id}"

        if self.namespace_exists(namespace):
            self.index.delete(ids=[row_id], namespace=f"user-{user_id}")
