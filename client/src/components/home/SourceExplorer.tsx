"use client";

import { useState, type KeyboardEvent } from "react";
import {
  ArrowUpRight,
  Newspaper,
  MessagesSquare,
  Radio,
  Code2,
} from "lucide-react";
import Link from "next/link";

const content = {
  label: "03 / MULTIPLE WINDOWS, ONE WORLD",
  title: "Change the source.\nBroaden the perspective.",
  description:
    "Each platform tells a different part of the story. Explore what each brings to the conversation.",
  action: "Explore with NarrativeX",
  tabsLabel: "Explore content sources",
  detailLabel: "WHAT IT ADDS",
  note: "Source access depends on provider availability and configuration.",
  sources: [
    {
      id: "news",
      label: "News",
      icon: Newspaper,
      title: "Where the headlines begin.",
      description:
        "Published reporting gives a story its first frame. Look at how different outlets describe the same event, and keep the original article within reach.",
      detail:
        "Publication context, article links, and reporting across outlets.",
      tags: ["Reporting", "Headlines", "Source attribution"],
    },
    {
      id: "reddit",
      label: "Reddit",
      icon: MessagesSquare,
      title: "Where the conversation deepens.",
      description:
        "Community posts reveal the questions, reactions, and competing interpretations around a topic. Understand the conversation in the context of its community.",
      detail: "Community context, post text, discussion links, and engagement.",
      tags: ["Communities", "Discussion", "Public reactions"],
    },
    {
      id: "bluesky",
      label: "Bluesky",
      icon: Radio,
      title: "Where perspectives move fast.",
      description:
        "Short public posts offer a window into the way people describe and share a developing story. Follow links back to the post and its author.",
      detail: "Public posts, author attribution, shared links, and engagement.",
      tags: ["Public posts", "Shared links", "Emerging perspectives"],
    },
    {
      id: "hackernews",
      label: "Hacker News",
      icon: Code2,
      title: "Where ideas meet scrutiny.",
      description:
        "Explore technology and science stories through a community that asks how things work. Keep the submitted article and its discussion connected.",
      detail: "Story titles, linked articles, discussion threads, and scores.",
      tags: ["Technology", "Science", "Community insight"],
    },
  ],
};

export default function SourceExplorer() {
  const [selected, setSelected] = useState(0);
  const source = content.sources[selected];
  const Icon = source.icon;
  function navigate(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let next = index;
    if (event.key === "ArrowRight") next = (index + 1) % content.sources.length;
    else if (event.key === "ArrowLeft")
      next = (index - 1 + content.sources.length) % content.sources.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = content.sources.length - 1;
    else return;
    event.preventDefault();
    setSelected(next);
    document.getElementById(`source-tab-${content.sources[next].id}`)?.focus();
  }
  return (
    <section
      className="source-explorer pt-16 pb-8 md:pt-28 md:pb-16 section-wrap mx-auto w-[calc(100%-40px)] max-w-332 md:w-[calc(100%-64px)] xl:w-[calc(100%-112px)]"
      id="sources"
    >
      <div
        className="section-intro grid gap-6 md:grid-cols-2 md:items-end md:gap-x-12 xl:gap-x-20 [&>.eyebrow]:col-span-full md:[&>.eyebrow]:mb-2 [&>p:last-child]:max-w-115 [&>p:last-child]:text-sm [&>p:last-child]:leading-8 [&>p:last-child]:text-muted reveal-up"
        data-reveal
      >
        <p className="eyebrow text-[.66rem] font-semibold leading-relaxed tracking-[.14em] uppercase">
          {content.label}
        </p>
        <h2>{content.title}</h2>
        <p>{content.description}</p>
      </div>
      <div
        className="source-tabs mt-8 grid grid-cols-2 border-b border-border md:mt-12 md:flex md:gap-2 [&_button]:flex [&_button]:items-center [&_button]:gap-2.5 [&_button]:border-b-2 [&_button]:border-transparent [&_button]:px-3 [&_button]:py-4 [&_button]:text-sm [&_button]:text-muted [&_button]:transition-colors md:[&_button]:px-6 [&_button[aria-selected=true]]:border-foreground [&_button[aria-selected=true]]:bg-surface [&_button[aria-selected=true]]:text-foreground [&_button:hover]:text-foreground"
        role="tablist"
        aria-label={content.tabsLabel}
      >
        {content.sources.map((item, index) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            id={`source-tab-${item.id}`}
            aria-selected={selected === index}
            aria-controls={`source-panel-${item.id}`}
            tabIndex={selected === index ? 0 : -1}
            onClick={() => setSelected(index)}
            onKeyDown={(event) => navigate(event, index)}
          >
            <item.icon size={19} />
            {item.label}
          </button>
        ))}
      </div>
      <div
        key={source.id}
        className="source-panel grid min-h-85 items-center gap-7 py-8 md:grid-cols-[.7fr_1.5fr] md:py-11 xl:grid-cols-[.7fr_1.5fr_1fr] xl:gap-11 motion-safe:animate-enter [&_h3]:my-4 [&_h3]:text-3xl [&_h3]:tracking-tight [&_p:not(.eyebrow)]:text-sm [&_p:not(.eyebrow)]:leading-7 [&_p:not(.eyebrow)]:text-muted"
        role="tabpanel"
        id={`source-panel-${source.id}`}
        aria-labelledby={`source-tab-${source.id}`}
        tabIndex={0}
      >
        <div
          className="source-symbol relative grid h-44 place-items-center [&_span]:absolute [&_span]:size-40 [&_span]:rounded-full [&_span]:border [&_span]:border-border [&_span:nth-child(2)]:size-28 [&_span:nth-child(2)]:bg-surface [&_svg]:relative"
          aria-hidden="true"
        >
          <span />
          <span />
          <Icon size={65} strokeWidth={1} />
        </div>
        <div>
          <p className="eyebrow text-[.66rem] font-semibold leading-relaxed tracking-[.14em] uppercase">
            {source.label}
          </p>
          <h3>{source.title}</h3>
          <p>{source.description}</p>
          <ul className="source-tags mt-6 flex flex-wrap gap-2 [&_li]:rounded-full [&_li]:border [&_li]:border-border [&_li]:px-3 [&_li]:py-1.5 [&_li]:text-[.62rem]">
            {source.tags.map((tag) => (
              <li key={tag}>{tag}</li>
            ))}
          </ul>
        </div>
        <div className="source-detail border-l border-border pl-6 md:col-start-2 xl:col-start-auto [&>p:nth-child(2)]:mt-4 [&>p:nth-child(2)]:mb-8 [&>.text-link]:text-xs">
          <p className="eyebrow text-[.66rem] font-semibold leading-relaxed tracking-[.14em] uppercase">
            {content.detailLabel}
          </p>
          <p>{source.detail}</p>
          <Link
            href="/auth/signup"
            className="text-link inline-flex items-center gap-3.5 text-xs hover:underline underline-offset-4"
          >
            {content.action}
            <ArrowUpRight size={16} />
          </Link>
        </div>
      </div>
      <p className="source-note border-b border-border pb-6 text-[.66rem] text-muted">
        {content.note}
      </p>
    </section>
  );
}
