import Link from "next/link";
import { ArrowUpRight, LoaderCircle } from "lucide-react";
import { SiteFooter } from "./SiteChrome";
import Logo from "./Logo";

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
    <div className="status-shell flex min-h-svh flex-col">
      <header className="section-wrap mx-auto w-[calc(100%-40px)] max-w-332 md:w-[calc(100%-64px)] xl:w-[calc(100%-112px)] status-header py-9">
        <Logo />
      </header>
      <main
        id="main-content"
        className="status-content flex flex-1 flex-col items-center justify-center pt-10 pb-20 text-center motion-safe:animate-enter [&_h1]:mt-4 [&_h1]:mb-5 [&_h1]:text-[clamp(2.2rem,5vw,4rem)] [&_h1]:tracking-[-.055em] [&>.button]:mt-8 section-wrap mx-auto w-[calc(100%-40px)] max-w-332 md:w-[calc(100%-64px)] xl:w-[calc(100%-112px)]"
      >
        <div
          className="status-art mb-6 font-editorial text-[clamp(7rem,19vw,14rem)] leading-[1.2] tracking-[-.08em] text-accent italic [&_svg]:size-28 [&_svg]:stroke-1 motion-safe:[&_svg]:animate-[spin_6s_linear_infinite]"
          aria-hidden="true"
        >
          {loading ? <LoaderCircle /> : code === "404" ? code : "✳"}
        </div>
        <div
          role={loading ? "status" : undefined}
          aria-live={loading ? "polite" : undefined}
        >
          <p className="eyebrow text-[.66rem] font-semibold leading-relaxed tracking-[.14em] uppercase">
            {code}
          </p>
          <h1>{title}</h1>
          <p className="status-description mx-auto max-w-107.5 text-sm leading-8 text-muted">
            {description}
          </p>
        </div>
        {action &&
          (action.href ? (
            <Link
              className="button inline-flex min-h-13.5 items-center justify-center gap-7 rounded-sm border border-transparent px-6 py-3.5 text-sm font-semibold transition duration-200 hover:-translate-y-0.5 [&_svg]:transition-transform hover:[&_svg]:translate-x-0.5 hover:[&_svg]:-translate-y-0.5 button-dark bg-foreground text-inverse hover:bg-dark-border"
              href={action.href}
            >
              {action.label}
              <ArrowUpRight size={18} />
            </Link>
          ) : (
            <button
              className="button inline-flex min-h-13.5 items-center justify-center gap-7 rounded-sm border border-transparent px-6 py-3.5 text-sm font-semibold transition duration-200 hover:-translate-y-0.5 [&_svg]:transition-transform hover:[&_svg]:translate-x-0.5 hover:[&_svg]:-translate-y-0.5 button-dark bg-foreground text-inverse hover:bg-dark-border"
              onClick={action.onClick}
            >
              {action.label}
              <ArrowUpRight size={18} />
            </button>
          ))}
      </main>
      <SiteFooter />
    </div>
  );
}
