from typing import Any, TypedDict

class AgentState(TypedDict):
    query: str
    session_history: list[dict]
    access_token: str | None
    classification: str
    reasoning: str
    source_context: dict[str, Any]
    final_response: Any
    iterations: int
