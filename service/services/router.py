import sys
import json

from groq import Groq

from utils.logger import logger
from utils.exception import NarrativeXException

from config.prompts import ROUTER_MODEL_SYSTEM_PROMPT
from config.models import ROUTER_MODEL
from config import GROQ_API_KEY

class ModelRouter:
    def __init__(self, model_name):
        self.model_name = model_name
        self.system_prompt = ROUTER_MODEL_SYSTEM_PROMPT
        self.router_model = Groq(api_key=GROQ_API_KEY)

    def route_request(self, prompt: str) -> tuple:
        try:
            response = self.router_model.chat.completions.create(
                model=self.model_name,
                messages=[
                    {"role": "system", "content": self.system_prompt.content},
                    {"role": "user", "content": prompt}
                ],
                response_format=ROUTER_MODEL["RESPONSE_FORMAT"]
            )

            response_content = json.loads(response.choices[0].message.content)

            classification = response_content.get("classification")
            reasoning = response_content.get("reasoning", "")

            return classification, reasoning
            
        except Exception as e:
            logger.error(f"Error routing request: {str(e)}")
            raise NarrativeXException(f"Failed to route request in Router model ({self.model_name})", sys)