import Form from "next/form";
import Link from "next/link";
import { Button, buttonClasses } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";

export function FiltroFechas({
  ruta,
  desde,
  hasta,
  ocultos = {},
}: {
  ruta: string;
  desde: string;
  hasta: string;
  ocultos?: Record<string, string>;
}) {
  const consulta = new URLSearchParams(ocultos).toString();

  return (
    <Card>
      <Form action={ruta} className="flex flex-wrap items-end gap-3">
        {Object.entries(ocultos).map(([nombre, valor]) => (
          <input key={nombre} type="hidden" name={nombre} value={valor} />
        ))}
        <div className="min-w-36 flex-1 sm:flex-none">
          <Label htmlFor="filtro-desde">Desde</Label>
          <Input id="filtro-desde" name="desde" type="date" defaultValue={desde} />
        </div>
        <div className="min-w-36 flex-1 sm:flex-none">
          <Label htmlFor="filtro-hasta">Hasta</Label>
          <Input id="filtro-hasta" name="hasta" type="date" defaultValue={hasta} />
        </div>
        <Button type="submit" variant="secondary">
          Filtrar
        </Button>
        {(desde || hasta) && (
          <Link
            href={consulta ? `${ruta}?${consulta}` : ruta}
            className={buttonClasses("ghost")}
          >
            Limpiar
          </Link>
        )}
      </Form>
    </Card>
  );
}
