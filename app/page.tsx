import Link from "next/link";

const modulos = [
  {
    slug: "gestion-documental",
    nombre: "Gestión documental",
    descripcion:
      "Qué exige la norma en materia documental, tipos de documento, codificación, encabezado, glosario, redacción, control de cambios y listado maestro.",
    lecciones: 8,
  },
  {
    slug: "dotacion",
    nombre: "Dotación",
    descripcion:
      "Registro de equipos biomédicos, registro sanitario, hoja de vida, programa de mantenimiento y calibración.",
    lecciones: 7,
  },
];

export default function Inicio() {
  return (
    <div className="space-y-10">
      <section className="space-y-3">
        <h1 className="text-2xl font-medium">Módulos de aprendizaje</h1>
        <p className="max-w-2xl text-[var(--color-texto-suave)]">
          Cada lección se apoya en el texto oficial de la norma y señala qué es
          exigible y qué es buena práctica.
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        {modulos.map((m) => (
          <Link
            key={m.slug}
            href={`/modulos/${m.slug}`}
            className="rounded-xl border border-[var(--color-borde)] bg-[var(--color-superficie)] p-5 transition hover:border-[var(--color-acento)]"
          >
            <p className="text-xs text-[var(--color-texto-suave)]">
              {m.lecciones} lecciones
            </p>
            <h2 className="mt-1 font-medium">{m.nombre}</h2>
            <p className="mt-2 text-sm text-[var(--color-texto-suave)]">
              {m.descripcion}
            </p>
          </Link>
        ))}
      </section>
    </div>
  );
}
