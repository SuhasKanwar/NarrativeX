from typing import TypedDict, Any

class AgentState(TypedDict):
    query: str
    session_history: list[dict]
    classification: str
    reasoning: str
    metrics_data: str
    final_response: Any
    iterations: int