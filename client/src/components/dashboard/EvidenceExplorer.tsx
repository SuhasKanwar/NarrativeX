"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { Check, Download, Maximize2, Minimize2, Network } from "lucide-react";
import type { EvidenceGraph, EvidenceNode } from "@/lib/research-graph";
import { safeUrl } from "@/lib/workspace";
import { pushToast } from "@/lib/toasts";
import ComparisonGraph from "./ComparisonGraph";
import FullScreenDialog from "./FullScreenDialog";
import GraphCanvas from "./GraphCanvas";
import { Reveal } from "./Motion";

const copy = {
  title: "Evidence workspace",
  subtitle: "Trace a finding, inspect its sources, and decide what to verify next.",
  note: "Citation edges record retrieved references. Claim relationships are model inferences, not observed propagation or proof of causation. Node size does not indicate credibility.",
  inference: "Inference graph", graph: "Source network", gaps: "Verification queue", download: "Export graph JSON",
  search: "Find a claim or source", empty: "No matching nodes. Clear the search to inspect all evidence.",
  noGaps: "No citation gaps detected. Review factual support and source independence manually.",
  legend: "News · left / Findings · centre / Social · right. Select a node to inspect its connections.",
  excerpts: "Evidence excerpts", attribution: "Quotation presence checked against the retrieved snapshot. Stance remains a model interpretation.",
  expand: "Maximize graph", collapse: "Exit graph full screen", maximized: "Expanded evidence graph",
};
const kindClass: Record<EvidenceNode["kind"], string> = {
  news: "text-focus", social: "text-sage", claim: "text-accent", comparison: "text-foreground",
};

