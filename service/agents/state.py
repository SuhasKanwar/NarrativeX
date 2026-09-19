from typing import Any, TypedDict

class AgentState(TypedDict):
    query: str
    session_history: list[dict]
    classification: str
    reasoning: str
    source_context: str
    final_response: Any
    iterations: int