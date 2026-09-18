import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Simulador de cumplimiento normativo en salud",
  description:
    "Herramienta formativa para la habilitación de servicios de salud en Colombia",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>
        <header className="border-b border-[var(--color-borde)] bg-[var(--color-superficie)]">
          <div className="mx-auto flex max-w-5xl items-baseline justify-between px-6 py-4">
            <Link href="/" className="text-sm font-medium">
              Simulador de cumplimiento normativo
            </Link>
            <nav className="flex gap-6 text-sm text-[var(--color-texto-suave)]">
              <Link href="/">Módulos</Link>
              <Link href="/criterios">Criterios</Link>
              <Link href="/glosario">Glosario</Link>
            </nav>
          </div>
        </header>

        <main className="mx-auto max-w-5xl px-6 py-10">{children}</main>

        <footer className="mx-auto max-w-5xl px-6 py-10 text-xs text-[var(--color-texto-suave)]">
          Herramienta formativa. No emite conceptos oficiales de habilitación.
          Universidad ECCI · 2026
        </footer>
      </body>
    </html>
  );
}
