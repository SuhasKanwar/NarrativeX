"use client";
import StatusScreen from "@/components/ui/StatusScreen";

const content = {
  code: "A SMALL INTERRUPTION",
  title: "Let's pick up the thread.",
  description:
    "Something went wrong while loading this page. Give it another try.",
  retry: "Try again",
};
export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <StatusScreen
      {...content}
      action={{ label: content.retry, onClick: reset }}
    />
  );
}
