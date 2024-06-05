import os
from typing import List
from langchain_openai import ChatOpenAI
from langchain_mistralai import ChatMistralAI
from dotenv import load_dotenv, find_dotenv

load_dotenv(find_dotenv())


def get_client_from_model(model: str):
    _oa_api_key = os.getenv("OPENAI_API_KEY")
    _ms_api_key = os.getenv("MISTRAL_API_KEY")

    if model in ["gpt-4o", "gpt-4-turbo", "gpt-4", "gpt-3.5-turbo"]:
        return ChatOpenAI(
            model=model,
            temperature=0,
            api_key=_oa_api_key,
        )
    elif model in [
        "mistral-large-latest",
        "mistral-medium-latest",
        "mistral-small-latest",
        "open-mixtral-8x22b",
        "open-mixtral-8x7b",
        "open-mistral-7b",
    ]:
        return ChatMistralAI(model=model, temperature=0, api_key=_ms_api_key)
    else:
        raise ValueError(f"Unsupported model: {model}")
