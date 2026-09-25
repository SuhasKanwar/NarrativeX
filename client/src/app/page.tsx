import Link from "next/link";
import {
  ArrowDown,
  ArrowUpRight,
  Layers3,
  ScanText,
  GitBranch,
} from "lucide-react";
import { SiteFooter, SiteHeader } from "@/components/ui/SiteChrome";
import Logo from "@/components/ui/Logo";
import NarrativeNetwork from "@/components/ui/NarrativeNetwork";
import ScrollEffects from "@/components/ui/ScrollEffects";
import SourceExplorer from "@/components/home/SourceExplorer";
import ResearchSections from "@/components/home/ResearchSections";

const content = {
  eyebrow: "A clearer perspective on a connected world",
  title: ["Every story", "has a", "wider story."],
  description:
    "Go beyond the headline. Explore the claims, connections, and conversations that shape the way we see the world.",
  primary: { label: "Start exploring", href: "/auth/signup" },
  secondary: { label: "Discover the approach", href: "#approach" },
  footnote: "Follow the evidence. Find your perspective.",
  sourcesLabel: "Different sources. A shared perspective.",
  sources: ["News & journalism", "Reddit", "Bluesky", "Hacker News"],
  intro: {
    label: "01 / THE BIGGER PICTURE",
    title: "More information.\nLess understanding.",
    description:
      "Stories move fast. Context gets lost. NarrativeX brings scattered reporting and public conversations into focus, helping you explore what is being said, how claims connect, and where the evidence leads.",
  },
  steps: [
    {
      number: "01",
      icon: Layers3,
      title: "Connect the sources.",
      description:
        "Bring news and public social conversations together around the topics that matter to you.",
      tag: "COLLECT & EXPLORE",
    },
    {
      number: "02",
      icon: ScanText,
      title: "Question the narrative.",
      description:
        "Examine claims in context. Compare perspectives and distinguish reported statements from supporting evidence.",
      tag: "COMPARE & UNDERSTAND",
    },
    {
      number: "03",
      icon: GitBranch,
      title: "See the connections.",
      description:
        "Explore how ideas relate and how a story changes as it moves between sources and communities.",
      tag: "TRACE & DISCOVER",
    },
  ],
  network: {
    label: "02 / CONNECTED CONTEXT",
    title: "A story never\ntravels alone.",
    description:
      "A headline sparks a conversation. A conversation reshapes a claim. Look at the connections to see the bigger picture.",
    badge: "ILLUSTRATIVE NARRATIVE MAP",
    note: "A conceptual view of how stories connect, not live activity.",
    legend: ["Original source", "Related claims", "Public conversation"],
  },
  closing: {
    label: "CURIOSITY IS A GOOD PLACE TO START",
    title: "Follow the story.\nFind the context.",
    description: "Your next perspective starts with a question.",
  },
};

