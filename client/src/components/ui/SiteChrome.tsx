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
    <div className="brand brand-large" aria-hidden="true">
      {mark}
    </div>
  ) : (
    <Link href="/" className="brand" aria-label={chrome.homeLabel}>
      {mark}
    </Link>
  );
}

export function SiteHeader() {
  return (
    <>
      <a className="skip-link" href="#main-content">
        {chrome.skip}
      </a>
      <header className="site-header section-wrap">
        <Brand />
        <nav className="desktop-nav" aria-label="Main navigation">
          {chrome.navigation.map((item) => (
            <Link key={item.href} href={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="header-actions">
          <Link className="signin-link" href={chrome.signin.href}>
            {chrome.signin.label}
          </Link>
          <Link
            className="button button-small button-dark"
            href={chrome.signup.href}
          >
            {chrome.signup.label}
            <ArrowUpRight size={16} />
          </Link>
        </div>
        <details className="mobile-menu">
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
    <footer className="site-footer section-wrap">
      <span>{chrome.footer}</span>
      <span>
        © {new Date().getFullYear()} {chrome.copyright}
      </span>
    </footer>
  );
}
