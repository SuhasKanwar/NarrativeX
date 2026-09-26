"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

/** Animate navigation without remounting forms or restarting data requests. */
export default function PageMotion({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = ref.current;
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!element || preference.matches) return;
    const animation = element.animate(
      [{ opacity: 0, translate: "0 28px" }, { opacity: 1, translate: "0 0" }],
      { duration: 650, easing: "cubic-bezier(.16,1,.3,1)" },
    );
    const cancel = () => animation.cancel();
    preference.addEventListener("change", cancel);
    return () => { cancel(); preference.removeEventListener("change", cancel); };
  }, [pathname]);
  return <div ref={ref} className="min-w-0 flex-1">{children}</div>;
}
