import Link from "next/link";
import Image from "next/image";
import { MapPin, Phone } from "lucide-react";
import { SiteHeader } from "@/components/public/site-header";

export default function PublicLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <main className="flex-1">{children}</main>

      <footer className="border-t border-border bg-surface">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:grid-cols-2 sm:px-6 lg:grid-cols-3">
          <div>
            <div className="flex items-center gap-2.5">
              <Image
                src="/logo-asada.png"
                alt="Logo de la ASADA Gamalotal"
                width={40}
                height={40}
                className="h-9 w-9 object-contain"
              />
              <span className="font-semibold tracking-tight text-text-primary">
                ASADA Gamalotal
              </span>
            </div>
            <p className="mt-3 max-w-xs text-sm text-text-secondary">
              Asociación administradora del acueducto rural de Gamalotal.
              Agua potable para la comunidad, con transparencia y compromiso.
            </p>
          </div>

          <div>
            <p className="text-sm font-semibold text-text-primary">Navegación</p>
            <ul className="mt-3 space-y-2 text-sm text-text-secondary">
              <li>
                <a href="#nosotros" className="transition-colors hover:text-text-primary">
                  Quiénes somos
                </a>
              </li>
              <li>
                <a href="#servicios" className="transition-colors hover:text-text-primary">
                  Servicios
                </a>
              </li>
              <li>
                <a href="#ahorro" className="transition-colors hover:text-text-primary">
                  Ahorro de agua
                </a>
              </li>
              <li>
                <Link href="/login" className="transition-colors hover:text-text-primary">
                  Panel administrativo
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="text-sm font-semibold text-text-primary">Contacto</p>
            <ul className="mt-3 space-y-2 text-sm text-text-secondary">
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                Gamalotal Centro, frente a la plaza de fútbol.
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0 text-primary" />
                <a href="tel:+50687237000" className="transition-colors hover:text-text-primary">
                  8723-7000
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border">
          <div className="mx-auto max-w-6xl px-4 py-5 text-xs text-text-secondary sm:px-6">
            © {new Date().getFullYear()} ASADA Gamalotal — Acueducto rural, Costa Rica.
          </div>
        </div>
      </footer>
    </div>
  );
}
