import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "danger" | "ghost";
type Size = "sm" | "md" | "lg";

const variantes: Record<Variant, string> = {
  primary:
    "bg-primary text-white shadow-sm hover:bg-primary-hover hover:shadow-md active:bg-primary-hover disabled:bg-primary/40 disabled:shadow-none",
  secondary:
    "border border-border bg-white text-text-primary shadow-sm hover:bg-surface hover:shadow-md active:bg-surface disabled:opacity-50 disabled:shadow-none",
  danger:
    "bg-danger text-white shadow-sm hover:bg-danger/90 hover:shadow-md disabled:bg-danger/40 disabled:shadow-none",
  ghost:
    "text-text-secondary hover:bg-surface hover:text-text-primary disabled:opacity-50",
};

const tamanos: Record<Size, string> = {
  sm: "h-9 px-3 text-sm gap-1.5",
  md: "h-10 px-4 text-sm gap-2",
  lg: "h-11 px-6 text-base gap-2",
};

// Reutilizable para estilar <a>/<Link> como botón.
export function buttonClasses(variant: Variant = "primary", size: Size = "md") {
  return cn(
    "inline-flex items-center justify-center rounded-lg font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed",
    variantes[variant],
    tamanos[size],
  );
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export function Button({
  className,
  variant = "primary",
  size = "md",
  ...props
}: ButtonProps) {
  return (
    <button className={cn(buttonClasses(variant, size), className)} {...props} />
  );
}
