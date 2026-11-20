"use client";

import { useEffect, type ReactNode, type RefObject } from "react";

export default function FullScreenDialog({ dialogRef, label, open, onClose, children }: {
  dialogRef: RefObject<HTMLDialogElement | null>;
  label: string;
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}) {
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog || dialog.open === open) return;
    if (open) dialog.showModal();
    else dialog.close();
  }, [dialogRef, open]);

  return (
    <dialog
      ref={dialogRef}
      onClose={event => {
        if (event.target === event.currentTarget) onClose();
      }}
      aria-label={label}
      className="fixed inset-0 m-0 h-dvh max-h-none w-full max-w-none overflow-hidden border-none bg-surface p-0 text-foreground"
    >
      {open && <div className="flex h-full flex-col motion-safe:animate-graph-panel">{children}</div>}
    </dialog>
  );
}
