import os

GROQ_GPT_OSS_MODEL = "openai/gpt-oss-120b"
NVIDIA_NEMOTRON_MODEL = "nvidia/nemotron-3-ultra-550b-a55b"
NVIDIA_EMBEDDING_MODEL = "nvidia/nemotron-3-embed-1b"

GPT_OSS = {"MODEL_NAME": GROQ_GPT_OSS_MODEL}
NEMOTRON = {
    "MODEL_NAME": NVIDIA_NEMOTRON_MODEL,
    "TEMPERATURE": float(os.getenv("NEMOTRON_TEMPERATURE", "1.0")),
    "TOP_P": float(os.getenv("NEMOTRON_TOP_P", "0.95")),
    "MAX_TOKENS": int(os.getenv("NEMOTRON_MAX_TOKENS", "4096")),
    "CHAT_TEMPLATE_KWARGS": {"enable_thinking": True, "force_nonempty_content": True},
}
ROUTER_MODEL = {"MODEL_NAME": NVIDIA_NEMOTRON_MODEL}
RESEARCH_MODEL = {"MODEL_NAME": NVIDIA_NEMOTRON_MODEL}
EMBEDDING_MODEL = {"MODEL_NAME": NVIDIA_EMBEDDING_MODEL}
