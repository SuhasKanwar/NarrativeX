export type EvidenceNode = {
  id: string;
  kind: "claim" | "comparison" | "news" | "social";
  label: string;
  detail: string;
  status?: string;
  url?: string;
  publisher?: string;
  publishedAt?: string;
};
export type EvidenceEdge = { source: string; target: string; relation: string; detail?: string };
export type EvidenceGraph = {
  version: 1;
  nodes: EvidenceNode[];
  edges: EvidenceEdge[];
  gaps: { node: string; reason: string; action: string }[];
};

export function readResearchArtifact(content: string): { report: string; graph: EvidenceGraph | null } {
  const block = /^```narrativex-graph\r?\n([\s\S]*?)\r?\n```\s*$/m;
  const match = content.match(block);
  if (!match) return { report: content, graph: null };
  const report = content.replace(block, "").trim();
  try {
    const graph = JSON.parse(match[1]);
    if (graph.version !== 1 || !Array.isArray(graph.nodes) || graph.nodes.length > 200 ||
        !Array.isArray(graph.edges) || graph.edges.length > 2000 || !Array.isArray(graph.gaps)) {
      return { report, graph: null };
    }
    const text = (value: unknown) => typeof value === "string";
    if (!graph.nodes.every((node: EvidenceNode) => node && text(node.id) && text(node.label) &&
        text(node.detail) && ["claim", "comparison", "news", "social"].includes(node.kind) &&
        [node.status, node.url, node.publisher, node.publishedAt].every(value => value === undefined || text(value)))) {
      return { report, graph: null };
    }
    const ids = new Set(graph.nodes.map((node: EvidenceNode) => node.id));
    if (ids.size !== graph.nodes.length ||
        !graph.edges.every((edge: EvidenceEdge) => edge && ids.has(edge.source) && ids.has(edge.target) &&
          text(edge.relation) && (edge.detail === undefined || text(edge.detail))) ||
        !graph.gaps.every((gap: EvidenceGraph["gaps"][number]) => gap && ids.has(gap.node) && text(gap.reason) && text(gap.action))) {
      return { report, graph: null };
    }
    return { report, graph };
  } catch {
    return { report, graph: null };
  }
}
