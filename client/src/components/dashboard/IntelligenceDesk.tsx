"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  ArrowUpRight,
  Radio,
  RefreshCw,
  Search,
  Sparkles,
} from "lucide-react";
import {
  workspace,
  type Article,
  type GeoEvent,
  type Post,
  dateLabel,
  safeUrl,
} from "@/lib/workspace";
import { desk } from "./content";
import { FeedState, Reveal } from "./Motion";
import WorldWatch from "./WorldWatch";

type Feed<T> = { data: T[]; loading: boolean; error?: string };
const initial = { data: [], loading: true };
const copy = {
  emptyNews: "No headlines match this topic. Try a broader search.",
  emptySocial: "No public posts found for this topic.",
  newsError: "Headlines are unavailable right now.",
  eventError: "World watch is temporarily unavailable.",
  socialError: "Public conversation could not be loaded.",
  investigate: "Explore the narrative",
  read: "Read story",
  stories: "HEADLINES IN VIEW",
  sources: "NEWS SOURCES",
  signals: "LOCATED STORIES",
  socialNote:
    "Public posts reflect what people are saying, not verified evidence.",
  cta: "Go beyond the headline.",
  ctaDescription: "Turn a developing story into a source-led investigation.",
  studio: "Open research studio",
  searchLabel: "Search news and public posts",
  partial: "Some social sources are unavailable:",
  reset: "Clear search",
};

