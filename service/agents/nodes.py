from functools import lru_cache

from agents.state import AgentState
from agents.research import ResearchAgent
from models.gpt_oss import GPTOSS
from services.router import ModelRouter
from services.evaluation import EvaluationService
from utils.logger import logger

@lru_cache(maxsize=1)
def _router() -> ModelRouter:
    return ModelRouter()


@lru_cache(maxsize=1)
def _general_model() -> GPTOSS:
    return GPTOSS()


@lru_cache(maxsize=1)
def _research_agent() -> ResearchAgent:
    return ResearchAgent()


@lru_cache(maxsize=1)
def _evaluation_service() -> EvaluationService:
    return EvaluationService()

def router_node(state: AgentState) -> dict:
    query = state.get("query", "")
    
    classification, reasoning = _router().route_request(query)
    logger.info(f"Graph router classified as: {classification} \n\n Reason: {reasoning}")
    
    return {"classification": classification, "reasoning": reasoning}

def general_node(state: AgentState) -> dict:
    query = state.get("query", "")
    reasoning = state.get("reasoning", "")
    session_history = state.get("session_history", [])
    
    try:
        response = _general_model().generate_response(query, session_history)
        analysis = {
            "reasoning": reasoning,
            "response": response.get("text", "")
        }
    except Exception as e:
        logger.error(f"General response node failed: {e}")
        analysis = {
            "reasoning": reasoning,
            "response": "The assistant is temporarily unavailable. Please retry your question."
        }
        
    return {"final_response": analysis}

def research_node(state: AgentState) -> dict:
    query = state.get("query", "")
    access_token = state.get("access_token")
    source_context = _research_agent().collect(query, access_token)

    return {"source_context": source_context}

def analysis_node(state: AgentState) -> dict:
    query = state.get("query", "")
    source_context = state.get("source_context", {})
    session_history = state.get("session_history", [])

    try:
        analysis = _evaluation_service().evaluate(query, source_context, session_history)
    except Exception as e:
        logger.error(f"Analysis node failed: {e}")
        analysis = _evaluation_service().fallback(source_context)
        
    return {"final_response": analysis}
