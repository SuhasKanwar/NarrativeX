import Link from "next/link";
import {
  ArrowDown,
  ArrowUpRight,
  Layers3,
  ScanText,
  GitBranch,
} from "lucide-react";
import { Brand, SiteFooter, SiteHeader } from "@/components/ui/SiteChrome";
import NarrativeNetwork from "@/components/ui/NarrativeNetwork";

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
      <main id="main-content">
        <section className="hero section-wrap">
          <div className="eyebrow">
            <span className="status-dot" />
            {content.eyebrow}
          </div>
          <h1>
            {content.title[0]}
            <br />
            {content.title[1]} <span className="serif">{content.title[2]}</span>
            <span className="hero-asterisk" aria-hidden="true">
              ✳
            </span>
          </h1>
          <div className="hero-bottom">
            <p>{content.description}</p>
            <div className="hero-actions">
              <Link
                className="button button-primary"
                href={content.primary.href}
              >
                {content.primary.label}
                <ArrowUpRight size={19} />
              </Link>
              <a className="text-link" href={content.secondary.href}>
                {content.secondary.label}
                <ArrowDown size={16} />
              </a>
            </div>
          </div>
          <div className="hero-rule">
            <span>{content.footnote}</span>
            <span aria-hidden="true">[ NX — 001 ]</span>
          </div>
        </section>
        <section
          className="source-strip section-wrap"
          aria-label={content.sourcesLabel}
        >
          <p>{content.sourcesLabel}</p>
          <div>
            {content.sources.map((source) => (
              <span key={source}>{source}</span>
            ))}
          </div>
        </section>
        <section className="approach section-wrap" id="approach">
          <div className="section-intro">
            <p className="eyebrow">{content.intro.label}</p>
            <h2>{content.intro.title}</h2>
            <p>{content.intro.description}</p>
          </div>
          <div className="feature-grid">
            {content.steps.map(
              ({ number, icon: Icon, title, description, tag }) => (
                <article className="feature" key={number}>
                  <div className="feature-top">
                    <Icon size={30} strokeWidth={1.3} />
                    <span>{number}</span>
                  </div>
                  <p className="eyebrow">{tag}</p>
                  <h3>{title}</h3>
                  <p>{description}</p>
                </article>
              ),
            )}
          </div>
        </section>
        <section className="network-section" id="perspective">
          <div className="section-wrap network-layout">
            <div>
              <p className="eyebrow">{content.network.label}</p>
              <h2>{content.network.title}</h2>
              <p className="network-description">
                {content.network.description}
              </p>
              <ul className="network-legend">
                {content.network.legend.map((label, i) => (
                  <li key={label}>
                    <span className={`legend-dot legend-${i}`} />
                    {label}
                  </li>
                ))}
              </ul>
            </div>
            <figure>
              <NarrativeNetwork />
              <figcaption>
                <span>{content.network.badge}</span>
                {content.network.note}
              </figcaption>
            </figure>
          </div>
        </section>
        <section className="closing section-wrap">
          <p className="eyebrow">{content.closing.label}</p>
          <h2>{content.closing.title}</h2>
          <div className="closing-action">
            <p>{content.closing.description}</p>
            <Link className="button button-dark" href={content.primary.href}>
              {content.primary.label}
              <ArrowUpRight size={20} />
            </Link>
          </div>
          <Brand decorative />
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
