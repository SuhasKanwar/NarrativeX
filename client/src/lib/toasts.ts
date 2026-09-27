export type Toast = {
  id: number;
  kind: "success" | "error";
  message: string;
};

let nextId = 0;
let snapshot: Toast[] = [];
const listeners = new Set<() => void>();

export function getToasts() {
  return snapshot;
}

export function subscribeToasts(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function dismissToast(id: number) {
  snapshot = snapshot.filter((toast) => toast.id !== id);
  listeners.forEach((listener) => listener());
}

export function pushToast(kind: Toast["kind"], message: string) {
  const id = ++nextId;
  snapshot = [...snapshot, { id, kind, message }].slice(-4);
  listeners.forEach((listener) => listener());
  if (typeof window !== "undefined") {
    window.setTimeout(() => dismissToast(id), 4500);
  }
}
