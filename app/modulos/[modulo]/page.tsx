import Link from "next/link";
import { notFound } from "next/navigation";
import { existsSync } from "node:fs";
import path from "node:path";
import { buscarModulo, leerLecciones, MODULOS } from "@/lib/contenido";

function tieneInteractiva(id: string) {
  const corto = id.split("-")[0];
  return existsSync(path.join(process.cwd(), "content/interactivo", `${corto}.json`));
}

export function generateStaticParams() {
  return MODULOS.map((m) => ({ modulo: m.slug }));
}

export default async function PaginaModulo({
  params,
}: {
  params: Promise<{ modulo: string }>;
}) {
  const { modulo } = await params;
  const info = buscarModulo(modulo);
  if (!info) notFound();

  const lecciones = leerLecciones(modulo);

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <Link href="/" className="text-sm text-[var(--color-texto-suave)] hover:underline">
          ← Módulos
        </Link>
        <h1 className="text-2xl font-medium">{info.nombre}</h1>
        <p className="max-w-2xl text-[var(--color-texto-suave)]">{info.descripcion}</p>
      </div>

      <ol className="divide-y divide-[var(--color-borde)] overflow-hidden rounded-xl border border-[var(--color-borde)] bg-[var(--color-superficie)]">
        {lecciones.map((l) => (
          <li key={l.id}>
            <Link
              href={tieneInteractiva(l.id) ? `/interactivo/${l.id.split("-")[0]}` : `/modulos/${modulo}/${l.id}`}
              className="flex items-baseline justify-between gap-4 px-5 py-4 transition hover:bg-[var(--color-fondo)]"
            >
              <span className="flex items-baseline gap-3">
                <span className="text-xs text-[var(--color-texto-suave)]">
                  {String(l.orden).padStart(2, "0")}
                </span>
                <span className="text-sm">{l.titulo}</span>
              </span>
              <span className="shrink-0 text-xs text-[var(--color-texto-suave)]">
                {l.tiempo_estimado} min
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
}
