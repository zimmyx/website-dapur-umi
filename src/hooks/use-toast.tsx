"use client";

import { useEffect, useState, useCallback } from "react";

// ─── Toast Types ──────────────────────────────────────────────────────────────

export type ToastType = "success" | "error" | "info" | "warning";

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  duration?: number;
}

// ─── Global Toast Bus (simple event-based) ────────────────────────────────────

type Listener = (toasts: Toast[]) => void;

let toasts: Toast[] = [];
const listeners = new Set<Listener>();

function emit() {
  for (const listener of listeners) listener(toasts);
}

function pushToast(toast: Omit<Toast, "id">) {
  const id =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `t-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const next: Toast = { id, duration: 3500, ...toast };
  toasts = [...toasts, next];
  emit();

  if (next.duration && next.duration > 0) {
    setTimeout(() => dismissToast(id), next.duration);
  }
  return id;
}

function dismissToast(id: string) {
  toasts = toasts.filter((t) => t.id !== id);
  emit();
}

// ─── Public API ───────────────────────────────────────────────────────────────

export const toast = {
  success: (title: string, description?: string) =>
    pushToast({ type: "success", title, description }),
  error: (title: string, description?: string) =>
    pushToast({ type: "error", title, description, duration: 5000 }),
  info: (title: string, description?: string) =>
    pushToast({ type: "info", title, description }),
  warning: (title: string, description?: string) =>
    pushToast({ type: "warning", title, description }),
  dismiss: dismissToast,
};

// ─── Hook for the Toaster component ───────────────────────────────────────────

export function useToastStore() {
  const [items, setItems] = useState<Toast[]>(toasts);

  useEffect(() => {
    const listener: Listener = (next) => setItems(next);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  const dismiss = useCallback((id: string) => dismissToast(id), []);

  return { toasts: items, dismiss };
}
