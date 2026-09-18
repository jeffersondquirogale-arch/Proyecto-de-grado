import { readFileSync, readdirSync, existsSync } from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const RAIZ = process.cwd();

export interface Leccion {
  id: string;
  modulo: string;
  orden: number;
  titulo: string;
  criterios: string[];
  glosario: string[];
  requiere: string[];
  formulario: string | null;
  tiempo_estimado: number;
  contenido: string;
}

export interface Modulo {
  slug: string;
  nombre: string;
  descripcion: string;
}

export const MODULOS: Modulo[] = [
  {
    slug: "gestion-documental",
    nombre: "Gestión documental",
    descripcion:
      "Qué exige la norma en materia documental, tipos de documento, codificación, encabezado, glosario, redacción, control de cambios y listado maestro.",
  },
  {
    slug: "dotacion",
    nombre: "Dotación",
    descripcion:
      "Registro de equipos biomédicos, registro sanitario, hoja de vida, programa de mantenimiento y calibración.",
  },
];

export function leerLecciones(modulo: string): Leccion[] {
  const dir = path.join(RAIZ, "content/modulos", modulo);
  if (!existsSync(dir)) return [];

  return readdirSync(dir)
    .filter((f) => f.endsWith(".mdx"))
    .map((archivo) => {
      const { data, content } = matter(
        readFileSync(path.join(dir, archivo), "utf-8"),
      );
      return {
        id: data.id,
        modulo: data.modulo,
        orden: data.orden,
        titulo: data.titulo,
        criterios: data.criterios ?? [],
        glosario: data.glosario ?? [],
        requiere: data.requiere ?? [],
        formulario: data.formulario ?? null,
        tiempo_estimado: data.tiempo_estimado ?? 0,
        contenido: content,
      };
    })
    .sort((a, b) => a.orden - b.orden);
}

export function leerLeccion(modulo: string, id: string): Leccion | null {
  return leerLecciones(modulo).find((l) => l.id === id) ?? null;
}

export function buscarModulo(slug: string): Modulo | null {
  return MODULOS.find((m) => m.slug === slug) ?? null;
}
