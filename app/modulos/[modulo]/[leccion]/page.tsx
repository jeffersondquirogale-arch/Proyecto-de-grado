import Link from "next/link";
import { notFound } from "next/navigation";
import { readFileSync, existsSync } from "node:fs";
import path from "node:path";
import { marked } from "marked";
import { buscarModulo, leerLeccion, leerLecciones } from "@/lib/contenido";
import Quiz from "@/components/Quiz";

function leerQuiz(leccionId: string) {
  const corto = leccionId.split("-")[0];
  const p = path.join(process.cwd(), "content/quizzes", `${corto}.json`);
  if (!existsSync(p)) return null;
  return JSON.parse(readFileSync(p, "utf-8"));
}

export default async function PaginaLeccion({
  params,
}: {
  params: Promise<{ modulo: string; leccion: string }>;
}) {
  const { modulo, leccion } = await params;
  const info = buscarModulo(modulo);
  const l = leerLeccion(modulo, leccion);
  if (!info || !l) notFound();

  const todas = leerLecciones(modulo);
  const siguiente = todas.find((x) => x.orden === l.orden + 1);
  const quiz = leerQuiz(l.id);
  const html = await marked.parse(l.contenido);

  return (
    <article className="space-y-6">
      <div className="space-y-2">
        <Link
          href={`/modulos/${modulo}`}
          className="text-sm text-[var(--color-texto-suave)] hover:underline"
        >
          ← {info.nombre}
        </Link>
        <p className="text-xs text-[var(--color-texto-suave)]">
          Lección {String(l.orden).padStart(2, "0")} · {l.tiempo_estimado} min
          {l.criterios.length > 0 ? ` · criterios ${l.criterios.join(", ")}` : ""}
        </p>
        <h1 className="text-2xl font-medium">{l.titulo}</h1>
      </div>

      <div
        className="leccion max-w-3xl"
        dangerouslySetInnerHTML={{ __html: html }}
      />

      {quiz && <Quiz preguntas={quiz.preguntas} />}

      {siguiente && (
        <div className="border-t border-[var(--color-borde)] pt-6">
          <Link
            href={`/modulos/${modulo}/${siguiente.id}`}
            className="text-sm text-[var(--color-acento)] hover:underline"
          >
            Siguiente: {siguiente.titulo} →
          </Link>
        </div>
      )}
    </article>
  );
}
