from typing import List, Dict
from models import StandardChatMessage
from langchain.schema import HumanMessage, SystemMessage, AIMessage, BaseMessage


def filter_pinecone_results_by_score(
    matches: List[Dict], score_threshold: float
) -> List[Dict]:
    filtered_matches = [match for match in matches if match["score"] >= score_threshold]
    return filtered_matches


def standard_to_langchain_msgs(
    messages: List[StandardChatMessage],
) -> List[BaseMessage]:
    formatted_messages = []

    for message in messages:
        role = message.role

        if role == "user":
            formatted_messages.append(HumanMessage(content=message.content))
        elif role == "assistant":
            formatted_messages.append(AIMessage(content=message.content))
        elif role == "system":
            formatted_messages.append(SystemMessage(content=message.content))

    return formatted_messages
