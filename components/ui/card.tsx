import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Card({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-white p-6 shadow-sm",
        className,
      )}
      {...props}
    />
  );
}

type BadgeTone = "gray" | "green" | "red" | "amber" | "sky";

const tonos: Record<BadgeTone, string> = {
  gray: "bg-surface text-text-secondary",
  green: "bg-success-bg text-success",
  red: "bg-danger-bg text-danger",
  amber: "bg-warning-bg text-warning",
  sky: "bg-primary/10 text-primary",
};

export function Badge({
  className,
  tone = "gray",
  ...props
}: HTMLAttributes<HTMLSpanElement> & { tone?: BadgeTone }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        tonos[tone],
        className,
      )}
      {...props}
    />
  );
}
