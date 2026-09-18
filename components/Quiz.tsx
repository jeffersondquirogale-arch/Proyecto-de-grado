"use client";

import { useState } from "react";

interface Opcion { id: string; texto: string }
interface Pregunta {
  id: string;
  criterio?: string;
  enunciado: string;
  opciones: Opcion[];
  correcta: string;
  explicacion: string;
  fuente: string;
}

export default function Quiz({ preguntas }: { preguntas: Pregunta[] }) {
  const [respuestas, setRespuestas] = useState<Record<string, string>>({});
  const [revelado, setRevelado] = useState<Record<string, boolean>>({});

  const responder = (pid: string, oid: string) => {
    if (revelado[pid]) return;
    setRespuestas((r) => ({ ...r, [pid]: oid }));
    setRevelado((r) => ({ ...r, [pid]: true }));
  };

  const contestadas = Object.keys(revelado).length;
  const aciertos = preguntas.filter((p) => respuestas[p.id] === p.correcta).length;

  return (
    <section className="mt-12 space-y-5 border-t border-[var(--color-borde)] pt-8">
      <div className="flex items-baseline justify-between">
        <h2 className="text-lg font-medium">Quiz</h2>
        <span className="text-xs text-[var(--color-texto-suave)]">
          {contestadas > 0
            ? `${aciertos} de ${contestadas} correctas`
            : `${preguntas.length} preguntas`}
        </span>
      </div>

      {preguntas.map((p, i) => {
        const elegida = respuestas[p.id];
        const abierto = revelado[p.id];
        const acerto = elegida === p.correcta;

        return (
          <div
            key={p.id}
            className="rounded-xl border border-[var(--color-borde)] bg-[var(--color-superficie)] p-5"
          >
            <p className="text-sm font-medium">
              <span className="mr-2 text-[var(--color-texto-suave)]">{i + 1}.</span>
              {p.enunciado}
            </p>

            <ul className="mt-3 space-y-2">
              {p.opciones.map((o) => {
                const esCorrecta = o.id === p.correcta;
                const esElegida = o.id === elegida;

                let estilo = "border-[var(--color-borde)]";
                if (abierto && esCorrecta) estilo = "border-[var(--color-cumple)] bg-[var(--color-cumple)]/5";
                else if (abierto && esElegida) estilo = "border-[var(--color-hallazgo)] bg-[var(--color-hallazgo)]/5";

                return (
                  <li key={o.id}>
                    <button
                      onClick={() => responder(p.id, o.id)}
                      disabled={abierto}
                      className={`w-full rounded-lg border px-4 py-2.5 text-left text-sm transition ${estilo} ${
                        abierto ? "cursor-default" : "hover:border-[var(--color-acento)]"
                      }`}
                    >
                      <span className="mr-2 text-[var(--color-texto-suave)]">{o.id})</span>
                      {o.texto}
                    </button>
                  </li>
                );
              })}
            </ul>

            {abierto && (
              <div className="mt-4 space-y-2 border-t border-[var(--color-borde)] pt-3">
                <p className={`text-xs font-medium ${acerto ? "text-[var(--color-cumple)]" : "text-[var(--color-hallazgo)]"}`}>
                  {acerto ? "Correcto" : "Incorrecto"}
                </p>
                <p className="text-sm text-[var(--color-texto-suave)]">{p.explicacion}</p>
                <p className="text-xs text-[var(--color-texto-suave)]">
                  Fuente: {p.fuente}
                  {p.criterio ? ` · criterio ${p.criterio}` : ""}
                </p>
              </div>
            )}
          </div>
        );
      })}
    </section>
  );
}
