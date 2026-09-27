"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { ArrowUpRight, LayoutDashboard, LogOut, Sparkles } from "lucide-react";
import Logo from "../ui/Logo";

const navigation = [
  { href: "/dashboard", label: "Intelligence desk", icon: LayoutDashboard },
  { href: "/dashboard/bot", label: "Research studio", icon: Sparkles },
];
const copy = {
  workspace: "WORKSPACE / 01",
  note: "A little more context.\nA different perspective.",
  home: "Explore NarrativeX",
  signout: "Sign out",
  skip: "Skip to workspace",
  edition: "THE CONNECTED PERSPECTIVE",
};

export default function WorkspaceShell({
  children,
  name,
  imageUrl,
}: {
  children: React.ReactNode;
  name: string;
  imageUrl?: string | null;
}) {
  const path = usePathname();
  const researchStudio = path.startsWith("/dashboard/bot");
  return (
    <div
      className={`${researchStudio ? "grid h-dvh grid-rows-[auto_minmax(0,1fr)] overflow-hidden lg:grid-rows-1" : "min-h-svh"} lg:grid lg:grid-cols-[232px_minmax(0,1fr)]`}
    >
      <a
        href="#workspace"
        className="sr-only focus:not-sr-only focus:fixed focus:z-50 focus:bg-accent focus:p-4"
      >
        {copy.skip}
      </a>
      <aside className="border-b border-border bg-surface lg:sticky lg:top-0 lg:flex lg:h-svh lg:flex-col lg:border-r lg:border-b-0">
        <div className="flex items-center justify-between px-5 py-5 lg:block lg:px-7 lg:py-8">
          <Logo />
          <span className="hidden pt-10 text-[10px] tracking-[.22em] text-muted lg:block">
            {copy.workspace}
          </span>
        </div>
        <nav
          aria-label="Workspace"
          className="flex gap-2 overflow-x-auto px-4 pb-4 lg:flex-col lg:px-4"
        >
          {navigation.map(({ href, label, icon: Icon }) => {
            const active =
              href === "/dashboard" ? path === href : path.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={`group flex shrink-0 items-center gap-3 rounded-xl px-4 py-3 text-xs font-medium transition-all duration-300 hover:translate-x-1 ${active ? "bg-dark-surface text-inverse shadow-lg shadow-dark-surface/10" : "text-muted hover:bg-surface-raised hover:text-foreground"}`}
              >
                <Icon
                  size={17}
                  className="transition-transform duration-300 group-hover:rotate-12"
                />
                {label}
                {active && (
                  <span className="ml-auto size-1.5 rounded-full bg-accent" />
                )}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto hidden p-6 lg:block">
          <div className="mb-8 rounded-2xl border border-border p-5">
            <Sparkles className="mb-4 text-accent" size={22} />
            <p className="whitespace-pre-line font-editorial text-xl leading-snug">
              {copy.note}
            </p>
            <Link
              href="/"
              className="mt-5 flex items-center gap-2 text-[10px] text-muted"
            >
              {copy.home}
              <ArrowUpRight size={13} />
            </Link>
          </div>
        </div>
        <div className="flex items-center gap-3 border-t border-border px-6 py-4">
          <span className="grid size-8 shrink-0 place-items-center overflow-hidden rounded-full bg-sage text-xs font-bold">
            {imageUrl ? (
              <Image src={imageUrl} alt="" width={32} height={32} className="size-full object-cover" />
            ) : (
              name.slice(0, 1).toUpperCase()
            )}
          </span>
          <span className="min-w-0 flex-1 truncate text-xs">{name}</span>
          <button
            onClick={() => signOut({ callbackUrl: "/auth/signin" })}
            aria-label={copy.signout}
            className="rounded-lg p-2 text-muted transition hover:bg-border"
          >
            <LogOut size={16} />
          </button>
        </div>
      </aside>
      <div
        className={`${researchStudio ? "flex min-h-0 min-w-0 flex-col overflow-hidden" : "min-w-0"}`}
      >
        <header className="flex shrink-0 items-center justify-between border-b border-border px-5 py-5 md:px-9">
          <span className="text-[9px] tracking-[.2em] text-muted">
            {copy.edition}
          </span>
          <span className="flex items-center gap-2 text-[10px] text-muted">
            <span className="size-1.5 rounded-full bg-sage" />
            {path.includes("/bot") ? "Research studio" : "Intelligence desk"}
          </span>
        </header>
        <main
          id="workspace"
          className={`${researchStudio ? "mx-auto flex min-h-0 w-full max-w-400 flex-1 flex-col overflow-hidden p-3 sm:p-5 md:p-6" : "mx-auto max-w-400 p-5 md:p-9"}`}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
