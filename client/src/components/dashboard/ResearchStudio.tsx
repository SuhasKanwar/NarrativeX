"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  Copy,
  LoaderCircle,
  Pencil,
  Plus,
  Send,
  Sparkles,
  Trash2,
} from "lucide-react";
import { md } from "@/lib/markdown";
import { pushToast } from "@/lib/toasts";
import {
  workspace,
  type Chat,
  type Conversation,
  dateLabel,
} from "@/lib/workspace";
import { bot } from "./content";
import { FeedState, Reveal } from "./Motion";

const copy = {
  history: "YOUR INVESTIGATIONS",
  empty: "Your next question starts a new thread.",
  noHistory: "Your investigations will appear here.",
  historyError: "Could not load investigations.",
  loadError: "This investigation could not be opened.",
  sendError:
    "The request failed. Check the conversation below before resending; your question may already be saved.",
  inputLabel: "Research question",
  submit: "Send question",
  question: "THE QUESTION",
  report: "RESEARCH BRIEF",
  followup: "Continue the investigation",
  rename: "Rename investigation",
  remove: "Delete investigation",
  cancel: "Cancel",
  confirm: "Delete permanently",
  deletePrompt: "Delete this investigation and its messages?",
  save: "Save title",
  copy: "Copy brief",
  copied: "Copied",
  copySuccess: "Research brief copied to clipboard.",
  unavailable: "Could not update this investigation.",
  clipboard: "Could not copy. Select the text to copy it manually.",
  working: "INVESTIGATION IN PROGRESS",
  waiting: "Your brief will appear here when the research finishes.",
};

function ResearchBrief({ message }: { message: Chat }) {
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");
  return (
    <article className="overflow-hidden rounded-2xl border border-border bg-surface-raised">
      <header className="flex items-center justify-between border-b border-border px-6 py-4">
        <span className="flex items-center gap-2 text-[10px] tracking-[.15em] text-muted">
          <Sparkles size={14} className="text-accent" />
          {copy.report}
        </span>
        <button
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(message.content || "");
              setCopied(true);
              pushToast("success", copy.copySuccess);
            } catch {
              setError(copy.clipboard);
              pushToast("error", copy.clipboard);
            }
          }}
          aria-label={copied ? copy.copied : copy.copy}
          className="rounded-lg p-2 text-muted transition hover:bg-surface"
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
        </button>
      </header>
      <div
        className="max-w-none break-words p-6 text-sm leading-7 [&_a]:text-focus [&_a]:underline [&_a]:underline-offset-4 [&_blockquote]:my-4 [&_blockquote]:border-l-2 [&_blockquote]:border-accent [&_blockquote]:pl-4 [&_h1]:mb-5 [&_h1]:font-editorial [&_h1]:text-3xl [&_h2]:my-5 [&_h2]:text-xl [&_h2]:tracking-tight [&_h3]:my-4 [&_h3]:font-semibold [&_li]:my-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:my-3 [&_pre]:overflow-auto [&_pre]:rounded-lg [&_pre]:bg-surface [&_pre]:p-4 [&_table]:my-5 [&_table]:block [&_table]:overflow-auto [&_td]:border [&_td]:border-border [&_td]:p-3 [&_th]:border [&_th]:border-border [&_th]:p-3 [&_ul]:list-disc [&_ul]:pl-5"
        dangerouslySetInnerHTML={{ __html: md.render(message.content || "") }}
      />
      {error && (
        <p role="alert" className="px-6 pb-4 text-xs text-error">
          {error}
        </p>
      )}
    </article>
  );
}

