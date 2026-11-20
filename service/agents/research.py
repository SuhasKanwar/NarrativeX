from concurrent.futures import ThreadPoolExecutor
from typing import Any

from langchain_core.messages import HumanMessage, SystemMessage
from langchain_nvidia_ai_endpoints import ChatNVIDIA

from config import NVIDIA_API_KEY
from config.models import RESEARCH_MODEL
from tools.server import search_news, search_social_posts

TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "compare_news_and_social",
            "description": (
                "Collect both recent news articles and social-media posts for a cross-source "
                "narrative comparison. Always provide parameters for both searches."
            ),
            "parameters": {
                "type": "object",
                "properties": {
                    "topic": {"type": "string", "minLength": 1, "maxLength": 100},
                    "focus_topic": {
                        "type": "string", "maxLength": 80,
                        "description": "Optional focused issue for a broad topic, e.g. tariffs for global trade. Empty for a specific question.",
                    },
                    "news_page_size": {"type": "integer", "minimum": 4, "maximum": 20},
                    "language": {"type": ["string", "null"], "default": "en"},
                    "sort_by": {
                        "type": ["string", "null"],
                        "enum": ["relevancy", "popularity", "publishedAt", None],
                    },
                    "social_limit": {"type": "integer", "minimum": 4, "maximum": 25},
                },
                "required": [
                    "topic", "news_page_size", "language", "sort_by", "social_limit",
                ],
                "additionalProperties": False,
            },
        },
    },
]


class ResearchAgent:
    def __init__(self, client: Any = None):
        self.client = client or ChatNVIDIA(
            model=RESEARCH_MODEL["MODEL_NAME"],
            api_key=NVIDIA_API_KEY,
            temperature=1.0,
            top_p=0.95,
            max_completion_tokens=1024,
            timeout=20,
            model_kwargs={
                "chat_template_kwargs": {
                    "enable_thinking": False,
                    "force_nonempty_content": True,
                }
            },
        )

    def collect(self, query: str, access_token: str | None) -> dict[str, Any]:
        messages: list[Any] = [
            SystemMessage(content=(
                "You collect evidence for NarrativeX. Choose precise API parameters from the user's "
                "request. Call the comparison tool exactly once so every investigation searches both news "
                "and social sources. Use closely aligned search terms for a fair comparison, include Reddit, "
                "Bluesky, and Mastodon, and prefer recent relevant results. Never answer from memory."
                " Use sort_by=relevancy for comparison questions unless the user explicitly requests latest news."
                " Supply the core topic as a short plain-text phrase, without quotes or Boolean operators."
                " For broad questions about competing claims, add one focus_topic naming a concrete policy"
                " or disputed mechanism within that topic. Use a phrase likely to occur in public discussion."
            )),
            HumanMessage(content=query),
        ]
        message = self.client.bind_tools(
            TOOLS,
            tool_choice="compare_news_and_social",
        ).invoke(messages)
        if not message.tool_calls:
            error = "The research planner did not produce comparison parameters"
            return {"query": query, "calls": [
                {"tool": "search_news", "error": error},
                {"tool": "search_social_posts", "error": error},
            ]}
        call = message.tool_calls[0]
        topics = _search_topics(call["args"])
        calls = _execute_comparison(call["name"], call["args"], topics, access_token)
        return {"query": query, "topic": topics[0] if topics else "", "topics": topics, "calls": calls}


def _search_topics(arguments: dict[str, Any]) -> list[str]:
    topics = {}
    for key in ("topic", "focus_topic"):
        value = arguments.get(key)
        if isinstance(value, str) and (topic := value.replace('"', "").strip()):
            topics.setdefault(topic.casefold(), topic)
    return list(topics.values())


def _execute_comparison(name: str, arguments: dict[str, Any], topics: list[str], access_token: str | None) -> list[dict[str, Any]]:
    if name != "compare_news_and_social" or not topics:
        error = "The research planner did not supply a valid comparison search"
        return [
            {"tool": "search_news", "error": error},
            {"tool": "search_social_posts", "error": error},
        ]
    tasks = [
        ("search_news", search_news, {
            "query": " OR ".join(f'"{topic}"' if " " in topic else topic for topic in topics),
            "page_size": arguments.get("news_page_size", 10),
            "language": arguments.get("language") or "en",
            "sort_by": arguments.get("sort_by") or "relevancy",
        }),
        ("search_social_posts", search_social_posts, {
            "topics": topics,
            "platforms": None,
            "limit": arguments.get("social_limit", 10),
        }),
    ]
    with ThreadPoolExecutor(max_workers=2) as executor:
        return list(executor.map(
            lambda task: _call_server_tool(*task, access_token),
            tasks,
        ))


def _call_server_tool(
    name: str,
    tool: Any,
    arguments: dict[str, Any],
    access_token: str | None,
) -> dict[str, Any]:
    try:
        data = tool(access_token=access_token, **arguments)
        return {"tool": name, "arguments": arguments, "data": data}
    except Exception as error:
        return {"tool": name, "arguments": arguments, "error": str(error)}
