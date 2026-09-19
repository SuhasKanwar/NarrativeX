from pydantic import BaseModel, Field

from typing import Any

class QueryRequest(BaseModel):
    query: str
    session_history: list[dict] = Field(default_factory=list)

class QueryResponse(BaseModel):
    success: bool
    data: Any
    message: str