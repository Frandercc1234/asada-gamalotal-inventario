"use client";

import { useEffect, type MouseEvent, type ReactNode } from "react";
import { X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function Modal({
  open,
  onClose,
  title,
  children,
  className,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  className?: string;
}) {
  useEffect(() => {
    if (!open) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = original;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  function detenerPropagacion(e: MouseEvent) {
    e.stopPropagation();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 animate-overlay-in"
      onClick={onClose}
    >
      <Card
        className={cn("w-full max-w-lg animate-modal-in", className)}
        onClick={detenerPropagacion}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold tracking-tight text-text-primary">
            {title}
          </h2>
          <button
            onClick={onClose}
            aria-label="Cerrar"
            className="rounded-lg p-1.5 text-text-secondary transition-colors hover:bg-surface hover:text-text-primary"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        {children}
      </Card>
    </div>
  );
}
