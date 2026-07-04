import type { Metadata } from "next";
import Image from "next/image";
import {
  Target,
  Eye,
  Check,
  Droplets,
  Headset,
  AlertTriangle,
  Wrench,
  PlusCircle,
  MapPin,
  Phone,
  UserRound,
  Clock,
  type LucideIcon,
} from "lucide-react";
import { buttonClasses } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "ASADA Gamalotal — Acueducto rural",
  description:
    "Asociación Administradora del Acueducto Rural de Gamalotal. Información institucional, servicios de agua potable y contacto para la comunidad.",
};

const VALORES = [
  "Transparencia",
  "Responsabilidad",
  "Compromiso",
  "Honestidad",
  "Servicio a la comunidad",
  "Respeto por el medio ambiente",
];

const SERVICIOS: { icon: LucideIcon; nombre: string }[] = [
  { icon: Droplets, nombre: "Administración del servicio de agua" },
  { icon: Headset, nombre: "Atención al abonado" },
  { icon: AlertTriangle, nombre: "Reporte de averías" },
  { icon: Wrench, nombre: "Mantenimiento del sistema" },
  { icon: PlusCircle, nombre: "Nuevas conexiones" },
];

const CONSEJOS = [
  "Repare las fugas apenas las detecte.",
  "Tome duchas cortas.",
  "Cierre la llave mientras no la utiliza.",
  "Riegue temprano en la mañana o por la tarde.",
  "Reutilice el agua cuando sea posible.",
  "Promueva el ahorro en su familia.",
];