export default function Home() {
  return (
    <>
      <SiteHeader />
      <ScrollEffects />
      <main id="main-content">
        <section className="hero pt-12 md:pt-18 [&>h1]:relative [&>h1]:my-9 [&>h1]:text-[clamp(3.25rem,10.7vw,5rem)] md:[&>h1]:text-[clamp(4rem,8.7vw,8.6rem)] [&>h1]:leading-[1.02] [&>h1]:tracking-[-.07em] motion-safe:[&>h1]:animate-enter [&>.eyebrow]:flex [&>.eyebrow]:items-center [&>.eyebrow]:gap-2.5 [&>.eyebrow]:text-[.54rem] md:[&>.eyebrow]:text-[.66rem] section-wrap mx-auto w-[calc(100%-40px)] max-w-[1328px] md:w-[calc(100%-64px)] xl:w-[calc(100%-112px)]">
          <div className="eyebrow text-[.66rem] font-semibold leading-relaxed tracking-[.14em] uppercase">
            <span className="status-dot size-1.5 rounded-full bg-foreground" />
            {content.eyebrow}
          </div>
          <h1>
            {content.title[0]}
            <br />
            {content.title[1]}{" "}
            <span className="serif font-editorial font-normal italic tracking-[-.065em]">
              {content.title[2]}
            </span>
            <span
              className="hero-asterisk absolute right-0 -top-4 text-[4rem] leading-none text-accent motion-safe:animate-[spin_50s_linear_infinite] md:right-6 md:-top-7 md:text-[clamp(7rem,12vw,12rem)] [transform:translateY(var(--parallax-y,0px))]"
              aria-hidden="true"
              data-parallax="0.12"
            >
              ✳
            </span>
          </h1>
          <div className="hero-bottom flex flex-col items-start justify-between gap-7 md:flex-row md:items-center md:gap-12 motion-safe:animate-enter [&>p]:max-w-[420px] [&>p]:text-sm md:[&>p]:text-base [&>p]:leading-8 [&>p]:text-muted">
            <p>{content.description}</p>
            <div className="hero-actions flex items-center gap-5 md:flex-col md:items-start xl:flex-row xl:items-center xl:gap-7 [&>.text-link]:max-w-36 xl:[&>.text-link]:max-w-none [&>.button]:gap-4 [&>.button]:px-4">
              <Link
                className="button inline-flex min-h-[54px] items-center justify-center gap-7 rounded-sm border border-transparent px-6 py-3.5 text-sm font-semibold transition duration-200 hover:-translate-y-0.5 [&_svg]:transition-transform hover:[&_svg]:translate-x-0.5 hover:[&_svg]:-translate-y-0.5 button-primary bg-accent text-accent-ink hover:bg-accent-hover"
                href={content.primary.href}
              >
                {content.primary.label}
                <ArrowUpRight size={19} />
              </Link>
              <a
                className="text-link inline-flex items-center gap-3.5 text-xs hover:underline underline-offset-4"
                href={content.secondary.href}
              >
                {content.secondary.label}
                <ArrowDown size={16} />
              </a>
            </div>
          </div>
          <div className="hero-rule mt-12 flex justify-between gap-4 border-t border-border py-5 text-[.5rem] tracking-wider text-muted uppercase md:mt-18 md:text-[.62rem]">
            <span>{content.footnote}</span>
            <span aria-hidden="true">[ NX — 001 ]</span>
          </div>
        </section>
        <section
          className="source-strip flex flex-col items-start justify-between gap-5 border-b border-border py-8 md:flex-row md:items-center md:gap-8 md:py-10 [&>p]:text-xs [&>p]:leading-6 [&>p]:text-muted md:[&>p]:max-w-40 [&>div]:flex [&>div]:flex-wrap [&>div]:gap-x-7 [&>div]:gap-y-4 [&>div]:text-sm [&>div]:font-semibold [&>div]:tracking-tight md:[&>div]:gap-x-12 md:[&>div]:text-lg section-wrap mx-auto w-[calc(100%-40px)] max-w-[1328px] md:w-[calc(100%-64px)] xl:w-[calc(100%-112px)] reveal-up"
          aria-label={content.sourcesLabel}
          data-reveal
        >
          <p>{content.sourcesLabel}</p>
          <div>
            {content.sources.map((source) => (
              <span key={source}>{source}</span>
            ))}
          </div>
        </section>
        <section
          className="approach py-16 md:py-28 section-wrap mx-auto w-[calc(100%-40px)] max-w-[1328px] md:w-[calc(100%-64px)] xl:w-[calc(100%-112px)]"
          id="approach"
        >
          <div
            className="section-intro grid gap-6 md:grid-cols-2 md:items-end md:gap-x-12 xl:gap-x-20 [&>.eyebrow]:col-span-full md:[&>.eyebrow]:mb-2 [&>p:last-child]:max-w-[460px] [&>p:last-child]:text-sm [&>p:last-child]:leading-8 [&>p:last-child]:text-muted reveal-up"
            data-reveal
          >
            <p className="eyebrow text-[.66rem] font-semibold leading-relaxed tracking-[.14em] uppercase">
              {content.intro.label}
            </p>
            <h2>{content.intro.title}</h2>
            <p>{content.intro.description}</p>
          </div>
          <div className="feature-grid mt-9 grid border-y border-border md:mt-16 md:grid-cols-3">
            {content.steps.map(
              ({ number, icon: Icon, title, description, tag }) => (
                <article
                  className="feature border-border py-7 first:pl-0 not-first:border-t md:px-8 md:py-9 md:not-first:border-t-0 md:not-first:border-l [&>h3]:my-4 [&>h3]:text-2xl [&>h3]:tracking-tight [&>.eyebrow]:text-[.6rem] [&>.eyebrow]:text-muted [&>p:last-child]:text-sm [&>p:last-child]:leading-7 [&>p:last-child]:text-muted reveal-up"
                  key={number}
                  data-reveal
                >
                  <div className="feature-top mb-7 flex items-center justify-between md:mb-14 [&>span]:font-editorial [&>span]:text-xl [&>span]:text-muted [&>span]:italic">
                    <Icon size={30} strokeWidth={1.3} />
                    <span>{number}</span>
                  </div>
                  <p className="eyebrow text-[.66rem] font-semibold leading-relaxed tracking-[.14em] uppercase">
                    {tag}
                  </p>
                  <h3>{title}</h3>
                  <p>{description}</p>
                </article>
              ),
            )}
          </div>
        </section>
        <section
          className="network-section bg-dark-surface text-inverse bg-[linear-gradient(var(--dark-border)_1px,transparent_1px),linear-gradient(90deg,var(--dark-border)_1px,transparent_1px)] bg-size-[65px_65px]"
          id="perspective"
        >
          <div className="section-wrap mx-auto w-[calc(100%-40px)] max-w-[1328px] md:w-[calc(100%-64px)] xl:w-[calc(100%-112px)] network-layout grid items-center gap-8 py-16 md:grid-cols-2 md:gap-12 md:py-22 [&_.eyebrow]:mb-8 [&_.eyebrow]:text-dark-muted [&_figure]:mx-auto [&_figure]:w-full [&_figure]:max-w-[520px] [&_figcaption]:flex [&_figcaption]:flex-col [&_figcaption]:gap-2.5 [&_figcaption]:text-center [&_figcaption]:text-[.62rem] [&_figcaption]:leading-7 [&_figcaption]:text-dark-muted [&_figcaption_span]:tracking-widest">
            <div className="reveal-up" data-reveal>
              <p className="eyebrow text-[.66rem] font-semibold leading-relaxed tracking-[.14em] uppercase">
                {content.network.label}
              </p>
              <h2>{content.network.title}</h2>
              <p className="network-description mt-8 max-w-[360px] text-sm leading-8 text-dark-muted">
                {content.network.description}
              </p>
              <ul className="network-legend mt-9 flex flex-wrap gap-4 text-[.63rem] text-dark-muted [&_li]:flex [&_li]:items-center [&_li]:gap-2">
                {content.network.legend.map((label, i) => (
                  <li key={label}>
                    <span
                      className={`size-1.5 rounded-full ${["bg-accent", "bg-sage", "bg-dark-muted"][i]}`}
                    />
                    {label}
                  </li>
                ))}
              </ul>
            </div>
            <figure
              className="reveal-up data-[visible=false]:scale-90 [transform:translateY(var(--parallax-y,0px))]"
              data-reveal
              data-reveal-delay="2"
              data-parallax="0.06"
            >
              <NarrativeNetwork />
              <figcaption>
                <span>{content.network.badge}</span>
                {content.network.note}
              </figcaption>
            </figure>
          </div>
        </section>
        <SourceExplorer />
        <ResearchSections />
        <section
          className="closing overflow-hidden pt-16 md:pt-24 [&>h2]:mt-8 section-wrap mx-auto w-[calc(100%-40px)] max-w-[1328px] md:w-[calc(100%-64px)] xl:w-[calc(100%-112px)] reveal-up"
          data-reveal
        >
          <p className="eyebrow text-[.66rem] font-semibold leading-relaxed tracking-[.14em] uppercase">
            {content.closing.label}
          </p>
          <h2>{content.closing.title}</h2>
          <div className="closing-action mt-9 flex flex-col items-start justify-between gap-6 md:flex-row md:items-center [&>p]:text-sm [&>p]:text-muted">
            <p>{content.closing.description}</p>
            <Link
              className="button inline-flex min-h-[54px] items-center justify-center gap-7 rounded-sm border border-transparent px-6 py-3.5 text-sm font-semibold transition duration-200 hover:-translate-y-0.5 [&_svg]:transition-transform hover:[&_svg]:translate-x-0.5 hover:[&_svg]:-translate-y-0.5 button-dark bg-foreground text-inverse hover:bg-dark-border"
              href={content.primary.href}
            >
              {content.primary.label}
              <ArrowUpRight size={20} />
            </Link>
          </div>
          <Logo
            decorative
            className="mt-16 gap-2 pb-8 text-[clamp(3.5rem,14vw,13rem)] leading-none md:mt-24 md:gap-4 md:pb-10 [&_svg]:size-[.9em]"
          />
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
