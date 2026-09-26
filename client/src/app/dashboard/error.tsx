"use client";
import { FeedState } from "@/components/dashboard/Motion";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <FeedState
      error="The workspace could not load. Please try again."
      retry={reset}
    />
  );
}
