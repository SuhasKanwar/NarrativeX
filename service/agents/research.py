import json
from typing import Any

from groq import Groq

from config import GROQ_API_KEY
from config.agent import AGENT_CONFIG
from config.models import RESEARCH_MODEL
from tools.server import search_news, search_social_posts

TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "search_news",
            "description": "Search recent news articles through the NarrativeX server.",
            "parameters": {
                "type": "object",
                "properties": {
                    "query": {"type": "string", "minLength": 1, "maxLength": 200},
                    "page_size": {"type": "integer", "minimum": 1, "maximum": 20},
                    "language": {"type": "string", "default": "en"},
                    "sort_by": {
                        "type": "string",
                        "enum": ["relevancy", "popularity", "publishedAt"],
                    },
                },
                "required": ["query"],
                "additionalProperties": False,
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "search_social_posts",
            "description": "Search Reddit, Bluesky, and Hacker News through the NarrativeX server.",
            "parameters": {
                "type": "object",
                "properties": {
                    "topics": {
                        "type": "array",
                        "items": {"type": "string", "minLength": 1, "maxLength": 100},
                        "minItems": 1,
                        "maxItems": 10,
                    },
                    "platforms": {
                        "type": "array",
                        "items": {"type": "string", "enum": ["reddit", "bluesky", "hackernews"]},
                        "minItems": 1,
                    },
                    "limit": {"type": "integer", "minimum": 1, "maximum": 25},
                },
                "required": ["topics"],
                "additionalProperties": False,
            },
        },
    },
]


class ResearchAgent:
    def __init__(self, client: Any = None):
        self.client = client or Groq(api_key=GROQ_API_KEY)

    def collect(self, query: str, access_token: str | None) -> dict[str, Any]:
        messages: list[Any] = [
            {
                "role": "system",
                "content": (
                    "You collect evidence for NarrativeX. Choose precise API parameters from the user's "
                    "request. For narrative analysis, search both news and social sources unless the user "
                    "explicitly limits the source type. Prefer recent, relevant results and stop when the "
                    "available calls are sufficient. Never answer from memory."
                ),
            },
            {"role": "user", "content": query},
        ]
        calls: list[dict[str, Any]] = []

        for iteration in range(AGENT_CONFIG["MAX_TOOL_CALLS"]):
            response = self.client.chat.completions.create(
                model=RESEARCH_MODEL["MODEL_NAME"],
                messages=messages,
                tools=TOOLS,
                tool_choice="required" if iteration == 0 else "auto",
                parallel_tool_calls=False,
                reasoning_effort="low",
            )
            message = response.choices[0].message
            messages.append(message)
            if not message.tool_calls:
                break

            for tool_call in message.tool_calls:
                name = tool_call.function.name
                try:
                    arguments = json.loads(tool_call.function.arguments)
                    if name == "search_news":
                        data = search_news(access_token=access_token, **arguments)
                    elif name == "search_social_posts":
                        data = search_social_posts(access_token=access_token, **arguments)
                    else:
                        raise ValueError(f"Unknown tool: {name}")
                    result = {"tool": name, "arguments": arguments, "data": data}
                except Exception as error:
                    result = {"tool": name, "error": str(error)}

                calls.append(result)
                messages.append({
                    "role": "tool",
                    "tool_call_id": tool_call.id,
                    "name": name,
                    "content": json.dumps(result, default=str),
                })

        return {"query": query, "calls": calls}
