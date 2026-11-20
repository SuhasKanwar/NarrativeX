"use client";

import { useId, useState } from "react";
import Link from "next/link";
import { Download, Network } from "lucide-react";
import type { EvidenceGraph, EvidenceNode } from "@/lib/research-graph";
import { safeUrl } from "@/lib/workspace";
import { pushToast } from "@/lib/toasts";
import ComparisonGraph from "./ComparisonGraph";

const copy = {
  title: "Evidence workspace",
  subtitle: "Trace a finding, inspect its sources, and decide what to verify next.",
  note: "Citation edges record retrieved references. Claim relationships are model inferences, not observed propagation or proof of causation. Node size does not indicate credibility.",
  inference: "Inference graph", graph: "Source network", gaps: "Verification queue", download: "Export graph JSON",
  search: "Find a claim or source", empty: "No matching nodes. Clear the search to inspect all evidence.",
  noGaps: "No citation gaps detected. Review factual support and source independence manually.",
  legend: "News · left / Findings · centre / Social · right. Select a node to inspect its connections.",
  excerpts: "Evidence excerpts", attribution: "Quotation presence checked against the retrieved snapshot. Stance remains a model interpretation.",
};
const kindClass: Record<EvidenceNode["kind"], string> = {
  news: "text-focus", social: "text-sage", claim: "text-accent", comparison: "text-foreground",
};

