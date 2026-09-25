import Link from "next/link";
import { ArrowUpRight, Asterisk } from "lucide-react";

const chrome = {
  brand: "NarrativeX",
  homeLabel: "NarrativeX home",
  skip: "Skip to content",
  menu: "Menu",
  navigation: [
    { label: "Our approach", href: "/#approach" },
    { label: "The bigger picture", href: "/#perspective" },
  ],
  signin: { label: "Sign in", href: "/auth/signin" },
  signup: { label: "Get started", href: "/auth/signup" },
  footer: "Independent thinking. Connected perspectives.",
  copyright: "NarrativeX. Built for the curious.",
};

export function Brand({ decorative = false }: { decorative?: boolean }) {
  const mark = (
    <>
      <Asterisk aria-hidden="true" strokeWidth={2.4} />
      <span>{chrome.brand}</span>
    </>
  );
  return decorative ? (
    <div
      className="brand inline-flex items-center gap-2 text-2xl font-bold tracking-[-.065em] [&_svg]:size-8 [&_svg]:text-accent brand-large mt-16 gap-2 pb-8 text-[clamp(3.5rem,14vw,13rem)] leading-none md:mt-24 md:gap-4 md:pb-10 [&_svg]:size-[.9em]"
      aria-hidden="true"
    >
      {mark}
    </div>
  ) : (
    <Link
      href="/"
      className="brand inline-flex items-center gap-2 text-2xl font-bold tracking-[-.065em] [&_svg]:size-8 [&_svg]:text-accent"
      aria-label={chrome.homeLabel}
    >
      {mark}
    </Link>
  );
}

export function SiteHeader() {
  return (
    <>
      <a
        className="skip-link fixed top-2.5 left-2.5 z-50 -translate-y-[180%] bg-foreground p-3 text-inverse focus:translate-y-0"
        href="#main-content"
      >
        {chrome.skip}
      </a>
      <header className="site-header flex items-center justify-between gap-6 border-b border-border py-6 md:py-7 section-wrap mx-auto w-[calc(100%-40px)] max-w-[1328px] md:w-[calc(100%-64px)] xl:w-[calc(100%-112px)]">
        <Brand />
        <nav
          className="desktop-nav hidden items-center gap-8 text-xs md:flex [&_a:hover]:underline [&_a]:underline-offset-4"
          aria-label="Main navigation"
        >
          {chrome.navigation.map((item) => (
            <Link key={item.href} href={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="header-actions hidden items-center gap-8 text-xs md:flex">
          <Link
            className="signin-link hover:underline underline-offset-4"
            href={chrome.signin.href}
          >
            {chrome.signin.label}
          </Link>
          <Link
            className="button inline-flex min-h-[54px] items-center justify-center gap-7 rounded-sm border border-transparent px-6 py-3.5 text-sm font-semibold transition duration-200 hover:-translate-y-0.5 [&_svg]:transition-transform hover:[&_svg]:translate-x-0.5 hover:[&_svg]:-translate-y-0.5 button-small min-h-11 gap-5 px-4 py-2.5 text-xs button-dark bg-foreground text-inverse hover:bg-dark-border"
            href={chrome.signup.href}
          >
            {chrome.signup.label}
            <ArrowUpRight size={16} />
          </Link>
        </div>
        <details className="mobile-menu relative md:hidden [&_summary]:p-2.5 [&_summary]:text-sm [&_nav]:absolute [&_nav]:right-0 [&_nav]:top-12 [&_nav]:z-20 [&_nav]:w-60 [&_nav]:border [&_nav]:border-border [&_nav]:bg-surface-raised [&_nav]:p-4 [&_nav]:shadow-xl [&_a]:flex [&_a]:justify-between [&_a]:px-2 [&_a]:py-3.5 [&_a]:text-sm">
          <summary>{chrome.menu}</summary>
          <nav aria-label="Mobile navigation">
            {[...chrome.navigation, chrome.signin, chrome.signup].map(
              (item) => (
                <Link key={item.href} href={item.href}>
                  {item.label}
                  <ArrowUpRight size={16} />
                </Link>
              ),
            )}
          </nav>
        </details>
      </header>
    </>
  );
}

export function SiteFooter() {
  return (
    <footer className="site-footer flex flex-col justify-between gap-2 border-t border-border py-6 text-[.65rem] leading-6 text-muted md:flex-row md:gap-5 section-wrap mx-auto w-[calc(100%-40px)] max-w-[1328px] md:w-[calc(100%-64px)] xl:w-[calc(100%-112px)]">
      <span>{chrome.footer}</span>
      <span>
        © {new Date().getFullYear()} {chrome.copyright}
      </span>
    </footer>
  );
}
