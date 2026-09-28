import os

GROQ_GPT_OSS_MODEL = "openai/gpt-oss-120b"
NVIDIA_NEMOTRON_SUPER_MODEL = "nvidia/nemotron-3-super-120b-a12b"
NVIDIA_NEMOTRON_ULTRA_MODEL = "nvidia/nemotron-3-ultra-550b-a55b"
NVIDIA_EMBEDDING_MODEL = "nvidia/nemotron-3-embed-1b"

GPT_OSS = {"MODEL_NAME": GROQ_GPT_OSS_MODEL}
NEMOTRON = {
    "MODEL_NAME": NVIDIA_NEMOTRON_SUPER_MODEL,
    "TEMPERATURE": float(os.getenv("NEMOTRON_TEMPERATURE", "1.0")),
    "TOP_P": float(os.getenv("NEMOTRON_TOP_P", "0.95")),
    "MAX_TOKENS": int(os.getenv("NEMOTRON_MAX_TOKENS", "2048")),
    "CHAT_TEMPLATE_KWARGS": {"enable_thinking": False, "force_nonempty_content": True},
}
RESEARCH_MODEL = {"MODEL_NAME": NVIDIA_NEMOTRON_ULTRA_MODEL}
EMBEDDING_MODEL = {"MODEL_NAME": NVIDIA_EMBEDDING_MODEL}
