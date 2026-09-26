export const desk = {
  eyebrow: "YOUR WORLD, IN CONTEXT",
  title: "The intelligence desk.",
  description:
    "Follow the headlines. Trace the connections. Find your own perspective.",
  search: "Search a topic, place, or developing story…",
  refresh: "Refresh feeds",
  newsTitle: "Across the headlines",
  eventsTitle: "World watch",
  socialTitle: "The public conversation",
  categories: [
    {
      id: "world",
      label: "World affairs",
      query: "international diplomacy geopolitics",
    },
    { id: "economy", label: "Economy", query: "global economy trade markets" },
    {
      id: "technology",
      label: "Technology",
      query: "technology artificial intelligence",
    },
    { id: "climate", label: "Climate", query: "climate energy environment" },
    { id: "science", label: "Science", query: "science research discovery" },
    { id: "health", label: "Health", query: "public health medical research" },
  ],
};
export const bot = {
  eyebrow: "NARRATIVEX / RESEARCH STUDIO",
  title: "Every story has\nanother layer.",
  description:
    "Bring a question. Explore the sources, compare the claims, and build a clearer picture.",
  placeholder: "What would you like to understand?",
  newBrief: "New investigation",
  suggestions: [
    {
      tag: "CONNECT",
      title: "What’s changing in global trade?",
      prompt:
        "Compare recent news and social posts about global trade. Identify competing claims and what evidence is missing.",
    },
    {
      tag: "COMPARE",
      title: "One topic. Different perspectives.",
      prompt:
        "Compare news and social coverage of AI regulation. Where do the narratives agree and disagree?",
    },
    {
      tag: "TRACE",
      title: "Follow the energy conversation.",
      prompt:
        "Examine recent energy policy news and social posts. Describe changes in framing and distinguish evidence from speculation.",
    },
  ],
  pending: "Collecting sources and comparing perspectives…",
  notice:
    "Analysis can be incomplete. Open the original sources and check important claims.",
};
