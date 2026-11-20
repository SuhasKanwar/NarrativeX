"use client";

import { useId, useState } from "react";
import type { EvidenceGraph, EvidenceNode } from "@/lib/research-graph";

const nodeTone: Record<EvidenceNode["kind"], string> = {
  news: "text-focus",
  social: "text-sage",
  claim: "text-accent",
  comparison: "text-foreground",
};

export default function GraphCanvas({ graph, visibleIds, selectedId, onSelect, expanded }: {
  graph: EvidenceGraph;
  visibleIds: Set<string>;
  selectedId: string;
  onSelect: (id: string) => void;
  expanded: boolean;
}) {
  const marker = useId();
  const [hoveredId, setHoveredId] = useState<string>();
  const [focusedId, setFocusedId] = useState<string>();
  const previewId = hoveredId ?? focusedId ?? selectedId;
  const neighbors = new Set([previewId]);
  for (const { source, target } of graph.edges) {
    if (source === previewId) neighbors.add(target);
    if (target === previewId) neighbors.add(source);
  }
  const columns = [
    graph.nodes.filter(node => node.kind === "news"),
    graph.nodes.filter(node => node.kind === "claim" || node.kind === "comparison"),
    graph.nodes.filter(node => node.kind === "social"),
  ];
  const height = Math.max(240, ...columns.map(nodes => nodes.length * 76 + 64));
  const positions = new Map(columns.flatMap((nodes, column) => nodes.map((node, index) =>
    [node.id, { x: 120 + column * 280, y: 48 + index * 76 }] as const
  )));

  return (
    <div
      role="region"
      aria-label="Scrollable source network"
      tabIndex={0}
      className={`overflow-auto rounded-lg border border-border bg-surface-raised ${expanded ? "max-h-[65dvh]" : "max-h-[420px]"}`}
    >
      <svg viewBox={`0 0 800 ${height}`} className="w-full min-w-[640px]" aria-label="Claim and source connections">
        <defs>
          <marker id={marker} markerWidth="7" markerHeight="7" refX="16" refY="3" orient="auto" markerUnits="userSpaceOnUse">
            <path d="M0,0 L0,6 L6,3 z" style={{ fill: "context-stroke" }} />
          </marker>
        </defs>
        {graph.edges.map((edge, index) => {
          const from = positions.get(edge.source)!;
          const to = positions.get(edge.target)!;
          const highlighted = edge.source === previewId || edge.target === previewId;
          const active = highlighted && visibleIds.has(edge.source) && visibleIds.has(edge.target);
          const counter = edge.relation === "counter_cites" || edge.relation === "contradicts";
          return (
            <line key={index} x1={from.x} y1={from.y} x2={to.x} y2={to.y}
              markerEnd={`url(#${marker})`}
              data-highlighted={active}
              strokeDasharray={counter ? "5 4" : undefined}
              className={`motion-safe:transition-[stroke,stroke-width,opacity] motion-safe:duration-200 ${active ? "stroke-focus stroke-2 opacity-90" : "stroke-muted opacity-20"}`}>
              <title>{edge.relation.replaceAll("_", " ")}</title>
            </line>
          );
        })}
        {graph.nodes.map(node => {
          const { x, y } = positions.get(node.id)!;
          const selected = selectedId === node.id;
          const highlighted = visibleIds.has(node.id) && neighbors.has(node.id);
          return (
            <g key={node.id} role="button" tabIndex={0}
              aria-label={`${node.kind}: ${node.label}`}
              aria-pressed={selected}
              onPointerEnter={() => setHoveredId(node.id)}
              onPointerLeave={() => setHoveredId(undefined)}
              onFocus={() => setFocusedId(node.id)}
              onBlur={() => setFocusedId(undefined)}
              onClick={() => onSelect(node.id)}
              onKeyDown={event => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  onSelect(node.id);
                }
              }}
              className={`group/node cursor-pointer outline-focus motion-safe:transition-opacity motion-safe:duration-200 ${nodeTone[node.kind]} ${highlighted || selected ? "opacity-100" : "opacity-50"}`}>
              <title>{node.label}</title>
              <circle cx={x} cy={y} r="22" fill="transparent" />
              <circle cx={x} cy={y} r="19" fill="currentColor" className="opacity-0 group-hover/node:opacity-20 group-focus-visible/node:opacity-20 group-aria-pressed/node:opacity-15 motion-safe:transition-opacity" />
              <circle cx={x} cy={y} r="10" fill="currentColor" className="group-hover/node:[r:13px] group-focus-visible/node:[r:13px] group-aria-pressed/node:[r:13px] motion-safe:transition-[r] motion-safe:duration-200" />
              <g aria-hidden="true" data-node-tick className="opacity-0 group-hover/node:opacity-100 group-focus-visible/node:opacity-100 group-aria-pressed/node:opacity-100 motion-safe:transition-opacity motion-safe:duration-200">
                <circle cx={x + 12} cy={y - 12} r="7" className="fill-dark-surface" />
                <path d={`M${x + 9} ${y - 12} l2 2 4 -4`} fill="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="stroke-inverse" />
              </g>
              <text x={x} y={y + 30} textAnchor="middle" className="fill-foreground text-[11px]">
                {node.label.length > 32 ? `${node.label.slice(0, 32)}…` : node.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
