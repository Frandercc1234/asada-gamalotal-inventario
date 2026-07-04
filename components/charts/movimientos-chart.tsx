"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export type PuntoMovimiento = {
  fecha: string;
  entradas: number;
  salidas: number;
};

// Colores de los tokens del tema (validados para contraste y daltonismo).
const COLOR_ENTRADAS = "var(--color-primary)";
const COLOR_SALIDAS = "var(--color-warning)";

export function MovimientosChart({ data }: { data: PuntoMovimiento[] }) {
  const sinDatos = data.every((d) => d.entradas === 0 && d.salidas === 0);

  if (sinDatos) {
    return (
      <p className="py-12 text-center text-sm text-text-secondary">
        Sin movimientos en el período.
      </p>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 8, right: 4, bottom: 0, left: -20 }} barGap={2}>
        <CartesianGrid
          vertical={false}
          stroke="var(--color-border)"
          strokeDasharray="3 3"
        />
        <XAxis
          dataKey="fecha"
          fontSize={11}
          stroke="var(--color-text-secondary)"
          tickLine={false}
          axisLine={false}
          minTickGap={24}
        />
        <YAxis
          fontSize={11}
          stroke="var(--color-text-secondary)"
          tickLine={false}
          axisLine={false}
          allowDecimals={false}
        />
        <Tooltip
          cursor={{ fill: "var(--color-border)", opacity: 0.35 }}
          contentStyle={{
            borderRadius: 8,
            border: "1px solid var(--color-border)",
            boxShadow: "0 4px 12px rgb(0 0 0 / 0.06)",
            fontSize: 13,
          }}
          labelStyle={{ fontWeight: 600, marginBottom: 4 }}
        />
        <Bar
          dataKey="entradas"
          name="Entradas"
          fill={COLOR_ENTRADAS}
          radius={[3, 3, 0, 0]}
          maxBarSize={14}
        />
        <Bar
          dataKey="salidas"
          name="Salidas"
          fill={COLOR_SALIDAS}
          radius={[3, 3, 0, 0]}
          maxBarSize={14}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}

// Leyenda propia (la de Recharts no usa los tokens del tema).
export function ChartLegend() {
  return (
    <div className="flex items-center gap-4 text-xs text-text-secondary">
      <span className="flex items-center gap-1.5">
        <span
          className="h-2.5 w-2.5 rounded-sm bg-primary"
          aria-hidden="true"
        />
        Entradas
      </span>
      <span className="flex items-center gap-1.5">
        <span
          className="h-2.5 w-2.5 rounded-sm bg-warning"
          aria-hidden="true"
        />
        Salidas
      </span>
    </div>
  );
}
