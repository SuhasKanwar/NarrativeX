export function stripResearchArtifact(content: string): string {
  return content.replace(/^```narrativex-graph\r?\n[\s\S]*?\r?\n```\s*$/gm, "").trim();
}
