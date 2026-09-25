import Link from "next/link";
import { ArrowUpRight, LoaderCircle } from "lucide-react";
import { Brand, SiteFooter } from "./SiteChrome";

type StatusScreenProps = {
  code: string;
  title: string;
  description: string;
  loading?: boolean;
  action?: { label: string; href?: string; onClick?: () => void };
};

export default function StatusScreen({
  code,
  title,
  description,
  loading = false,
  action,
}: StatusScreenProps) {
  return (
    <div className="status-shell">
      <header className="section-wrap status-header">
        <Brand />
      </header>
      <main id="main-content" className="status-content section-wrap">
        <div className="status-art" aria-hidden="true">
          {loading ? <LoaderCircle /> : code === "404" ? code : "✳"}
        </div>
        <div
          role={loading ? "status" : undefined}
          aria-live={loading ? "polite" : undefined}
        >
          <p className="eyebrow">{code}</p>
          <h1>{title}</h1>
          <p className="status-description">{description}</p>
        </div>
        {action &&
          (action.href ? (
            <Link className="button button-dark" href={action.href}>
              {action.label}
              <ArrowUpRight size={18} />
            </Link>
          ) : (
            <button className="button button-dark" onClick={action.onClick}>
              {action.label}
              <ArrowUpRight size={18} />
            </button>
          ))}
      </main>
      <SiteFooter />
    </div>
  );
}
