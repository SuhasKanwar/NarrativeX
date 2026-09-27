from langgraph.graph import StateGraph, END
from agents.state import AgentState
from agents.nodes import router_node, research_node, analysis_node, general_node

def route_query(state: AgentState):
    if state.get("classification") == "general":
        return "general"
    return "research"

def compile_graph():
    workflow = StateGraph(AgentState)
    
    workflow.add_node("router", router_node)
    workflow.add_node("general", general_node)
    workflow.add_node("research", research_node)
    workflow.add_node("analysis", analysis_node)
    
    workflow.set_entry_point("router")
    
    workflow.add_conditional_edges(
        "router",
        route_query,
        {
            "general": "general",
            "research": "research"
        }
    )
    
    workflow.add_edge("general", END)
    workflow.add_edge("research", "analysis")
    workflow.add_edge("analysis", END)
    
    return workflow.compile()

agent_app = compile_graph()
