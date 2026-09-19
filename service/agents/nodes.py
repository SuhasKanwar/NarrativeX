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
    iterations = state.get("iterations", 0)
    
    if iterations >= AGENT_CONFIG["MAX_RECURSION_LIMIT"]:
        logger.warning("Max recursion limit reached for research_node.")
        return {"metrics_data": "Max iterations reached. Fetching halted to prevent infinite recursion."}
    
    search_query = f"Geopolitical event '{query}' global supply chain impacts metrics and reports"
    metrics = execute_search(search_query)
    
    return {"metrics_data": metrics, "iterations": iterations + 1}

def analysis_node(state: AgentState) -> dict:
    query = state.get("query", "")
    metrics = state.get("metrics_data", "")
    session_history = state.get("session_history", [])
    
    prompt = (
        f"Based on the following real metrics and internet reports:\n{metrics}\n\n"
        f"Address the user's query comprehensively: '{query}'. "
        f"Synthesize the provided data to give an accurate and objective response, ensuring you reference the metrics to support your points."
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