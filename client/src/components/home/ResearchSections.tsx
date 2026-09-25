import Link from "next/link";
import { ArrowUpRight, Plus } from "lucide-react";

const content = {
  audiences: {
    label: "04 / BUILT FOR INQUIRING MINDS",
    title: "A different lens.\nA deeper understanding.",
    items: [
      {
        number: "01",
        label: "For researchers",
        title: "Start with a better question.",
        description:
          "Explore how a topic is framed across sources. Build a reading trail with the original posts and articles close at hand.",
        tags: "CONTEXT / COMPARISON / EXPLORATION",
      },
      {
        number: "02",
        label: "For journalists",
        title: "Look beyond the first version.",
        description:
          "Compare reporting with public conversations. Find leads worth investigating, then return to the original source to verify them.",
        tags: "SOURCES / PERSPECTIVES / EVIDENCE",
      },
      {
        number: "03",
        label: "For the curious",
        title: "Make room for another angle.",
        description:
          "Step outside a single feed. Discover the questions and perspectives that a headline alone may leave out.",
        tags: "DISCOVERY / CURIOSITY / UNDERSTANDING",
      },
    ],
  },
  principle: {
    label: "OUR GUIDING PRINCIPLE",
    quote: "A popular claim isn't\nthe same as a proven one.",
    description:
      "Engagement tells you what is spreading. Evidence helps you understand what is supported. NarrativeX is designed to keep that distinction in view.",
    note: "AI supports exploration. Your judgment stays essential.",
  },
  faq: {
    label: "05 / A LITTLE MORE CONTEXT",
    title: "Good questions.\nClear answers.",
    action: "Ready to explore?",
    items: [
      {
        question: "What is NarrativeX?",
        answer:
          "NarrativeX brings news and public social content together to help you explore claims, compare perspectives, and understand how narratives connect. It is a tool for investigation and context.",
      },
      {
        question: "Which sources can I explore?",
        answer:
          "The collection layer supports news search, Reddit, Bluesky, and Hacker News. Results depend on provider access, credentials, and availability. Some sources may be unavailable while others continue to return results.",
      },
      {
        question: "Does NarrativeX decide what is true?",
        answer:
          "No. A search result, a high engagement count, or an AI response does not prove a claim. Treat analysis as a starting point, inspect the original sources, and consider the quality and limits of the available evidence.",
      },
      {
        question: "Is the narrative map showing live data?",
        answer:
          "The map on this page is an illustration of connected ideas. It does not show a live event, measured activity, or a verified chain of influence.",
      },
      {
        question: "Can I use it to monitor private conversations?",
        answer:
          "The current collectors work with public content available through their providers. They do not grant access to private messages, restricted groups, or content you are not authorized to view.",
      },
    ],
  },
};

