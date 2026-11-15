import assert from "node:assert/strict";
import { test } from "node:test";
import { readResearchArtifact } from "../src/lib/research-graph";

test("saved graph survives parsing, and malformed/dangling graph data cannot reach the UI", () => {
  const graph = { version: 1, nodes: [{ id: "c1", kind: "claim", label: "Claim", detail: "Rationale" }], edges: [], gaps: [] };
  const brief = (value: unknown) => `# Brief\n\n\`\`\`narrativex-graph\n${JSON.stringify(value)}\n\`\`\``;
  assert.deepEqual(readResearchArtifact(brief(graph)), { report: "# Brief", graph });
  assert.equal(readResearchArtifact(brief({ ...graph, edges: [{ source: "c1", target: "missing", relation: "supports" }] })).graph, null);
  assert.equal(readResearchArtifact(brief({ ...graph, nodes: [null] })).graph, null);
  assert.equal(readResearchArtifact(brief({ ...graph, version: 2 })).graph, null);
  assert.deepEqual(readResearchArtifact("Older report"), { report: "Older report", graph: null });
});
