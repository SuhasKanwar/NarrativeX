"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Globe2 } from "lucide-react";
import { type GeoEvent, dateLabel, safeUrl } from "@/lib/workspace";

const copy = {
  label: "GEOPOLITICAL SIGNALS",
  title: "A world in motion.",
  note: "Locations inferred from headline keywords; not verified event coordinates.",
  open: "Read source",
  investigate: "Investigate this story",
  empty: "No located stories available yet.",
  projection: "LONGITUDE / LATITUDE · SCHEMATIC",
};

export default function WorldWatch({ events }: { events: GeoEvent[] }) {
  const [selected, setSelected] = useState(0);
  const active = events[selected] ?? events[0];
  return (
    <section className="overflow-hidden rounded-3xl bg-dark-surface text-inverse">
      <div className="flex items-center justify-between p-6 pb-0">
        <div>
          <p className="text-[9px] tracking-[.22em] text-dark-muted">
            {copy.label}
          </p>
          <h2 className="mt-3 font-editorial text-3xl tracking-tight">
            {copy.title}
          </h2>
        </div>
        <Globe2 size={30} strokeWidth={1} className="text-sage" />
      </div>
      <div className="relative mx-5 mt-6 aspect-[2/1] overflow-hidden rounded-2xl border border-dark-border bg-dark-border/25">
        <svg
          viewBox="0 0 600 300"
          aria-hidden="true"
          className="absolute inset-0 size-full text-dark-border"
        >
          <defs>
            <pattern
              id="geo-grid"
              width="50"
              height="50"
              patternUnits="userSpaceOnUse"
            >
              <path d="M 50 0 L 0 0 0 50" fill="none" stroke="currentColor" />
            </pattern>
          </defs>
          <rect width="600" height="300" fill="url(#geo-grid)" />
          <ellipse
            cx="300"
            cy="150"
            rx="270"
            ry="120"
            fill="none"
            stroke="currentColor"
          />
          <ellipse
            cx="300"
            cy="150"
            rx="160"
            ry="120"
            fill="none"
            stroke="currentColor"
          />
          <ellipse
            cx="300"
            cy="150"
            rx="65"
            ry="120"
            fill="none"
            stroke="currentColor"
          />
        </svg>
        <div className="absolute inset-y-0 left-1/2 w-px bg-sage/20 motion-safe:animate-[scan_9s_ease-in-out_infinite]" />
        {events.map((event, index) => (
          <button
            key={event.id}
            onClick={() => setSelected(index)}
            aria-label={`Locate: ${event.title}`}
            aria-pressed={active?.id === event.id}
            style={{
              left: `${((event.longitude + 180) / 360) * 100}%`,
              top: `${((90 - event.latitude) / 180) * 100}%`,
            }}
            className={`group absolute z-10 -translate-x-1/2 -translate-y-1/2 rounded-full p-2 transition duration-500 hover:scale-150 focus:z-20 ${active?.id === event.id ? "scale-125" : ""}`}
          >
            <span className="absolute inset-0 rounded-full border border-accent/40 motion-safe:animate-signal" />
            <span
              className={`block size-2 rounded-full ${active?.id === event.id ? "bg-accent" : "bg-sage"}`}
            />
          </button>
        ))}
        <span className="absolute bottom-3 left-3 text-[8px] tracking-[.12em] text-dark-muted">
          {copy.projection}
        </span>
      </div>
      <div key={active?.id} className="p-6 motion-safe:animate-enter">
        {active ? (
          <>
            <div className="flex items-center justify-between text-[10px] text-dark-muted">
              <span className="rounded-full border border-dark-border px-3 py-1 capitalize">
                {active.matchedKeyword}
              </span>
              <span>{dateLabel(active.date)}</span>
            </div>
            <h3 className="mt-4 text-lg leading-snug">{active.title}</h3>
            <div className="mt-5 flex flex-wrap gap-4 text-xs">
              <a
                href={safeUrl(active.sourceUrl)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sage hover:underline"
              >
                {copy.open}
                <ArrowUpRight size={13} />
              </a>
              <Link
                href={`/dashboard/bot?topic=${encodeURIComponent(active.title)}`}
                className="text-dark-muted hover:text-inverse"
              >
                {copy.investigate} →
              </Link>
            </div>
          </>
        ) : (
          <p className="text-sm text-dark-muted">{copy.empty}</p>
        )}
        <p className="mt-6 border-t border-dark-border pt-4 text-[10px] leading-relaxed text-dark-muted">
          {copy.note}
        </p>
      </div>
    </section>
  );
}
