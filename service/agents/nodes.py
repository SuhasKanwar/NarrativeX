from agents.state import AgentState
from models.nemotron import Nemotron
from models.llama import Llama
from services.router import ModelRouter
from tools.research import execute_search
from config.agent import AGENT_CONFIG
from config.models import NEMOTRON, ROUTER_MODEL, LLAMA
from tenacity import retry, stop_after_attempt, wait_fixed
from utils.logger import logger

nemotron_client = Nemotron(model_name=NEMOTRON["MODEL_NAME"])
router_client = ModelRouter(model_name=ROUTER_MODEL["MODEL_NAME"])
llama_client = Llama(model_name=LLAMA["MODEL_NAME"])

@retry(
    stop=stop_after_attempt(AGENT_CONFIG["RATE_LIMIT_RETRIES"]), 
    wait=wait_fixed(AGENT_CONFIG["RATE_LIMIT_DELAY_SECONDS"])
)
def generate_response_with_retry(prompt: str, session_history: list) -> dict:
    return nemotron_client.generate_response(prompt, session_history)

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
    search_query = f"{query} claims evidence sources news social media"
    source_context = execute_search(search_query)

    return {"source_context": source_context}

def analysis_node(state: AgentState) -> dict:
    query = state.get("query", "")
    source_context = state.get("source_context", "")
    session_history = state.get("session_history", [])
    
    prompt = (
        f"The following search results are source leads, not verified evidence:\n{source_context}\n\n"
        f"Analyze the request: '{query}'. Extract the relevant claims, distinguish what "
        "the sources report from what is actually supported, and preserve uncertainty. "
        "Do not claim that a search result proves a claim."
    )
    
    try:
        response = generate_response_with_retry(prompt, session_history)
        
        reasoning = response.get("reasoning", "")
        text = response.get("text", "")
        
        analysis = {
            "reasoning": reasoning,
            "response": text
        }
            
    except Exception as e:
        logger.error(f"Analysis node failed: {e}")
        analysis = {
            "reasoning": "",
            "response": f"Failed to analyze due to model error: {e}"
        }
        
    return {"final_response": analysis}