export default function ResearchStudio({
  conversationId,
  topic = "",
  failed = false,
}: {
  conversationId?: string;
  topic?: string;
  failed?: boolean;
}) {
  const router = useRouter();
  const [history, setHistory] = useState<Conversation[]>([]);
  const [historyError, setHistoryError] = useState("");
  const [historyLoading, setHistoryLoading] = useState(true);
  const [messages, setMessages] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(Boolean(conversationId));
  const [loadError, setLoadError] = useState("");
  const [error, setError] = useState(failed ? copy.sendError : "");
  const [draft, setDraft] = useState(
    topic
      ? `Investigate this story: ${topic}. Compare the news and social narratives, cite sources, and identify uncertainty.`.slice(
          0,
          2000,
        )
      : "",
  );
  const [busy, setBusy] = useState(false);
  const [pendingQuestion, setPendingQuestion] = useState("");
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [revision, setRevision] = useState(0);
  const end = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLTextAreaElement>(null);
  const current = history.find((item) => item.id === conversationId);

  useEffect(() => {
    const controller = new AbortController();
    workspace
      .conversations(controller.signal)
      .then((data) => {
        setHistory(data);
        setHistoryLoading(false);
        setHistoryError("");
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setHistoryError(copy.historyError);
          setHistoryLoading(false);
        }
      });
    return () => controller.abort();
  }, [revision]);
  useEffect(() => {
    if (!conversationId) return;
    const controller = new AbortController();
    workspace
      .messages(conversationId, controller.signal)
      .then((data) => {
        setMessages(data);
        setLoading(false);
        setLoadError("");
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setLoadError(copy.loadError);
          setLoading(false);
        }
      });
    return () => controller.abort();
  }, [conversationId, revision]);
  useEffect(() => {
    if (messages.length || busy)
      end.current?.scrollIntoView({
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "instant"
          : "smooth",
        block: "end",
      });
  }, [messages.length, busy]);

  async function send() {
    const question = draft.trim();
    if (!question || busy || loading || loadError) return;
    setBusy(true);
    setError("");
    setPendingQuestion(question);
    setDraft("");
    let id = conversationId;
    try {
      if (!id) id = (await workspace.create(question.slice(0, 90))).id;
      const response = await workspace.send(id, question);
      setMessages((previous) => [...previous, ...response]);
      setPendingQuestion("");
      if (!conversationId) router.replace(`/dashboard/bot/${id}`);
      else setRevision((n) => n + 1);
    } catch {
      setError(copy.sendError);
      setDraft(question);
      setPendingQuestion("");
      if (id && !conversationId)
        router.replace(`/dashboard/bot/${id}?failed=1`);
      else if (id) setRevision((n) => n + 1);
    } finally {
      setBusy(false);
    }
  }
  async function updateConversation(action: "rename" | "delete") {
    if (!conversationId || busy) return;
    setBusy(true);
    setError("");
    try {
      if (action === "delete") {
        await workspace.remove(conversationId);
        router.replace("/dashboard/bot");
      } else {
        await workspace.rename(conversationId, title.trim());
        setEditing(false);
        setRevision((n) => n + 1);
      }
    } catch {
      setError(copy.unavailable);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid h-full min-h-0 grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_260px] xl:gap-6">
      <div className="flex min-h-0 min-w-0 flex-col">
        <Reveal className="shrink-0">
          <header className="flex items-center justify-between gap-4 border-b border-border pb-5">
            <p className="text-[9px] tracking-[.2em] text-muted">
              {bot.eyebrow}
            </p>
            <Link
              href="/dashboard/bot"
              className="flex items-center gap-2 rounded-full border border-border px-3 py-2 text-[11px] transition hover:bg-surface-raised"
            >
              <Plus size={14} />
              {bot.newBrief}
            </Link>
          </header>
        </Reveal>
        {conversationId && (
          <div className="mt-6 flex items-center justify-between gap-3">
            <h1 className="truncate font-editorial text-2xl">
              {current?.title || "Investigation"}
            </h1>
            <div className="flex gap-1">
              <button
                disabled={busy}
                aria-label={copy.rename}
                onClick={() => {
                  setEditing(!editing);
                  setTitle(current?.title || "");
                }}
                className="rounded-lg p-2 text-muted hover:bg-surface"
              >
                <Pencil size={15} />
              </button>
              <button
                disabled={busy}
                aria-label={copy.remove}
                onClick={() => setDeleting(!deleting)}
                className="rounded-lg p-2 text-muted hover:bg-error-surface hover:text-error"
              >
                <Trash2 size={15} />
              </button>
            </div>
          </div>
        )}
        {editing && (
          <form
            className="mt-4 flex gap-2 motion-safe:animate-enter"
            onSubmit={(e) => {
              e.preventDefault();
              void updateConversation("rename");
            }}
          >
            <input
              aria-label={copy.rename}
              maxLength={120}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="min-w-0 flex-1 rounded-xl border border-border bg-surface-raised p-3 text-sm"
            />
            <button
              disabled={busy || !title.trim()}
              className="rounded-xl bg-dark-surface px-4 text-xs text-inverse"
            >
              {copy.save}
            </button>
          </form>
        )}
        {deleting && (
          <div
            role="alert"
            className="mt-4 rounded-xl bg-error-surface p-4 text-sm text-error"
          >
            <p>{copy.deletePrompt}</p>
            <div className="mt-3 flex gap-4">
              <button
                disabled={busy}
                onClick={() => updateConversation("delete")}
                className="underline"
              >
                {copy.confirm}
              </button>
              <button onClick={() => setDeleting(false)}>{copy.cancel}</button>
            </div>
          </div>
        )}
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden [&_*]:[scrollbar-width:none] [&_*::-webkit-scrollbar]:hidden">
        {!conversationId && !busy && messages.length === 0 && (
          <div className="py-10 md:py-16">
            <Reveal delay={100}>
              <div className="relative mb-9 grid size-16 place-items-center rounded-2xl border border-border bg-surface-raised">
                <span className="absolute inset-0 rounded-2xl border border-accent/50 motion-safe:animate-signal" />
                <Sparkles size={27} strokeWidth={1.2} className="text-focus" />
              </div>
              <h1 className="whitespace-pre-line font-editorial text-5xl leading-[1.06] tracking-tight md:text-6xl">
                {bot.title}
              </h1>
              <p className="mt-5 max-w-lg text-sm leading-7 text-muted">
                {bot.description}
              </p>
            </Reveal>
            <div className="mt-9 grid gap-3 md:grid-cols-3">
              {bot.suggestions.map((suggestion, i) => (
                <Reveal key={suggestion.tag} delay={200 + i * 120}>
                  <button
                    onClick={() => {
                      setDraft(suggestion.prompt);
                      input.current?.focus();
                    }}
                    className="group flex h-full w-full flex-col items-start rounded-2xl border border-border bg-surface-raised p-5 text-left transition-all duration-500 hover:-translate-y-2 hover:bg-sage/20 hover:shadow-lg hover:shadow-dark-surface/5"
                  >
                    <span className="text-[9px] tracking-[.2em] text-muted">
                      {suggestion.tag}
                    </span>
                    <span className="mt-5 font-editorial text-xl leading-snug">
                      {suggestion.title}
                    </span>
                    <ArrowUpRight
                      size={16}
                      className="mt-5 self-end text-muted transition duration-300 group-hover:-translate-y-1 group-hover:translate-x-1"
                    />
                  </button>
                </Reveal>
              ))}
            </div>
          </div>
        )}
        {loading || loadError ? (
          <div className="my-6">
            <FeedState
              loading={loading}
              error={loadError}
              retry={() => setRevision((n) => n + 1)}
            />
          </div>
        ) : (
          <div className="space-y-7 py-7">
            {messages.map((message, index) => (
              <Reveal key={message.id}>
                {message.sender === "user" ? (
                  <div className="border-l-2 border-accent py-2 pl-5">
                    <p className="text-[9px] tracking-[.2em] text-muted">
                      {copy.question} /{" "}
                      {String(Math.floor(index / 2) + 1).padStart(2, "0")}
                    </p>
                    <p className="mt-3 whitespace-pre-wrap text-lg leading-7">
                      {message.content}
                    </p>
                  </div>
                ) : (
                  <ResearchBrief message={message} />
                )}
              </Reveal>
            ))}
          </div>
        )}
        {busy && pendingQuestion && (
          <div className="space-y-6 pb-6 motion-safe:animate-enter">
            <div className="border-l-2 border-accent pl-5">
              <p className="text-[9px] tracking-[.2em] text-muted">
                {copy.question}
              </p>
              <p className="mt-3 text-lg">{pendingQuestion}</p>
            </div>
            <div
              role="status"
              className="relative overflow-hidden rounded-2xl border border-border bg-surface-raised p-7"
            >
              <div className="absolute inset-y-0 left-1/2 w-px bg-accent/40 motion-safe:animate-[scan_3s_ease-in-out_infinite]" />
              <div className="flex items-center gap-3 text-[10px] tracking-[.15em]">
                <LoaderCircle
                  size={17}
                  className="text-focus motion-safe:animate-spin"
                />
                {copy.working}
              </div>
              <p className="mt-5 font-editorial text-2xl">{bot.pending}</p>
              <p className="mt-3 text-xs text-muted">{copy.waiting}</p>
            </div>
          </div>
        )}
        <div ref={end} />
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void send();
          }}
          className="z-10 shrink-0 rounded-2xl border border-border bg-surface-raised/95 p-3 shadow-xl shadow-dark-surface/5 backdrop-blur-xl transition duration-300 focus-within:border-muted focus-within:shadow-2xl sm:p-4"
        >
          <label
            htmlFor="research-question"
            className="mb-3 block text-[9px] tracking-[.18em] text-muted"
          >
            {conversationId ? copy.followup : copy.inputLabel}
          </label>
          <textarea
            ref={input}
            id="research-question"
            rows={1}
            maxLength={2000}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (
                e.key === "Enter" &&
                !e.ctrlKey &&
                !e.shiftKey &&
                !e.metaKey
              ) {
                e.preventDefault();
                void send();
              }
            }}
            placeholder={bot.placeholder}
            disabled={busy || loading || Boolean(loadError)}
            className="w-full resize-none bg-transparent text-sm leading-5 outline-none placeholder:text-muted"
          />
          <div className="flex items-center justify-between gap-4 border-t border-border pt-3">
            <span className="text-[10px] text-muted">
              {draft.length} / 2000
            </span>
            <button
              type="submit"
              disabled={busy || loading || Boolean(loadError) || !draft.trim()}
              aria-label={copy.submit}
              className="group flex items-center gap-3 rounded-xl bg-dark-surface px-5 py-3 text-xs text-inverse transition hover:bg-dark-border disabled:opacity-50"
            >
              {copy.submit}
              <Send
                size={14}
                className="transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              />
            </button>
          </div>
        </form>
        {error && (
          <p
            role="alert"
            className="mt-4 rounded-xl bg-error-surface p-4 text-xs leading-6 text-error"
          >
            {error}
          </p>
        )}
        <p className="mt-4 text-center text-[10px] leading-5 text-muted">
          {bot.notice}
        </p>
      </div>
      <aside className="hidden min-h-0 overflow-y-auto border-l border-border pl-6 xl:block">
        <p className="mb-5 text-[9px] tracking-[.18em] text-muted">
          {copy.history}
        </p>
        {historyLoading || historyError ? (
          <FeedState
            loading={historyLoading}
            error={historyError}
            retry={() => setRevision((n) => n + 1)}
          />
        ) : history.length ? (
            <div className="motion-stagger space-y-2">
            {history.map((item) => (
              <Link
                key={item.id}
                href={`/dashboard/bot/${item.id}`}
                aria-current={item.id === conversationId ? "page" : undefined}
                className={`group block rounded-xl p-3 transition duration-300 hover:translate-x-1 ${item.id === conversationId ? "bg-sage/30" : "hover:bg-surface"}`}
              >
                <p className="line-clamp-2 text-xs leading-5">{item.title}</p>
                <span className="mt-2 flex items-center justify-between text-[9px] text-muted">
                  {dateLabel(item.lastUpdated)}
                  <ArrowRight
                    size={12}
                    className="transition group-hover:translate-x-1"
                  />
                </span>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-xs leading-6 text-muted">{copy.noHistory}</p>
        )}
      </aside>
    </div>
  );
}
