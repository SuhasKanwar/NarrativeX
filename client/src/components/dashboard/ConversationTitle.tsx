"use client";

import { useEffect, useId, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

export default function ConversationTitle({ title }: { title: string }) {
  const heading = useRef<HTMLHeadingElement>(null);
  const headingId = useId();
  const [overflow, setOverflow] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const element = heading.current;
    if (!element || expanded) return;
    const measure = () => setOverflow(element.scrollHeight > element.clientHeight + 1);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, [expanded, title]);

  return (
    <div className="min-w-0 flex-1">
      <h1 ref={heading} id={headingId} title={!expanded && overflow ? title : undefined}
        className={`font-editorial text-xl leading-snug [overflow-wrap:anywhere] sm:text-2xl ${expanded ? "max-h-[35dvh] overflow-y-auto" : "line-clamp-2"}`}>
        {title}
      </h1>
      {(overflow || expanded) && (
        <button
          type="button"
          aria-expanded={expanded}
          aria-controls={headingId}
          onClick={() => setExpanded(value => !value)}
          className="mt-1 inline-flex items-center gap-1.5 rounded-sm text-xs text-focus hover:underline"
        >
          {expanded ? "Show less" : "Show full title"}
          <ChevronDown size={13} aria-hidden="true" className={`motion-safe:transition-transform ${expanded ? "rotate-180" : ""}`} />
        </button>
      )}
    </div>
  );
}
