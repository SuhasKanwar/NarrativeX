import sys
from typing import Literal

from langchain_core.messages import HumanMessage
from langchain_nvidia_ai_endpoints import ChatNVIDIA
from pydantic import BaseModel

from config import NVIDIA_API_KEY
from config.models import ROUTER_MODEL
from config.prompts import ROUTER_MODEL_SYSTEM_PROMPT
from utils.exception import NarrativeXException
from utils.logger import logger


class RouteDecision(BaseModel):
    classification: Literal["narrative_analysis", "general"]
    reasoning: str


class ModelRouter:
    def __init__(self, client=None):
        self.model_name = ROUTER_MODEL["MODEL_NAME"]
        self.system_prompt = ROUTER_MODEL_SYSTEM_PROMPT
        model = client or ChatNVIDIA(
            model=self.model_name,
            api_key=NVIDIA_API_KEY,
            temperature=1.0,
            top_p=0.95,
            max_completion_tokens=256,
        )
        self.router_model = model.with_structured_output(RouteDecision)

    def route_request(self, prompt: str) -> tuple[str, str]:
        try:
            response = self.router_model.invoke([
                self.system_prompt,
                HumanMessage(content=prompt),
            ])
            if isinstance(response, dict):
                return response["classification"], response.get("reasoning", "")
            return response.classification, response.reasoning
        except Exception as error:
            logger.error(f"Error routing request: {error}")
            raise NarrativeXException(
                f"Failed to route request in NVIDIA model ({self.model_name})", sys
            )
