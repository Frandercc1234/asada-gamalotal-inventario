import type { HTMLAttributes, TdHTMLAttributes, ThHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

// En móvil y tablet cada fila se apila como tarjeta: la cabecera se oculta y las
// celdas con `label` muestran su título al lado del valor.
export function Table({ className, ...props }: HTMLAttributes<HTMLTableElement>) {
  return (
    <div className="overflow-x-auto">
      <table className={cn("w-full text-sm max-lg:block", className)} {...props} />
    </div>
  );
}

export function TableHead({
  className,
  ...props
}: HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <thead
      className={cn(
        "sticky top-0 z-10 border-b border-border bg-surface text-left text-text-secondary max-lg:hidden",
        className,
      )}
      {...props}
    />
  );
}

export function TableBody({
  className,
  ...props
}: HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <tbody
      className={cn("divide-y divide-border max-lg:block", className)}
      {...props}
    />
  );
}

export function TableRow({
  className,
  ...props
}: HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr
      className={cn(
        "transition-colors hover:bg-surface/60 max-lg:block max-lg:space-y-2 max-lg:p-4",
        className,
      )}
      {...props}
    />
  );
}

export function Th({ className, ...props }: ThHTMLAttributes<HTMLTableCellElement>) {
  return <th className={cn("px-4 py-3 font-medium", className)} {...props} />;
}

export function Td({
  className,
  numeric,
  label,
  ...props
}: TdHTMLAttributes<HTMLTableCellElement> & {
  numeric?: boolean;
  label?: string;
}) {
  return (
    <td
      data-label={label}
      className={cn(
        "px-4 py-3 max-lg:block max-lg:p-0 max-lg:[overflow-wrap:anywhere]",
        numeric && "tabular-nums",
        label &&
          "max-lg:flex max-lg:items-center max-lg:justify-between max-lg:gap-4 max-lg:text-right max-lg:before:shrink-0 max-lg:before:text-left max-lg:before:text-text-secondary max-lg:before:content-[attr(data-label)]",
        className,
      )}
      {...props}
    />
  );
}