export default function IntelligenceDesk() {
  const [category, setCategory] = useState(desk.categories[0]);
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [revision, setRevision] = useState(0);
  const [news, setNews] = useState<Feed<Article>>(initial);
  const [events, setEvents] = useState<Feed<GeoEvent>>(initial);
  const [social, setSocial] = useState<Feed<Post>>(initial);
  const [partial, setPartial] = useState<string[]>([]);
  const [provider, setProvider] = useState("");
  const topic = query || category.query;
  const refresh = () => setRevision((n) => n + 1);

  useEffect(() => {
    const controller = new AbortController();
    workspace
      .news(topic, controller.signal)
      .then((result) => {
        setNews({ data: result.articles, loading: false });
        setProvider(result.provider || "");
      })
      .catch(() => {
        if (!controller.signal.aborted)
          setNews({ data: [], loading: false, error: copy.newsError });
      });
    workspace
      .social(topic.slice(0, 100), controller.signal)
      .then((result) => {
        setSocial({ data: result.posts, loading: false });
        setPartial([...new Set(result.errors.map((e) => e.platform))]);
      })
      .catch(() => {
        if (!controller.signal.aborted)
          setSocial({ data: [], loading: false, error: copy.socialError });
      });
    return () => controller.abort();
  }, [topic, revision]);
  useEffect(() => {
    const controller = new AbortController();
    workspace
      .events(controller.signal)
      .then((data) => setEvents({ data, loading: false }))
      .catch(() => {
        if (!controller.signal.aborted)
          setEvents({ data: [], loading: false, error: copy.eventError });
      });
    return () => controller.abort();
  }, [revision]);
  function changeTopic() {
    setNews(initial);
    setSocial(initial);
    setPartial([]);
  }
  const stats = [
    { label: copy.stories, value: news.loading ? "—" : news.data.length },
    {
      label: copy.sources,
      value: news.loading ? "—" : new Set(news.data.map((a) => a.source)).size,
    },
    { label: copy.signals, value: events.loading ? "—" : events.data.length },
  ];

  return (
    <div className="space-y-8">
      <Reveal>
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="text-[10px] tracking-[.24em] text-muted">
              {desk.eyebrow}
            </p>
            <h1 className="mt-3 font-editorial text-4xl tracking-tight md:text-5xl">
              {desk.title}
            </h1>
            <p className="mt-3 max-w-lg text-sm leading-6 text-muted">
              {desk.description}
            </p>
          </div>
          <button
            onClick={() => {
              changeTopic();
              setEvents(initial);
              refresh();
            }}
            disabled={news.loading || events.loading}
            className="group flex items-center gap-2 rounded-full border border-border px-4 py-2.5 text-xs transition hover:bg-surface-raised"
          >
            <RefreshCw
              size={14}
              className="transition-transform duration-700 group-hover:rotate-180"
            />
            {desk.refresh}
          </button>
        </div>
      </Reveal>
      <Reveal delay={100}>
        <div className="grid grid-cols-3 divide-x divide-border rounded-2xl border border-border bg-surface-raised">
          {stats.map((stat) => (
            <div key={stat.label} className="p-4 md:p-6">
              <p className="text-[8px] tracking-[.14em] text-muted md:text-[10px]">
                {stat.label}
              </p>
              <p
                key={stat.value}
                className="mt-3 font-editorial text-3xl motion-safe:animate-enter md:text-4xl"
              >
                {stat.value}
              </p>
            </div>
          ))}
        </div>
      </Reveal>
      <Reveal delay={180}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div
            className="flex max-w-full gap-1 overflow-auto rounded-full bg-surface p-1"
            role="group"
            aria-label="News categories"
          >
            {desk.categories.map((item) => (
              <button
                key={item.id}
                aria-pressed={category.id === item.id && !query}
                onClick={() => {
                  if (category.id === item.id && !query) return;
                  changeTopic();
                  setCategory(item);
                  setQuery("");
                  setSearch("");
                }}
                className={`shrink-0 rounded-full px-4 py-2.5 text-[11px] transition-all duration-300 ${category.id === item.id && !query ? "bg-dark-surface text-inverse shadow-md" : "text-muted hover:bg-surface-raised"}`}
              >
                {item.label}
              </button>
            ))}
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (search.trim() === query) return;
              changeTopic();
              setQuery(search.trim());
            }}
            className="flex w-full items-center gap-2 rounded-full border border-border bg-surface-raised px-4 sm:w-72"
          >
            <Search size={15} className="text-muted" />
            <input
              aria-label={copy.searchLabel}
              value={search}
              maxLength={100}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={desk.search}
              className="min-w-0 flex-1 bg-transparent py-3 text-xs outline-none"
            />
            <button
              aria-label="Search"
              className="rounded-full p-1 transition hover:bg-surface"
            >
              <ArrowRight size={15} />
            </button>
          </form>
        </div>
      </Reveal>
      {query && (
        <p className="text-xs text-muted">
          Results for “{query}”{" "}
          <button
            className="ml-3 underline"
            onClick={() => {
              changeTopic();
              setQuery("");
              setSearch("");
            }}
          >
            {copy.reset}
          </button>
        </p>
      )}
      <div className="grid items-start gap-7 xl:grid-cols-[minmax(0,1fr)_350px]">
        <section>
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-xl tracking-tight">{desk.newsTitle}</h2>
            <span className="text-[10px] text-muted">{provider}</span>
          </div>
          {news.loading || news.error || !news.data.length ? (
            <FeedState
              loading={news.loading}
              error={news.error}
              empty={copy.emptyNews}
              retry={refresh}
            />
          ) : (
            <div key={topic + revision} className="grid gap-4 md:grid-cols-2">
              {news.data.map((article, i) => (
                <Reveal key={article.url + i} delay={(i % 2) * 100}>
                  <article
                    className={`group flex h-full flex-col overflow-hidden rounded-2xl border border-border transition-all duration-500 hover:-translate-y-1 hover:shadow-xl hover:shadow-dark-surface/5 ${i === 0 ? "bg-sage/25" : "bg-surface-raised"}`}
                  >
                    {safeUrl(article.image ?? "") && (
                      <Image
                        src={safeUrl(article.image ?? "")!}
                        alt=""
                        width={640}
                        height={360}
                        unoptimized
                        loading="lazy"
                        referrerPolicy="no-referrer"
                        sizes="(min-width: 768px) 50vw, 100vw"
                        className="aspect-[16/9] w-full object-cover transition duration-700 motion-safe:group-hover:scale-[1.04]"
                      />
                    )}
                    <div className="flex flex-1 flex-col p-6">
                      <div className="flex items-center justify-between gap-3 text-[10px] text-muted">
                        <span className="truncate uppercase tracking-wide">
                          {article.source}
                        </span>
                        <span className="shrink-0">
                          {dateLabel(article.publishedAt)}
                        </span>
                      </div>
                      <span className="mt-6 font-editorial text-4xl text-muted/25">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <h3 className="mt-3 font-editorial text-2xl leading-tight tracking-tight">
                        {article.title}
                      </h3>
                      {article.description && (
                        <p className="mt-4 line-clamp-3 text-xs leading-6 text-muted">
                          {article.description}
                        </p>
                      )}
                      <div className="mt-auto flex items-center justify-between gap-2 pt-6 text-[11px]">
                        <Link
                          href={safeUrl(article.url) ?? "#"}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 hover:underline"
                        >
                          {copy.read}
                          <ArrowUpRight size={13} />
                        </Link>
                        <Link
                          href={`/dashboard/bot?topic=${encodeURIComponent(article.title)}`}
                          className="flex items-center gap-1 text-muted transition hover:text-foreground"
                        >
                          <Sparkles size={12} />
                          {copy.investigate}
                        </Link>
                      </div>
                    </div>
                  </article>
                </Reveal>
              ))}
            </div>
          )}
        </section>
        <div className="space-y-6">
          <Reveal delay={200}>
            {events.loading || events.error ? (
              <FeedState
                loading={events.loading}
                error={events.error}
                retry={refresh}
              />
            ) : (
              <WorldWatch events={events.data} />
            )}
          </Reveal>
          <Reveal>
            <div className="rounded-3xl border border-border p-6">
              <Sparkles className="text-accent" />
              <h3 className="mt-5 font-editorial text-2xl">{copy.cta}</h3>
              <p className="mt-3 text-xs leading-6 text-muted">
                {copy.ctaDescription}
              </p>
              <Link
                href="/dashboard/bot"
                className="mt-6 flex items-center justify-between rounded-xl bg-accent px-4 py-3 text-xs font-medium text-accent-ink transition hover:bg-accent-hover"
              >
                {copy.studio}
                <ArrowUpRight size={15} />
              </Link>
            </div>
          </Reveal>
        </div>
      </div>
      <section>
        <Reveal>
          <div className="mb-5 flex items-center gap-3">
            <Radio size={20} className="text-muted" />
            <h2 className="text-xl tracking-tight">{desk.socialTitle}</h2>
          </div>
          <p className="mb-5 text-xs text-muted">{copy.socialNote}</p>
        </Reveal>
        {partial.length > 0 && (
          <p role="status" className="mb-4 text-xs text-muted">
            {copy.partial} {partial.join(", ")}
          </p>
        )}
        {social.loading || social.error || !social.data.length ? (
          <FeedState
            loading={social.loading}
            error={social.error}
            empty={copy.emptySocial}
            retry={refresh}
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {social.data.map((post, i) => (
              <Reveal key={post.platform + post.id + i} delay={(i % 3) * 100}>
                <Link
                  href={safeUrl(post.url) ?? "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block h-full rounded-2xl border border-border bg-surface-raised p-5 transition duration-300 hover:-translate-y-1 hover:border-muted"
                >
                  <div className="flex items-center justify-between text-[10px] text-muted">
                    <span className="rounded-full bg-surface px-3 py-1 uppercase tracking-wide">
                      {post.platform}
                    </span>
                    <ArrowUpRight
                      size={14}
                      className="transition group-hover:-translate-y-1 group-hover:translate-x-1"
                    />
                  </div>
                  <p className="mt-4 line-clamp-4 text-sm leading-6">
                    {post.title || post.content}
                  </p>
                  <p className="mt-4 truncate text-[10px] text-muted">
                    {post.author || "Public post"} ·{" "}
                    {dateLabel(post.publishedAt)}
                  </p>
                </Link>
              </Reveal>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
