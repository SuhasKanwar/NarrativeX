import sys
import os

from utils.logger import logger
from utils.exception import NarrativeXException
from langchain_nvidia_ai_endpoints import ChatNVIDIA
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder

from config.prompts import NEMOTRON_SYSTEM_PROMPT
from config.models import NEMOTRON
from config import NVIDIA_API_KEY

class Nemotron():
    def __init__(self, model_name: str):
        self.model_name = model_name
        self.system_prompt = NEMOTRON_SYSTEM_PROMPT
        try:
            self.llm = ChatNVIDIA(
                model=self.model_name,
                api_key=NVIDIA_API_KEY,
                temperature=NEMOTRON["TEMPERATURE"],
                top_p=NEMOTRON["TOP_P"],
                max_tokens=NEMOTRON["MAX_TOKENS"],
                model_kwargs={
                    "reasoning_budget": NEMOTRON["REASONING_BUDGET"],
                    "chat_template_kwargs": NEMOTRON["CHAT_TEMPLATE_KWARGS"]
                }
            )
            self.prompt_template = ChatPromptTemplate.from_messages([
                self.system_prompt,
                ("system", "Relevant context (may be partial):\n{context}"),
                MessagesPlaceholder(variable_name="history"),
                ("human", "{input}")
            ])
            self.chain = self.prompt_template | self.llm
        except Exception as e:
            logger.error(f"Error initializing Nemotron model: {str(e)}")
            raise NarrativeXException(f"Failed to initialize Nemotron model ({self.model_name})", sys)

    def generate_response(self, prompt: str, session_history: list) -> dict:
        try:
            history = session_history or []
            
            reasoning_content = ""
            final_content = ""
            
            for chunk in self.chain.stream({
                "history": history,
                "input": prompt,
                "context": "" # SUHAS: no context passed for now, need to be passed from the agents eventually
            }):
                if chunk.additional_kwargs and "reasoning_content" in chunk.additional_kwargs:
                    reasoning_content += chunk.additional_kwargs["reasoning_content"]
                final_content += chunk.content

            return {
                "text": final_content,
                "reasoning": reasoning_content
            }
        except Exception as e:
            logger.error(f"Error generating response: {str(e)}")
            raise NarrativeXException(f"Failed to generate response from Nemotron model ({self.model_name})", sys)