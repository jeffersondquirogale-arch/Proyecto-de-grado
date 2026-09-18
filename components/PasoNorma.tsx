"use client";

import { useEffect, useState } from "react";

interface Resalte {
  palabras: string;
  nota: string;
}

export default function PasoNorma({ paso, onListo }: any) {
  const [fase, setFase] = useState(-1);
  const resaltes: Resalte[] = paso.resaltes;

  useEffect(() => {
    if (fase >= resaltes.length - 1) onListo();
  }, [fase, resaltes.length, onListo]);

  const activos = resaltes.slice(0, fase + 1).map((r) => r.palabras);

  const pintar = (texto: string) => {
    let partes: (string | Resalte)[] = [texto];

    for (const r of resaltes) {
      if (!activos.includes(r.palabras)) continue;
      partes = partes.flatMap((p) => {
        if (typeof p !== "string") return [p];
        const i = p.indexOf(r.palabras);
        if (i === -1) return [p];
        return [p.slice(0, i), r, p.slice(i + r.palabras.length)];
      });
    }

    return partes.map((p, i) =>
      typeof p === "string" ? (
        <span key={i}>{p}</span>
      ) : (
        <mark
          key={i}
          className="rounded bg-[var(--color-acento)]/15 px-0.5 font-medium text-[var(--color-texto)] transition-colors duration-500"
        >
          {p.palabras}
        </mark>
      ),
    );
  };

  return (
    <div className="space-y-6">
      <p className="text-sm text-[var(--color-texto-suave)]">{paso.instruccion}</p>

      <blockquote className="border-l-2 border-[var(--color-acento)] py-2 pl-5 text-lg leading-relaxed">
        {pintar(paso.cita)}
      </blockquote>

      <p className="text-xs text-[var(--color-texto-suave)]">{paso.fuente}</p>

      <div className="min-h-[90px] space-y-3">
        {resaltes.slice(0, fase + 1).map((r, i) => (
          <div
            key={i}
            className="flex gap-3 rounded-lg border border-[var(--color-borde)] bg-[var(--color-superficie)] p-4"
          >
            <span className="shrink-0 font-medium text-[var(--color-acento)]">
              {r.palabras}
            </span>
            <span className="text-sm text-[var(--color-texto-suave)]">{r.nota}</span>
          </div>
        ))}
      </div>

      {fase < resaltes.length - 1 && (
        <button
          onClick={() => setFase((f) => f + 1)}
          className="rounded-lg border border-[var(--color-acento)] px-4 py-2 text-sm text-[var(--color-acento)]"
        >
          {fase === -1 ? "Empecemos a leerla" : "Siguiente palabra clave"}
        </button>
      )}
    </div>
  );
}
