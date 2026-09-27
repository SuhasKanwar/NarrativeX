import sys

from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_groq import ChatGroq

from config import GROQ_API_KEY
from config.models import GPT_OSS
from config.prompts import GPT_OSS_SYSTEM_PROMPT
from utils.exception import NarrativeXException
from utils.logger import logger


class GPTOSS:
    def __init__(self, client=None):
        self.model_name = GPT_OSS["MODEL_NAME"]
        try:
            self.llm = client or ChatGroq(
                groq_api_key=GROQ_API_KEY,
                model_name=self.model_name,
            )
            self.prompt_template = ChatPromptTemplate.from_messages([
                GPT_OSS_SYSTEM_PROMPT,
                ("system", "Relevant context (may be partial):\n{context}"),
                MessagesPlaceholder(variable_name="history"),
                ("human", "{input}"),
            ])
            self.chain = self.prompt_template | self.llm
        except Exception as error:
            logger.error(f"Error initializing GPT-OSS model: {error}")
            raise NarrativeXException(
                f"Failed to initialize GPT-OSS model ({self.model_name})", sys
            )

    def generate_response(self, prompt: str, session_history: list) -> dict:
        try:
            response = self.chain.invoke({
                "history": session_history or [],
                "input": prompt,
                "context": "",
            })
            text = response.content if hasattr(response, "content") else str(response)
            return {"text": text}
        except Exception as error:
            logger.error(f"Error generating GPT-OSS response: {error}")
            raise NarrativeXException(
                f"Failed to generate response from GPT-OSS ({self.model_name})", sys
            )
