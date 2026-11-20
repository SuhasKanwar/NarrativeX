"use client";

import { useId } from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import type { EvidenceGraph, EvidenceNode } from "@/lib/research-graph";
import { safeUrl } from "@/lib/workspace";

const sides = [
  { kind: "news", label: "News position", field: "newsPosition", tone: "text-focus" },
  { kind: "social", label: "Social position", field: "socialPosition", tone: "text-sage" },
] as const;
const relations: Record<string, string> = {
  agree: "Agreement",
  partially_agree: "Partial agreement",
  disagree: "Disagreement",
  different_emphasis: "Different emphasis",
  insufficient_evidence: "Insufficient evidence",
};

const cardMotion = "group min-w-0 rounded-xl border p-4 hover:border-focus hover:shadow-md focus-within:border-focus motion-safe:transition-[translate,border-color,box-shadow] motion-safe:duration-200 motion-safe:hover:-translate-y-0.5";

export default function ComparisonGraph({ graph, findings, selectedId, onSelect }: {
  graph: EvidenceGraph;
  findings: EvidenceNode[];
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  const finding = findings.find(node => node.id === selectedId) ?? findings[0];
  const comparisonField = useId();

  return (
    <div className="@container space-y-4">
      <div>
        <label htmlFor={comparisonField} className="block text-xs text-muted">Comparison</label>
        <select id={comparisonField} value={finding.id} onChange={event => onSelect(event.target.value)}
          className="mt-2 block w-full rounded-lg border border-border bg-surface-raised p-3 text-sm text-foreground transition-colors hover:border-focus">
          {findings.map(node => <option key={node.id} value={node.id}>{node.label}</option>)}
        </select>
      </div>
      <figure key={finding.id} aria-label="News and social inference graph"
        className="grid items-stretch gap-2 motion-safe:animate-graph-panel @3xl:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)_auto_minmax(0,1fr)]">
        {sides.map(side => {
          const sources = graph.nodes.filter(node => node.kind === side.kind && graph.edges.some(
            edge => edge.source === finding.id && edge.target === node.id
          ));
          return (
            <div key={side.kind} className="contents">
              <article className={`${cardMotion} border-border bg-surface-raised`}>
                <h3 className={`flex items-center justify-between gap-2 text-xs font-semibold ${side.tone}`}>
                  {side.label}<HoverTick />
                </h3>
                <p className="mt-2 break-words text-sm leading-6">{finding[side.field] || "No retained excerpt."}</p>
                {sources.map(source => {
                  const url = source.url && safeUrl(source.url);
                  return (
                    <div key={source.id} className="mt-3 border-t border-border pt-3">
                      {url && <Link href={url} target="_blank" rel="noopener noreferrer" className="text-xs text-focus underline">
                        {source.publisher || "Original source"} {source.publishedAt && `· ${source.publishedAt.slice(0, 10)}`}
                      </Link>}
                      {finding.passages?.filter(passage => passage.url === source.url).map((passage, index) =>
                        <blockquote key={index} className="mt-2 break-words border-l-2 border-border pl-3 text-xs leading-5 text-muted">
                          {passage.quote}
                        </blockquote>
                      )}
                    </div>
                  );
                })}
              </article>
              {side.kind === "news" && <>
                <Connector />
                <article className={`${cardMotion} border-accent/60 bg-sage/15`}>
                  <h3 className="flex items-center justify-between gap-2 text-xs font-semibold text-focus">
                    {relations[finding.status ?? ""] ?? "Assessment"}<HoverTick />
                  </h3>
                  <p className="mt-2 break-words text-sm leading-6">{finding.detail}</p>
                  {finding.nextCheck && <p className="mt-3 break-words text-xs leading-5 text-muted">
                    <strong>Verify next</strong> · {finding.nextCheck}
                  </p>}
                </article>
                <Connector />
              </>}
            </div>
          );
        })}
      </figure>
    </div>
  );
}

function Connector() {
  return <div aria-hidden="true" className="flex items-center justify-center">
    <span className="h-4 w-px bg-accent @3xl:h-px @3xl:w-4" />
  </div>;
}

function HoverTick() {
  return <Check data-card-tick aria-hidden="true" size={14}
    className="text-focus opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 motion-safe:transition-opacity" />;
}
