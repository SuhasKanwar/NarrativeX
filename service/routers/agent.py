from fastapi import APIRouter, HTTPException
from schemas.agent import QueryRequest, QueryResponse
from agents.graph import agent_app
from utils.logger import logger

router = APIRouter(prefix="/api/agent", tags=["Agent"])

@router.post("/query", response_model=QueryResponse)
async def execute_query(request: QueryRequest):
    try:
        initial_state = {
            "query": request.query,
            "session_history": request.session_history,
            "classification": "",
            "reasoning": "",
            "metrics_data": "",
            "final_response": "",
            "iterations": 0
        }
        
        logger.info(f"Starting agent graph for query: {request.query}")
        result = agent_app.invoke(initial_state)
        
        return QueryResponse(
            success=True,
            data=result.get("final_response", {}),
            message="Query executed successfully."
        )
        
    except Exception as e:
        logger.error(f"Agent router error: {e}")
        raise HTTPException(status_code=500, detail=str(e))