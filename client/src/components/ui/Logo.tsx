import Link from "next/link";
import { Asterisk } from "lucide-react";

const content = { name: "NarrativeX", homeLabel: "NarrativeX home" };

type LogoProps = { decorative?: boolean; className?: string };

export default function Logo({
  decorative = false,
  className = "",
}: LogoProps) {
  const mark = (
    <>
      <Asterisk aria-hidden="true" strokeWidth={2.4} />
      <span>{content.name}</span>
    </>
  );
  const styles = `inline-flex items-center gap-2 text-2xl font-bold tracking-[-.065em] [&_svg]:size-8 [&_svg]:text-accent motion-safe:[&_svg]:transition-transform motion-safe:[&_svg]:duration-700 motion-safe:hover:[&_svg]:rotate-180 motion-safe:focus-visible:[&_svg]:rotate-180 ${className}`;
  return decorative ? (
    <div className={styles} aria-hidden="true">
      {mark}
    </div>
  ) : (
    <Link href="/" className={styles} aria-label={content.homeLabel}>
      {mark}
    </Link>
  );
}
