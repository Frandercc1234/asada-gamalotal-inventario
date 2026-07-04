import Link from "next/link";
import {
  AlertTriangle,
  ArrowDownLeft,
  ArrowUpRight,
  ArrowLeftRight,
  CheckCircle2,
  ClipboardList,
  Package,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { createClient, getPerfilActual } from "@/lib/supabase/server";
import { buttonClasses } from "@/components/ui/button";
import { Card, Badge } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import {
  MovimientosChart,
  ChartLegend,
  type PuntoMovimiento,
} from "@/components/charts/movimientos-chart";
import { cn, formatColones, formatFecha } from "@/lib/utils";

const DIAS_PERIODO = 30;

export default async function DashboardPage() {
  const supabase = await createClient();

  const desde = new Date();
  desde.setDate(desde.getDate() - DIAS_PERIODO);

  const [{ data: productos }, { data: alertas }, { data: movs }, { data: recientes }, perfil] =
    await Promise.all([
      supabase
        .from("productos")
        .select("stock_actual, precio")
        .eq("activo", true),
      supabase
        .from("v_alertas_stock")
        .select("id, codigo, nombre, stock_actual, stock_minimo")
        .order("stock_actual"),
      supabase
        .from("movimientos")
        .select("tipo, cantidad, created_at")
        .gte("created_at", desde.toISOString()),
      supabase
        .from("movimientos")
        .select("id, tipo, cantidad, created_at, productos(nombre, unidad), profiles(nombre)")
        .order("created_at", { ascending: false })
        .limit(6),
      getPerfilActual(),
    ]);

  const totalProductos = productos?.length ?? 0;
  const valorInventario =
    productos?.reduce((acc, p) => acc + p.stock_actual * p.precio, 0) ?? 0;
  const totalAlertas = alertas?.length ?? 0;

  // Serie diaria completa: los días sin movimientos también cuentan (en cero).
  const etiqueta = (d: Date) =>
    d.toLocaleDateString("es-CR", { day: "2-digit", month: "2-digit" });

  const porDia = new Map<string, PuntoMovimiento>();
  for (let i = DIAS_PERIODO; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const fecha = etiqueta(d);
    porDia.set(fecha, { fecha, entradas: 0, salidas: 0 });
  }

  let totalEntradas = 0;
  let totalSalidas = 0;
  for (const m of movs ?? []) {
    const punto = porDia.get(etiqueta(new Date(m.created_at)));
    if (!punto) continue;
    if (m.tipo === "entrada") {
      punto.entradas += m.cantidad;
      totalEntradas += m.cantidad;
    } else {
      punto.salidas += m.cantidad;
      totalSalidas += m.cantidad;
    }
  }
  const dataChart = Array.from(porDia.values());

  const hoy = new Intl.DateTimeFormat("es-CR", {
    dateStyle: "full",
    timeZone: "America/Costa_Rica",
  }).format(new Date());

  const primerNombre = perfil?.nombre.split(" ")[0] || "";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-text-primary">
            {primerNombre ? `Hola, ${primerNombre}` : "Dashboard"}
          </h1>
          <p className="mt-1 text-sm capitalize text-text-secondary">{hoy}</p>
        </div>
        <Link href="/movimientos" className={buttonClasses("primary", "md")}>
          Registrar movimiento
        </Link>
      </div>

      <Card className="grid grid-cols-2 gap-px overflow-hidden bg-border p-0 lg:grid-cols-4">
        <Stat
          icon={Package}
          label="Productos activos"
          valor={totalProductos.toString()}
          contexto="Catálogo vigente"
        />
        <Stat
          icon={Wallet}
          label="Valor del inventario"
          valor={formatColones(valorInventario)}
          contexto="Stock × precio"
        />
        <Stat
          icon={AlertTriangle}
          label="Alertas de stock"
          valor={totalAlertas.toString()}
          contexto={totalAlertas > 0 ? "Requieren atención" : "Todo en orden"}
          alerta={totalAlertas > 0}
        />
        <Stat
          icon={ArrowLeftRight}
          label={`Movimientos (${DIAS_PERIODO} días)`}
          valor={(totalEntradas + totalSalidas).toString()}
          contexto={`${totalEntradas} entradas · ${totalSalidas} salidas`}
        />
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-semibold tracking-tight text-text-primary">
              Movimientos por día
            </h2>
            <ChartLegend />
          </div>
          <MovimientosChart data={dataChart} />
        </Card>

        <Card
          className={cn(
            "overflow-hidden p-0",
            totalAlertas > 0 && "border-warning/40",
          )}
        >
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <h2 className="font-semibold tracking-tight text-text-primary">
              Bajo mínimo
            </h2>
            {totalAlertas > 0 && <Badge tone="red">{totalAlertas}</Badge>}
          </div>
          {totalAlertas === 0 ? (
            <div className="flex flex-col items-center gap-2 px-4 py-10 text-center">
              <CheckCircle2
                className="h-8 w-8 text-success"
                strokeWidth={1.5}
              />
              <p className="text-sm text-text-secondary">
                Todo el stock está por encima del mínimo.
              </p>
            </div>
          ) : (
            <>
              <ul className="divide-y divide-border">
                {(alertas ?? []).slice(0, 6).map((a) => (
                  <li
                    key={a.id}
                    className="flex items-center justify-between gap-3 px-5 py-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-text-primary">
                        {a.nombre}
                      </p>
                      <p className="font-mono text-xs text-text-secondary">
                        {a.codigo}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <Badge tone={a.stock_actual === 0 ? "red" : "amber"}>
                        {a.stock_actual === 0 ? "Agotado" : "Bajo"}
                      </Badge>
                      <p className="mt-1 text-xs tabular-nums text-text-secondary">
                        {a.stock_actual} / mín. {a.stock_minimo}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="border-t border-border px-5 py-3">
                <Link
                  href="/productos"
                  className="text-sm font-medium text-primary hover:underline"
                >
                  Ver productos
                </Link>
              </div>
            </>
          )}
        </Card>
      </div>

      <Card className="overflow-hidden p-0">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="font-semibold tracking-tight text-text-primary">
            Actividad reciente
          </h2>
          <Link
            href="/movimientos"
            className="text-sm font-medium text-primary hover:underline"
          >
            Ver todo
          </Link>
        </div>
        {(recientes ?? []).length === 0 ? (
          <EmptyState
            icon={ClipboardList}
            title="Sin movimientos todavía"
            description="Los últimos movimientos van a aparecer acá."
          />
        ) : (
          <ul className="divide-y divide-border">
            {(recientes ?? []).map((m) => {
              const esEntrada = m.tipo === "entrada";
              return (
                <li
                  key={m.id}
                  className="flex items-center gap-3 px-5 py-3"
                >
                  <span
                    className={cn(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                      esEntrada ? "bg-primary/10" : "bg-warning-bg",
                    )}
                    aria-hidden="true"
                  >
                    {esEntrada ? (
                      <ArrowDownLeft className="h-4 w-4 text-primary" />
                    ) : (
                      <ArrowUpRight className="h-4 w-4 text-warning" />
                    )}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm text-text-primary">
                      <span className="font-medium">
                        {esEntrada ? "Entrada" : "Salida"}
                      </span>{" "}
                      de {m.cantidad} {m.productos?.unidad ?? ""} ·{" "}
                      {m.productos?.nombre ?? "—"}
                    </p>
                    <p className="text-xs text-text-secondary">
                      {m.profiles?.nombre ?? "—"} · {formatFecha(m.created_at)}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Card>

      {totalAlertas > 0 && (
        <p className="flex items-center gap-2 text-xs text-text-secondary">
          <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-warning" />
          Hay productos con stock en o por debajo del mínimo. Registrá una
          entrada cuando llegue el pedido.
        </p>
      )}
    </div>
  );
}

function Stat({
  icon: Icon,
  label,
  valor,
  contexto,
  alerta,
}: {
  icon: LucideIcon;
  label: string;
  valor: string;
  contexto: string;
  alerta?: boolean;
}) {
  return (
    <div className="bg-white p-4 sm:p-5">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-medium text-text-secondary">{label}</p>
        <Icon
          className={cn(
            "h-4 w-4 shrink-0",
            alerta ? "text-danger" : "text-text-secondary/70",
          )}
          strokeWidth={2}
        />
      </div>
      <p
        className={cn(
          "mt-2 text-2xl font-semibold tracking-tight tabular-nums",
          alerta ? "text-danger" : "text-text-primary",
        )}
      >
        {valor}
      </p>
      <p
        className={cn(
          "mt-1 flex items-center gap-1 text-xs",
          alerta ? "text-danger" : "text-text-secondary",
        )}
      >
        {alerta && <AlertTriangle className="h-3.5 w-3.5 shrink-0" />}
        {contexto}
      </p>
    </div>
  );
}
