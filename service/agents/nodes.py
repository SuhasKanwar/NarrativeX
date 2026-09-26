from agents.state import AgentState
from agents.research import ResearchAgent
from models.llama import Llama
from services.router import ModelRouter
from services.evaluation import EvaluationService
from config.models import ROUTER_MODEL, LLAMA
from utils.logger import logger

router_client = ModelRouter(model_name=ROUTER_MODEL["MODEL_NAME"])
llama_client = Llama(model_name=LLAMA["MODEL_NAME"])
research_agent = ResearchAgent()
evaluation_service = EvaluationService()

def router_node(state: AgentState) -> dict:
    query = state.get("query", "")
    
    classification, reasoning = router_client.route_request(query)
    logger.info(f"Graph router classified as: {classification} \n\n Reason: {reasoning}")
    
    return {"classification": classification, "reasoning": reasoning}

def llama_node(state: AgentState) -> dict:
    query = state.get("query", "")
    reasoning = state.get("reasoning", "")
    session_history = state.get("session_history", [])
    
    try:
        response = llama_client.generate_response(query, session_history)
        analysis = {
            "reasoning": reasoning,
            "response": response.get("text", "")
        }
    except Exception as e:
        logger.error(f"Llama node failed: {e}")
        analysis = {
            "reasoning": reasoning,
            "response": f"Failed to analyze due to model error: {e}"
        }
        
    return {"final_response": analysis}

def research_node(state: AgentState) -> dict:
    query = state.get("query", "")
    access_token = state.get("access_token")
    source_context = research_agent.collect(query, access_token)

    return {"source_context": source_context}

def analysis_node(state: AgentState) -> dict:
    query = state.get("query", "")
    source_context = state.get("source_context", {})
    session_history = state.get("session_history", [])

    try:
        analysis = evaluation_service.evaluate(query, source_context, session_history)
    except Exception as e:
        logger.error(f"Analysis node failed: {e}")
        analysis = {
            "reasoning": "",
            "response": f"Failed to analyze due to model error: {e}"
        }
        
    return {"final_response": analysis}