export default function EvidenceExplorer({ graph, onInvestigate }: { graph: EvidenceGraph; onInvestigate: (question: string) => void }) {
  const comparisons = graph.nodes.filter(node => node.kind === "comparison" && node.newsPosition !== undefined)
    .sort((a, b) => Number(a.status === "insufficient_evidence") - Number(b.status === "insufficient_evidence"));
  const [selectedId, setSelectedId] = useState(comparisons[0]?.id || graph.nodes[0]?.id || "");
  const [comparisonId, setComparisonId] = useState(comparisons[0]?.id || "");
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState(comparisons.length ? "inference" : "graph");
  const [expanded, setExpanded] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const selected = graph.nodes.find(node => node.id === selectedId);
  const connected = graph.edges.filter(edge => edge.source === selectedId || edge.target === selectedId);
  const visible = graph.nodes.filter(node => `${node.label} ${node.publisher || ""}`.toLowerCase().includes(search.toLowerCase()));
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

  const toolbar = (fullScreen: boolean) => (
      <header className={`flex shrink-0 flex-wrap items-start justify-between gap-3 ${fullScreen ? "border-b border-border bg-surface-raised px-4 py-3 sm:px-8" : ""}`}>
        <div>
          <h2 className="flex items-center gap-2 text-lg"><Network size={18} className="text-accent" />{copy.title}</h2>
          {!fullScreen && <p className="mt-1 text-xs leading-6 text-muted">{copy.subtitle}</p>}
        </div>
        <div className="flex items-center gap-2">
          <button type="button"
            onClick={() => fullScreen ? dialog.current?.close() : setExpanded(true)}
            aria-label={fullScreen ? copy.collapse : copy.expand}
            aria-haspopup={fullScreen ? undefined : "dialog"}
            title={fullScreen ? copy.collapse : copy.expand}
            className="group rounded-lg border border-border p-2 text-muted transition hover:border-focus hover:bg-surface-raised hover:text-focus"
          >
            {fullScreen ? <Minimize2 size={16} /> : <Maximize2 size={16} className="motion-safe:transition-transform motion-safe:group-hover:scale-115" />}
          </button>
          <button type="button" onClick={download} aria-label={copy.download} title={copy.download} className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-xs transition hover:border-focus hover:bg-surface-raised">
            <Download size={14} /><span className="hidden sm:inline">{copy.download}</span>
          </button>
        </div>
      </header>
  );

  const workspace = (fullScreen: boolean) => (
    <>
      <p className="mt-3 text-xs leading-6 text-muted">{graph.nodes.length} nodes · {graph.edges.length} directed links · {graph.gaps.length} verification tasks</p>
      <div className="my-4 flex flex-wrap gap-2" aria-label="Workspace views">
        {(["inference", "graph", "gaps"] as const).filter(value =>
          (value !== "inference" || comparisons.length) && (value !== "gaps" || graph.state !== "incomplete")
        ).map(value => <button key={value} type="button" aria-pressed={tab === value} onClick={() => setTab(value)} className={`rounded-lg px-3 py-2 text-xs transition ${tab === value ? "bg-foreground text-background" : "bg-surface-raised text-muted hover:bg-sage/35 hover:text-foreground"}`}>{copy[value]}</button>)}
      </div>
      <div key={tab} className="min-w-0 motion-safe:animate-graph-panel">
      {tab === "inference" ? <ComparisonGraph graph={graph} findings={comparisons} selectedId={comparisonId} onSelect={setComparisonId} /> : tab === "gaps" ? (
        <ul className="space-y-3">
          {!graph.gaps.length && <li className="text-sm text-muted">{copy.noGaps}</li>}
          {graph.gaps.map((gap, index) => <li key={index} className="rounded-lg border border-border bg-surface-raised p-4 transition-colors hover:border-accent">
            <button type="button" onClick={() => { setSelectedId(gap.node); setTab("graph"); }} className="text-left text-sm font-medium underline decoration-border underline-offset-4">{graph.nodes.find(node => node.id === gap.node)?.label}</button>
            <p className="mt-2 text-xs font-semibold text-accent">{gap.reason}</p><p className="mt-1 text-xs leading-6 text-muted">{gap.action}</p>
            <button type="button" onClick={() => {
              dialog.current?.close();
              onInvestigate(`Investigate this claim with news and social evidence: ${graph.nodes.find(node => node.id === gap.node)?.label}. ${gap.action}`);
            }} className="mt-3 rounded-lg border border-border px-3 py-2 text-xs transition hover:bg-surface">Draft follow-up investigation</button>
          </li>)}
        </ul>
      ) : (
        <div className={`grid items-start gap-5 ${fullScreen ? "lg:grid-cols-[minmax(0,1fr)_minmax(17rem,0.35fr)]" : "xl:grid-cols-[minmax(0,1fr)_280px]"}`}>
          <div className="min-w-0">
            <label className="block text-xs text-muted">{copy.search}<input value={search} onChange={event => setSearch(event.target.value)} className="mt-2 w-full rounded-lg border border-border bg-surface-raised px-3 py-2 text-sm text-foreground" /></label>
            <p className="my-3 text-xs leading-5 text-muted">{copy.legend}</p>
            <GraphCanvas graph={graph} visibleIds={new Set(visible.map(node => node.id))}
              selectedId={selectedId} onSelect={setSelectedId} expanded={fullScreen} />
            <div className="mt-3 flex max-h-32 flex-wrap gap-2 overflow-auto" aria-label="Select evidence node">
              {!visible.length && <p className="text-xs text-muted">{copy.empty}</p>}
              {visible.map(node => (
                <button key={node.id} type="button" aria-pressed={selectedId === node.id} onClick={() => setSelectedId(node.id)}
                  className={`group flex max-w-full items-center gap-2 rounded-lg border px-3 py-2 text-xs transition hover:border-focus hover:bg-surface-raised ${selectedId === node.id ? "border-accent bg-surface-raised" : "border-border"}`}>
                  <span className="truncate">{node.kind}: {node.label}</span>
                  <Check size={13} aria-hidden="true" className="text-focus opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 group-aria-pressed:opacity-100 motion-safe:transition-opacity" />
                </button>
              ))}
            </div>
          </div>
          <aside aria-live="polite" className="min-w-0 rounded-lg border border-border bg-surface-raised p-4">
            {selected && <div key={selected.id} className="break-words motion-safe:animate-graph-panel"><p className={`text-xs uppercase ${kindClass[selected.kind]}`}>{selected.kind} {selected.status?.replaceAll("_", " ")}</p><h3 className="mt-3 text-sm font-semibold">{selected.label}</h3><p className="mt-3 whitespace-pre-line text-xs leading-6 text-muted">{selected.detail}</p>
              {!!selected.passages?.length && <div className="mt-4 space-y-3"><h4 className="text-xs font-semibold">{copy.excerpts}</h4><p className="text-xs leading-5 text-muted">{copy.attribution}</p>{selected.passages.map((passage, index) => <blockquote key={index} className="border-l-2 border-accent pl-3 text-xs leading-6"><p>{passage.quote}</p><p className="text-muted">{passage.stance}</p>{safeUrl(passage.url) && <Link href={safeUrl(passage.url)!} target="_blank" rel="noopener noreferrer" className="text-focus underline">Inspect cited source</Link>}</blockquote>)}</div>}
              {selected.publisher && <p className="mt-3 text-xs text-muted">{selected.publisher} · {selected.publishedAt || "Date unavailable"}</p>}
              {sourceUrl && <Link href={sourceUrl} target="_blank" rel="noopener noreferrer" className="mt-3 inline-block text-xs text-focus underline">Inspect original source</Link>}
              <h4 className="mt-5 text-xs font-semibold">Connections ({connected.length})</h4><ul className="mt-2 space-y-2">{connected.map((edge, index) => {
                const other = graph.nodes.find(node => node.id === (edge.source === selectedId ? edge.target : edge.source))!;
                return <li key={index}><button type="button" onClick={() => setSelectedId(other.id)} className="text-left text-xs leading-5 text-muted hover:text-foreground"><span className="font-semibold">{edge.source === selectedId ? "→" : "←"} {edge.relation.replaceAll("_", " ")}</span> · {other.label}</button>{edge.verification && <p className="text-xs text-accent">{edge.verification.replaceAll("_", " ")}</p>}{edge.detail && <p className="text-xs leading-5 text-muted">{edge.detail}</p>}</li>;
              })}</ul></div>}
          </aside>
        </div>
      )}
      </div>
      <p className="mt-4 border-t border-border pt-3 text-xs leading-6 text-muted">{copy.note}</p>
    </>
  );

  return (
    <section aria-label={copy.title} className="m-4 rounded-xl border border-border bg-surface p-4 sm:m-6 sm:p-5">
      <Reveal>
        {toolbar(false)}
        {workspace(false)}
      </Reveal>
      <FullScreenDialog dialogRef={dialog} open={expanded} onClose={() => setExpanded(false)} label={copy.maximized}>
        {toolbar(true)}
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          <div className="mx-auto max-w-[100rem] px-4 py-3 sm:px-8 sm:py-4">{workspace(true)}</div>
        </div>
      </FullScreenDialog>
    </section>
  );
}
