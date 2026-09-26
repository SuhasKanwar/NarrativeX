"use client";

import { useEffect, useRef } from "react";

export function Reveal({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (preference.matches) return;
    element.dataset.visible = "false";
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          element.dataset.visible = "true";
          observer.disconnect();
        }
      },
      { threshold: 0.05 },
    );
    observer.observe(element);
    const show = () => {
      if (preference.matches) {
        element.dataset.visible = "true";
        observer.disconnect();
      }
    };
    preference.addEventListener("change", show);
    return () => { observer.disconnect(); preference.removeEventListener("change", show); };
  }, []);
  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`reveal-up ${className}`}
    >
      {children}
    </div>
  );
}

export function FeedState({
  loading,
  error,
  empty,
  retry,
}: {
  loading?: boolean;
  error?: string;
  empty?: string;
  retry?: () => void;
}) {
  if (loading)
    return (
      <div
        role="status"
        className="motion-stagger space-y-4 rounded-2xl border border-border p-6"
      >
        <span className="sr-only">Loading feed</span>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="h-16 rounded-xl bg-surface motion-safe:animate-pulse"
          />
        ))}
      </div>
    );
  return (
    <div
      className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted"
      role={error ? "alert" : undefined}
    >
      {error || empty}
      {error && retry && (
        <button
          onClick={retry}
          className="mx-auto mt-4 block rounded-lg border border-border px-4 py-2 text-foreground transition hover:bg-surface"
        >
          Try again
        </button>
      )}
    </div>
  );
}