export default function EvidenceExplorer({ graph, onInvestigate }: { graph: EvidenceGraph; onInvestigate: (question: string) => void }) {
  const comparisons = graph.nodes.filter(node => node.kind === "comparison" && node.newsPosition !== undefined)
    .sort((a, b) => Number(a.status === "insufficient_evidence") - Number(b.status === "insufficient_evidence"));
  const [selectedId, setSelectedId] = useState(comparisons[0]?.id || graph.nodes[0]?.id || "");
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState(comparisons.length ? "inference" : "graph");
  const marker = useId();
  const selected = graph.nodes.find(node => node.id === selectedId);
  const connected = graph.edges.filter(edge => edge.source === selectedId || edge.target === selectedId);
  const visible = graph.nodes.filter(node => `${node.label} ${node.publisher || ""}`.toLowerCase().includes(search.toLowerCase()));
  const neighbours = new Set([selectedId, ...connected.flatMap(edge => [edge.source, edge.target])]);
  const columns = [graph.nodes.filter(node => node.kind === "news"), graph.nodes.filter(node => node.kind === "claim" || node.kind === "comparison"), graph.nodes.filter(node => node.kind === "social")];
  const height = Math.max(240, ...columns.map(nodes => nodes.length * 72 + 64));
  const positions = new Map(columns.flatMap((nodes, column) => nodes.map((node, index) => [node.id, { x: 120 + column * 280, y: 48 + index * 72 }] as const)));
  const sourceUrl = selected?.url && safeUrl(selected.url);

  function download() {
    const url = URL.createObjectURL(new Blob([JSON.stringify(graph, null, 2)], { type: "application/json" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "narrativex-evidence-graph.json";
    link.click();
    URL.revokeObjectURL(url);
    pushToast("success", "Evidence graph exported.");
  }

  return (
    <section aria-label={copy.title} className="m-4 rounded-xl border border-border bg-surface p-4 sm:m-6 sm:p-5">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div><h2 className="flex items-center gap-2 text-lg"><Network size={18} className="text-accent" />{copy.title}</h2><p className="mt-1 text-xs leading-6 text-muted">{copy.subtitle}</p></div>
        <button type="button" onClick={download} className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-xs transition hover:bg-surface-raised"><Download size={14} />{copy.download}</button>
      </header>
      <p className="mt-3 text-xs leading-6 text-muted">{graph.nodes.length} nodes · {graph.edges.length} directed links · {graph.gaps.length} verification tasks</p>
      <div className="my-4 flex flex-wrap gap-2" aria-label="Workspace views">
        {(["inference", "graph", "gaps"] as const).filter(value =>
          (value !== "inference" || comparisons.length) && (value !== "gaps" || graph.state !== "incomplete")
        ).map(value => <button key={value} type="button" aria-pressed={tab === value} onClick={() => setTab(value)} className={`rounded-lg px-3 py-2 text-xs transition ${tab === value ? "bg-foreground text-background" : "bg-surface-raised text-muted"}`}>{copy[value]}</button>)}
      </div>
      {tab === "inference" ? <ComparisonGraph graph={graph} findings={comparisons} /> : tab === "gaps" ? (
        <ul className="space-y-3">
          {!graph.gaps.length && <li className="text-sm text-muted">{copy.noGaps}</li>}
          {graph.gaps.map((gap, index) => <li key={index} className="rounded-lg border border-border bg-surface-raised p-4">
            <button type="button" onClick={() => { setSelectedId(gap.node); setTab("graph"); }} className="text-left text-sm font-medium underline decoration-border underline-offset-4">{graph.nodes.find(node => node.id === gap.node)?.label}</button>
            <p className="mt-2 text-xs font-semibold text-accent">{gap.reason}</p><p className="mt-1 text-xs leading-6 text-muted">{gap.action}</p>
            <button type="button" onClick={() => onInvestigate(`Investigate this claim with news and social evidence: ${graph.nodes.find(node => node.id === gap.node)?.label}. ${gap.action}`)} className="mt-3 rounded-lg border border-border px-3 py-2 text-xs transition hover:bg-surface">Draft follow-up investigation</button>
          </li>)}
        </ul>
      ) : (
        <div className="grid gap-5 xl:grid-cols-[1fr_280px]">
          <div className="min-w-0">
            <label className="block text-xs text-muted">{copy.search}<input value={search} onChange={event => setSearch(event.target.value)} className="mt-2 w-full rounded-lg border border-border bg-surface-raised px-3 py-2 text-sm text-foreground" /></label>
            <p className="my-3 text-xs leading-5 text-muted">{copy.legend}</p>
            <div className="max-h-[420px] overflow-auto rounded-lg border border-border bg-surface-raised">
              <svg viewBox={`0 0 800 ${height}`} className="min-w-[640px] w-full" aria-label="Claim and source connections">
                <defs><marker id={marker} markerWidth="7" markerHeight="7" refX="16" refY="3" orient="auto"><path d="M0,0 L0,6 L6,3 z" className="fill-muted" /></marker></defs>
                {graph.edges.map((edge, index) => {
                  const from = positions.get(edge.source)!; const to = positions.get(edge.target)!;
                  const active = edge.source === selectedId || edge.target === selectedId;
                  return <line key={index} x1={from.x} y1={from.y} x2={to.x} y2={to.y} markerEnd={`url(#${marker})`} className={`stroke-muted transition-opacity duration-300 ${active ? "opacity-80" : "opacity-15"}`} strokeDasharray={edge.relation === "counter_cites" || edge.relation === "contradicts" ? "5 4" : undefined}><title>{edge.relation.replaceAll("_", " ")}</title></line>;
                })}
                {graph.nodes.map(node => {
                  const position = positions.get(node.id)!;
                  const match = visible.includes(node);
                  return <g key={node.id} role="button" tabIndex={0} aria-label={`${node.kind}: ${node.label}`} aria-pressed={selectedId === node.id} onClick={() => setSelectedId(node.id)} onKeyDown={event => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); setSelectedId(node.id); } }} className={`cursor-pointer outline-focus transition-opacity duration-300 ${kindClass[node.kind]} ${match && neighbours.has(node.id) ? "opacity-100" : "opacity-35"}`}>
                    <title>{node.label}</title><circle cx={position.x} cy={position.y} r={selectedId === node.id ? 14 : 10} fill="currentColor" />
                    <text x={position.x} y={position.y + 29} textAnchor="middle" className="fill-foreground text-[10px]">{node.label.slice(0, 32)}{node.label.length > 32 ? "…" : ""}</text>
                  </g>;
                })}
              </svg>
            </div>
            <div className="mt-3 flex max-h-32 flex-wrap gap-2 overflow-auto" aria-label="Select evidence node">
              {!visible.length && <p className="text-xs text-muted">{copy.empty}</p>}
              {visible.map(node => <button key={node.id} type="button" aria-pressed={selectedId === node.id} onClick={() => setSelectedId(node.id)} className={`max-w-full truncate rounded-lg border px-3 py-2 text-xs transition ${selectedId === node.id ? "border-accent bg-surface-raised" : "border-border"}`}>{node.kind}: {node.label}</button>)}
            </div>
          </div>
          <aside aria-live="polite" className="min-w-0 rounded-lg border border-border bg-surface-raised p-4">
            {selected && <><p className={`text-xs uppercase ${kindClass[selected.kind]}`}>{selected.kind} {selected.status?.replaceAll("_", " ")}</p><h3 className="mt-3 text-sm font-semibold">{selected.label}</h3><p className="mt-3 whitespace-pre-line text-xs leading-6 text-muted">{selected.detail}</p>
              {!!selected.passages?.length && <div className="mt-4 space-y-3"><h4 className="text-xs font-semibold">{copy.excerpts}</h4><p className="text-xs leading-5 text-muted">{copy.attribution}</p>{selected.passages.map((passage, index) => <blockquote key={index} className="border-l-2 border-accent pl-3 text-xs leading-6"><p>{passage.quote}</p><p className="text-muted">{passage.stance}</p>{safeUrl(passage.url) && <Link href={safeUrl(passage.url)!} target="_blank" rel="noopener noreferrer" className="text-focus underline">Inspect cited source</Link>}</blockquote>)}</div>}
              {selected.publisher && <p className="mt-3 text-xs text-muted">{selected.publisher} · {selected.publishedAt || "Date unavailable"}</p>}
              {sourceUrl && <Link href={sourceUrl} target="_blank" rel="noopener noreferrer" className="mt-3 inline-block text-xs text-focus underline">Inspect original source</Link>}
              <h4 className="mt-5 text-xs font-semibold">Connections ({connected.length})</h4><ul className="mt-2 space-y-2">{connected.map((edge, index) => {
                const other = graph.nodes.find(node => node.id === (edge.source === selectedId ? edge.target : edge.source))!;
                return <li key={index}><button type="button" onClick={() => setSelectedId(other.id)} className="text-left text-xs leading-5 text-muted hover:text-foreground"><span className="font-semibold">{edge.source === selectedId ? "→" : "←"} {edge.relation.replaceAll("_", " ")}</span> · {other.label}</button>{edge.verification && <p className="text-xs text-accent">{edge.verification.replaceAll("_", " ")}</p>}{edge.detail && <p className="text-xs leading-5 text-muted">{edge.detail}</p>}</li>;
              })}</ul></>}
          </aside>
        </div>
      )}
      <p className="mt-4 border-t border-border pt-3 text-xs leading-6 text-muted">{copy.note}</p>
    </section>
  );
}
