import os

LLAMA = {
    "MODEL_NAME": os.getenv("LLAMA_MODEL", "llama-3.3-70b-versatile"),
}

NEMOTRON = {
    "MODEL_NAME": os.getenv("NEMOTRON_MODEL", "nvidia/nemotron-3-ultra-550b-a55b"),
    "TEMPERATURE": float(os.getenv("NEMOTRON_TEMPERATURE", "0.2")),
    "TOP_P": float(os.getenv("NEMOTRON_TOP_P", "0.95")),
    "MAX_TOKENS": int(os.getenv("NEMOTRON_MAX_TOKENS", "4096")),
    "REASONING_BUDGET": int(os.getenv("NEMOTRON_REASONING_BUDGET", "2048")),
    "CHAT_TEMPLATE_KWARGS": {"enable_thinking": True}
}

ROUTER_MODEL = {
    "MODEL_NAME": os.getenv("ROUTER_MODEL", "openai/gpt-oss-120b"),
    "RESPONSE_FORMAT": {
        "type": "json_schema",
        "json_schema": {
            "name": "RouterOutput",
            "schema": {
                "type": "object",
                "properties": {
                    "classification": {
                        "type": "string",
                        "enum": ["narrative_analysis", "general"],
                        "description": "Use 'narrative_analysis' for claim, evidence, misinformation, narrative, propagation, or source-analysis requests. Otherwise use 'general'."
                    },
                    "reasoning": {
                        "type": "string",
                        "description": "Brief reasoning for why this classification was chosen."
                    }
                },
                "required": ["classification", "reasoning"],
                "additionalProperties": False
            }
        }
    }
}