export default function LandingPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/10 via-primary/5 to-white">
        <div className="mx-auto max-w-3xl px-4 pb-28 pt-20 text-center sm:px-6 sm:pb-32 sm:pt-24">
          <Image
            src="/logo-asada.png"
            alt="Logo de la ASADA Gamalotal"
            width={112}
            height={112}
            priority
            className="mx-auto h-24 w-24 object-contain sm:h-28 sm:w-28"
          />
          <h1 className="mt-6 text-pretty text-4xl font-bold tracking-tight text-text-primary sm:text-5xl">
            Bienvenidos a la ASADA Gamalotal
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-text-secondary">
            Comprometidos con el abastecimiento de agua potable para nuestra
            comunidad, brindando un servicio responsable, transparente y
            orientado al bienestar de todos nuestros abonados.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <a href="#nosotros" className={buttonClasses("primary", "lg")}>
              Conocer más
            </a>
            <a href="#contacto" className={buttonClasses("secondary", "lg")}>
              Contáctenos
            </a>
          </div>
        </div>

        <svg
          className="absolute bottom-0 left-0 w-full text-white"
          viewBox="0 0 1440 80"
          fill="currentColor"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path d="M0,40 C240,80 480,0 720,20 C960,40 1200,80 1440,40 L1440,80 L0,80 Z" />
        </svg>
      </section>

      {/* Quiénes somos */}
      <section id="nosotros" className="scroll-mt-24 bg-white">
        <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-20">
          <h2 className="text-2xl font-semibold tracking-tight text-text-primary sm:text-3xl">
            ¿Quiénes somos?
          </h2>
          <p className="mt-4 max-w-[65ch] text-pretty leading-relaxed text-text-secondary">
            La ASADA Gamalotal es una organización comunal dedicada a la
            administración, operación y mantenimiento del sistema de
            abastecimiento de agua potable de la comunidad. Trabajamos con
            responsabilidad para garantizar un servicio continuo, promoviendo el
            uso responsable del recurso hídrico y el bienestar de nuestros
            usuarios.
          </p>

          <div className="mt-10 grid overflow-hidden rounded-xl border border-border sm:grid-cols-2">
            <Pilar
              icon={Target}
              titulo="Misión"
              texto="Brindar un servicio de agua potable seguro, eficiente y de calidad, administrando responsablemente los recursos disponibles y promoviendo el uso sostenible del agua para beneficio de toda la comunidad."
            />
            <Pilar
              icon={Eye}
              titulo="Visión"
              texto="Ser una ASADA reconocida por su transparencia, compromiso con la comunidad y gestión eficiente del recurso hídrico, garantizando un servicio confiable para las generaciones presentes y futuras."
              className="border-t border-border sm:border-l sm:border-t-0"
            />
          </div>

          <div className="mt-10">
            <h3 className="text-lg font-semibold tracking-tight text-text-primary">
              Nuestros valores
            </h3>
            <ul className="mt-4 flex flex-wrap gap-2.5">
              {VALORES.map((valor) => (
                <li
                  key={valor}
                  className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3.5 py-1.5 text-sm font-medium text-primary-hover"
                >
                  <Check className="h-3.5 w-3.5 shrink-0" />
                  {valor}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Servicios */}
      <section id="servicios" className="scroll-mt-24 border-t border-border bg-surface">
        <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-20">
          <h2 className="text-2xl font-semibold tracking-tight text-text-primary sm:text-3xl">
            Servicios
          </h2>
          <p className="mt-4 max-w-[60ch] text-text-secondary">
            Acompañamos a la comunidad en todo lo relacionado con el suministro
            de agua potable.
          </p>

          <ul className="mt-8 grid overflow-hidden rounded-xl border border-border bg-white sm:grid-cols-2">
            {SERVICIOS.map((s, i) => {
              const Icon = s.icon;
              return (
                <li
                  key={s.nombre}
                  className={
                    "flex items-center gap-4 border-border px-5 py-5 " +
                    (i > 0 ? "border-t " : "") +
                    "sm:[&:nth-child(odd)]:border-r sm:[&:nth-child(-n+2)]:border-t-0"
                  }
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="font-medium text-text-primary">
                    {s.nombre}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* Consejos de ahorro */}
      <section id="ahorro" className="scroll-mt-24 bg-primary/5">
        <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-20">
          <div className="flex items-center gap-3">
            <Droplets className="h-7 w-7 shrink-0 text-primary" />
            <h2 className="text-2xl font-semibold tracking-tight text-text-primary sm:text-3xl">
              Consejos para el ahorro del agua
            </h2>
          </div>
          <p className="mt-4 max-w-[60ch] text-text-secondary">
            Pequeños hábitos que ayudan a cuidar el recurso hídrico de toda la
            comunidad.
          </p>

          <ul className="mt-8 grid gap-x-8 gap-y-4 sm:grid-cols-2">
            {CONSEJOS.map((consejo) => (
              <li key={consejo} className="flex items-start gap-3">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-white">
                  <Check className="h-3.5 w-3.5" />
                </span>
                <span className="text-text-primary">{consejo}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Ubicación y contacto */}
      <section id="contacto" className="scroll-mt-24 border-t border-border bg-white">
        <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-20">
          <h2 className="text-2xl font-semibold tracking-tight text-text-primary sm:text-3xl">
            Ubicación y contacto
          </h2>
          <p className="mt-4 max-w-[60ch] text-text-secondary">
            Estamos en Gamalotal Centro, frente a la plaza de fútbol. Escríbanos
            o visítenos para cualquier gestión.
          </p>

          <div className="mt-8 grid gap-8 lg:grid-cols-2">
            <dl className="space-y-5">
              <DatoContacto icon={MapPin} termino="Dirección">
                Gamalotal Centro, frente a la plaza de fútbol.
              </DatoContacto>
              <DatoContacto icon={Phone} termino="Teléfono">
                <a
                  href="tel:+50687237000"
                  className="text-primary-hover transition-colors hover:text-primary"
                >
                  8723-7000
                </a>
              </DatoContacto>
              <DatoContacto icon={UserRound} termino="Presidente">
                Walter Gerardo Quirós Rodríguez
              </DatoContacto>
              <DatoContacto icon={Clock} termino="Horario de atención">
                Lunes a viernes, 8:00 a. m. – 4:00 p. m.
              </DatoContacto>
            </dl>

            <div className="flex flex-col overflow-hidden rounded-xl border border-border shadow-sm">
              <iframe
                title="Ubicación de la ASADA Gamalotal en el mapa"
                src="https://maps.google.com/maps?q=10.0605965,-85.5061394&z=17&output=embed"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="h-72 w-full flex-1 lg:h-auto lg:min-h-80"
              />
              <a
                href="https://www.google.com/maps/search/?api=1&query=10.0605965,-85.5061394"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 border-t border-border bg-white px-4 py-3 text-sm font-medium text-primary-hover transition-colors hover:bg-surface"
              >
                <MapPin className="h-4 w-4" />
                Abrir en Google Maps
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function Pilar({
  icon: Icon,
  titulo,
  texto,
  className = "",
}: {
  icon: LucideIcon;
  titulo: string;
  texto: string;
  className?: string;
}) {
  return (
    <div className={"bg-white p-6 sm:p-8 " + className}>
      <div className="flex items-center gap-2.5">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="h-5 w-5" />
        </span>
        <h3 className="text-lg font-semibold tracking-tight text-text-primary">
          {titulo}
        </h3>
      </div>
      <p className="mt-3 leading-relaxed text-text-secondary">{texto}</p>
    </div>
  );
}

function DatoContacto({
  icon: Icon,
  termino,
  children,
}: {
  icon: LucideIcon;
  termino: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-4">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon className="h-5 w-5" />
      </span>
      <div>
        <dt className="text-sm text-text-secondary">{termino}</dt>
        <dd className="mt-0.5 font-medium text-text-primary">{children}</dd>
      </div>
    </div>
  );
}
