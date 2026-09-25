"use client";

import { useEffect } from "react";

export default function ScrollEffects() {
  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const elements = document.querySelectorAll<HTMLElement>("[data-reveal]");
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.setAttribute("data-visible", "true");
            observer.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.12 },
    );
    function configure() {
      observer.disconnect();
      for (const element of elements) {
        if (motion.matches) {
          element.dataset.visible = "true";
        } else {
          element.dataset.visible = "false";
          observer.observe(element);
        }
      }
    }
    configure();
    motion.addEventListener("change", configure);
    return () => {
      observer.disconnect();
      motion.removeEventListener("change", configure);
      elements.forEach((element) => {
        delete element.dataset.visible;
      });
    };
  }, []);
  return (
    <div
      className="scroll-progress fixed top-0 left-0 z-50 h-[3px] w-full origin-left scale-x-0 bg-accent supports-[animation-timeline:scroll()]:animate-reading supports-[animation-timeline:scroll()]:[animation-timeline:scroll()] motion-reduce:hidden"
      aria-hidden="true"
    />
  );
}
