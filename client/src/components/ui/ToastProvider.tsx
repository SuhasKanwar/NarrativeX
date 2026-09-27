"use client";

import { useSyncExternalStore } from "react";
import { AlertCircle, CheckCircle2, X } from "lucide-react";
import { dismissToast, getToasts, subscribeToasts } from "@/lib/toasts";

const EMPTY_TOASTS: ReturnType<typeof getToasts> = [];

export default function ToastProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const toasts = useSyncExternalStore(subscribeToasts, getToasts, () => EMPTY_TOASTS);

  return (
    <>
      {children}
      <div className="pointer-events-none fixed right-4 bottom-4 z-[100] flex w-[min(24rem,calc(100vw-2rem))] flex-col gap-2 sm:right-6 sm:bottom-6">
        {toasts.map((toast) => {
          const Icon = toast.kind === "error" ? AlertCircle : CheckCircle2;
          return (
            <div
              key={toast.id}
              role={toast.kind === "error" ? "alert" : "status"}
              className="pointer-events-auto flex items-start gap-3 rounded-xl border border-border bg-surface-raised p-4 text-sm text-foreground shadow-xl motion-safe:animate-enter"
            >
              <Icon
                size={17}
                aria-hidden="true"
                className={toast.kind === "error" ? "shrink-0 text-error" : "shrink-0 text-sage"}
              />
              <p className="min-w-0 flex-1 break-words">{toast.message}</p>
              <button
                type="button"
                aria-label="Dismiss notification"
                onClick={() => dismissToast(toast.id)}
                className="-mt-1 -mr-1 rounded-md p-1 text-muted transition hover:bg-surface hover:text-foreground"
              >
                <X size={15} />
              </button>
            </div>
          );
        })}
      </div>
    </>
  );
}
