import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Inventario — ASADA Gamalotal",
  description:
    "Sistema de inventario de la ASADA Gamalotal, acueducto rural de Costa Rica.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className={`${inter.variable} antialiased`}>
      <body className="min-h-screen bg-surface text-text-primary font-sans">
        {children}
      </body>
    </html>
  );
}