export default function ResearchSections() {
  return (
    <>
      <section
        className="audiences pt-8 pb-16 md:pt-11 md:pb-24 [&_h2]:mt-6 section-wrap mx-auto w-[calc(100%-40px)] max-w-[1328px] md:w-[calc(100%-64px)] xl:w-[calc(100%-112px)]"
        id="who-its-for"
      >
        <div
          data-reveal
          className="transition-[opacity,transform] duration-700 ease-out data-[visible=false]:translate-y-6 data-[visible=false]:opacity-0 motion-reduce:transform-none motion-reduce:opacity-100 motion-reduce:transition-none"
        >
          <p className="eyebrow text-[.66rem] font-semibold leading-relaxed tracking-[.14em] uppercase">
            {content.audiences.label}
          </p>
          <h2>{content.audiences.title}</h2>
        </div>
        <div className="audience-grid mt-8 grid gap-5 md:mt-12 md:grid-cols-3">
          {content.audiences.items.map((item) => (
            <article
              key={item.number}
              className="audience-card rounded-sm border border-border bg-surface p-7 transition duration-300 hover:-translate-y-1.5 hover:bg-surface-raised [&_h3]:mt-10 [&_h3]:mb-5 [&_h3]:max-w-[260px] [&_h3]:text-3xl [&_h3]:leading-tight [&_h3]:tracking-tight [&>p]:text-sm [&>p]:leading-7 [&>p]:text-muted [&>.eyebrow]:mt-9 [&>.eyebrow]:block [&>.eyebrow]:text-[.52rem] transition-[opacity,transform] duration-700 ease-out data-[visible=false]:translate-y-6 data-[visible=false]:opacity-0 motion-reduce:transform-none motion-reduce:opacity-100 motion-reduce:transition-none"
              data-reveal
            >
              <div className="audience-label flex justify-between text-xs [&>span:last-child]:text-muted">
                <span>{item.label}</span>
                <span>{item.number}</span>
              </div>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
              <span className="eyebrow text-[.66rem] font-semibold leading-relaxed tracking-[.14em] uppercase">
                {item.tags}
              </span>
            </article>
          ))}
        </div>
      </section>
      <section className="principle bg-sage py-16 md:py-22 [&_blockquote]:my-9 [&_blockquote]:whitespace-pre-line [&_blockquote]:font-editorial [&_blockquote]:text-[clamp(2.5rem,5.2vw,5.4rem)] [&_blockquote]:leading-[1.13] [&_blockquote]:tracking-tight [&_blockquote]:italic [&_.section-wrap>div]:flex [&_.section-wrap>div]:flex-col [&_.section-wrap>div]:gap-6 md:[&_.section-wrap>div]:flex-row md:[&_.section-wrap>div]:items-end md:[&_.section-wrap>div]:justify-between md:[&_.section-wrap>div]:gap-12 [&_.section-wrap>div_p]:max-w-[520px] [&_.section-wrap>div_p]:text-sm [&_.section-wrap>div_p]:leading-8 [&_.section-wrap>div_span]:max-w-60 [&_.section-wrap>div_span]:text-xs [&_.section-wrap>div_span]:leading-6">
        <div
          className="section-wrap mx-auto w-[calc(100%-40px)] max-w-[1328px] md:w-[calc(100%-64px)] xl:w-[calc(100%-112px)] transition-[opacity,transform] duration-700 ease-out data-[visible=false]:translate-y-6 data-[visible=false]:opacity-0 motion-reduce:transform-none motion-reduce:opacity-100 motion-reduce:transition-none"
          data-reveal
        >
          <p className="eyebrow text-[.66rem] font-semibold leading-relaxed tracking-[.14em] uppercase">
            {content.principle.label}
          </p>
          <blockquote>{content.principle.quote}</blockquote>
          <div>
            <p>{content.principle.description}</p>
            <span>{content.principle.note}</span>
          </div>
        </div>
      </section>
      <section
        className="faq grid gap-9 border-b border-border py-16 md:grid-cols-[1fr_1.3fr] md:gap-16 md:py-28 [&_h2]:mt-6 [&_.text-link]:mt-8 section-wrap mx-auto w-[calc(100%-40px)] max-w-[1328px] md:w-[calc(100%-64px)] xl:w-[calc(100%-112px)]"
        id="questions"
      >
        <div
          data-reveal
          className="transition-[opacity,transform] duration-700 ease-out data-[visible=false]:translate-y-6 data-[visible=false]:opacity-0 motion-reduce:transform-none motion-reduce:opacity-100 motion-reduce:transition-none"
        >
          <p className="eyebrow text-[.66rem] font-semibold leading-relaxed tracking-[.14em] uppercase">
            {content.faq.label}
          </p>
          <h2>{content.faq.title}</h2>
          <Link
            className="text-link inline-flex items-center gap-3.5 text-xs hover:underline underline-offset-4"
            href="/auth/signup"
          >
            {content.faq.action}
            <ArrowUpRight size={17} />
          </Link>
        </div>
        <div>
          {content.faq.items.map((item) => (
            <details
              className="faq-item border-b border-border first:border-t [&_summary]:flex [&_summary]:list-none [&_summary]:items-center [&_summary]:justify-between [&_summary]:gap-6 [&_summary]:py-6 [&_summary]:text-sm [&_summary]:leading-7 [&_summary::-webkit-details-marker]:hidden [&_svg]:transition-transform open:[&_svg]:rotate-45 [&>p]:pr-8 [&>p]:pb-6 [&>p]:text-sm [&>p]:leading-8 [&>p]:text-muted transition-[opacity,transform] duration-700 ease-out data-[visible=false]:translate-y-6 data-[visible=false]:opacity-0 motion-reduce:transform-none motion-reduce:opacity-100 motion-reduce:transition-none"
              key={item.question}
              data-reveal
            >
              <summary>
                {item.question}
                <Plus size={19} aria-hidden="true" />
              </summary>
              <p>{item.answer}</p>
            </details>
          ))}
        </div>
      </section>
    </>
  );
}
