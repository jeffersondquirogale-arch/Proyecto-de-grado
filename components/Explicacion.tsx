"use client";

import { useState } from "react";
import Narrador from "./Narrador";
import { useNarracion } from "./useNarracion";

interface Momento {
  dice: string;
  muestra?: string[];
  destaca?: string[];
  atenua?: string[];
}

interface Elemento {
  id: string;
  texto: string;
}

export default function Explicacion({
  momentos,
  elementos,
  onFin,
}: {
  momentos: Momento[];
  elementos: Elemento[];
  onFin?: () => void;
}) {
  const [i, setI] = useState(0);
  const [voz, setVoz] = useState(true);
  const m = momentos[i];
  const { visible, terminado, saltar } = useNarracion(m.dice, voz);

  const acumulado = momentos.slice(0, i + 1);
  const mostrados = new Set(acumulado.flatMap((x) => x.muestra ?? []));
  const destacados = new Set(m.destaca ?? []);
  const atenuados = new Set(m.atenua ?? []);

  const avanzar = () => {
    if (!terminado) return saltar();
    if (i < momentos.length - 1) setI(i + 1);
    else onFin?.();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-4">
        <Narrador hablando={!terminado} />
        <div className="relative mt-4 flex-1 rounded-2xl rounded-bl-sm border border-[var(--color-borde)] bg-[var(--color-superficie)] p-5">
          <p className="min-h-[3.5rem] leading-relaxed">
            {visible}
            {!terminado && <span className="animate-pulse">▌</span>}
          </p>
        </div>
      </div>

      {mostrados.size > 0 && (
        <div className="space-y-2 pl-2">
          {elementos
            .filter((e) => mostrados.has(e.id))
            .map((e) => (
              <div
                key={e.id}
                className={`rounded-lg border px-4 py-3 text-sm transition-all duration-500 ${
                  destacados.has(e.id)
                    ? "border-[var(--color-acento)] bg-[var(--color-acento)]/5 font-medium"
                    : atenuados.has(e.id)
                      ? "border-[var(--color-borde)] opacity-30"
                      : "border-[var(--color-borde)] bg-[var(--color-superficie)]"
                }`}
              >
                {e.texto}
              </div>
            ))}
        </div>
      )}

      <div className="flex items-center gap-4">
        <button
          onClick={avanzar}
          className="rounded-lg bg-[var(--color-acento)] px-5 py-2.5 text-sm text-white"
        >
          {!terminado ? "Saltar" : i < momentos.length - 1 ? "Continuar" : "Terminar"}
        </button>
        <button
          onClick={() => setVoz((v) => !v)}
          className="text-xs text-[var(--color-texto-suave)] hover:underline"
        >
          {voz ? "Silenciar voz" : "Activar voz"}
        </button>
        <span className="ml-auto text-xs text-[var(--color-texto-suave)]">
          {i + 1}/{momentos.length}
        </span>
      </div>
    </div>
  );
}
