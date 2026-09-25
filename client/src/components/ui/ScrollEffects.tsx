"use client";

import { useEffect } from "react";

export default function ScrollEffects() {
  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const elements = document.querySelectorAll<HTMLElement>("[data-reveal]");
    const parallax = document.querySelectorAll<HTMLElement>("[data-parallax]");
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.setAttribute("data-visible", "true");
            observer.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.08, rootMargin: "0px 0px -8%" },
    );
    let frame = 0;
    function updateParallax() {
      frame = 0;
      if (motion.matches) return;
      for (const element of parallax) {
        const speed = Number(element.dataset.parallax ?? 0.1);
        const center =
          element.getBoundingClientRect().top + element.offsetHeight / 2;
        const offset = (window.innerHeight / 2 - center) * speed;
        element.style.setProperty(
          "--parallax-y",
          `${Math.round(Math.max(-120, Math.min(120, offset)))}px`,
        );
      }
      const maxScroll =
        document.documentElement.scrollHeight - window.innerHeight;
      document.documentElement.style.setProperty(
        "--reading-progress",
        String(maxScroll > 0 ? window.scrollY / maxScroll : 0),
      );
    }
    function requestParallax() {
      if (!frame) frame = window.requestAnimationFrame(updateParallax);
    }
    function configure() {
      observer.disconnect();
      elements.forEach((element, index) => {
        element.style.transitionDelay = `${Number(element.dataset.revealDelay ?? index % 3) * 110}ms`;
        if (motion.matches) {
          element.dataset.visible = "true";
        } else {
          element.dataset.visible = "false";
          observer.observe(element);
        }
      });
      updateParallax();
    }
    configure();
    window.addEventListener("scroll", requestParallax, { passive: true });
    window.addEventListener("resize", requestParallax);
    motion.addEventListener("change", configure);
    return () => {
      observer.disconnect();
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", requestParallax);
      window.removeEventListener("resize", requestParallax);
      motion.removeEventListener("change", configure);
      elements.forEach((element) => {
        delete element.dataset.visible;
        element.style.removeProperty("transition-delay");
      });
      parallax.forEach((element) =>
        element.style.removeProperty("--parallax-y"),
      );
      document.documentElement.style.removeProperty("--reading-progress");
    };
  }, []);
  return (
    <div
      className="scroll-progress fixed top-0 left-0 z-50 h-1 w-full origin-left bg-accent shadow-[0_0_18px_var(--accent)] transform-[scaleX(var(--reading-progress,0))] motion-reduce:hidden"
      aria-hidden="true"
    />
  );
}
