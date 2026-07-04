import type {
  InputHTMLAttributes,
  LabelHTMLAttributes,
  SelectHTMLAttributes,
} from "react";
import { cn } from "@/lib/utils";

const base =
  "h-10 w-full rounded-lg border border-border bg-white px-3 text-sm text-text-primary placeholder:text-text-secondary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary disabled:opacity-50 disabled:bg-surface";

export function Input({
  className,
  "aria-invalid": ariaInvalid,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        base,
        ariaInvalid && "border-danger focus-visible:ring-danger",
        className,
      )}
      aria-invalid={ariaInvalid}
      {...props}
    />
  );
}

export function Select({
  className,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={cn(base, "pr-8", className)} {...props} />;
}

export function Label({
  className,
  ...props
}: LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn("mb-1.5 block text-sm font-medium text-text-primary", className)}
      {...props}
    />
  );
}
