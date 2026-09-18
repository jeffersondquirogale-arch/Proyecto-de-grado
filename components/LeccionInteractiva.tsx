"use client";

import { useState } from "react";
import PasoNorma from "./PasoNorma";
import Explicacion from "./Explicacion";

type Paso = any;

export default function LeccionInteractiva({
  pasos,
  titulo,
  momentos,
  elementos,
}: {
  pasos: Paso[];
  titulo: string;
  momentos?: any[];
  elementos?: any[];
}) {
  const [explicando, setExplicando] = useState(Boolean(momentos?.length));
  const [i, setI] = useState(0);
  const [listo, setListo] = useState(false);
  const paso = pasos[i];

  const avanzar = () => {
    setListo(false);
    setI((n) => Math.min(n + 1, pasos.length - 1));
  };

  if (explicando && momentos && elementos) {
    return (
      <div className="mx-auto max-w-2xl">
        <Explicacion
          momentos={momentos}
          elementos={elementos}
          onFin={() => setExplicando(false)}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-8 flex items-center gap-3">
        <div className="h-1 flex-1 rounded-full bg-[var(--color-borde)]">
          <div
            className="h-1 rounded-full bg-[var(--color-acento)] transition-all duration-300"
            style={{ width: `${((i + 1) / pasos.length) * 100}%` }}
          />
        </div>
        <span className="text-xs text-[var(--color-texto-suave)]">
          {i + 1}/{pasos.length}
        </span>
      </div>

      <div className="min-h-[340px]">
        {paso.tipo === "idea" && <PasoIdea paso={paso} onListo={() => setListo(true)} />}
        {paso.tipo === "clasificar" && <PasoClasificar paso={paso} onListo={() => setListo(true)} />}
        {paso.tipo === "revelar" && <PasoRevelar paso={paso} onListo={() => setListo(true)} />}
        {paso.tipo === "decidir" && <PasoDecidir paso={paso} onListo={() => setListo(true)} />}
        {paso.tipo === "senalar" && <PasoSenalar paso={paso} onListo={() => setListo(true)} />}
        {paso.tipo === "señalar" && <PasoSenalar paso={paso} onListo={() => setListo(true)} />}
        {paso.tipo === "norma" && <PasoNorma paso={paso} onListo={() => setListo(true)} />}
        {paso.tipo === "cierre" && <PasoCierre paso={paso} titulo={titulo} />}
      </div>

      {i < pasos.length - 1 && (
        <button
          onClick={avanzar}
          disabled={!listo && paso.tipo !== "idea"}
          className="mt-8 rounded-lg bg-[var(--color-acento)] px-5 py-2.5 text-sm text-white transition disabled:opacity-30"
        >
          Continuar
        </button>
      )}
    </div>
  );
}

function PasoIdea({ paso, onListo }: any) {
  onListo();
  return (
    <div className="space-y-4 pt-10">
      <p className="text-2xl font-medium leading-snug">{paso.texto}</p>
      {paso.detalle && (
        <p className="text-[var(--color-texto-suave)]">{paso.detalle}</p>
      )}
    </div>
  );
}

function PasoClasificar({ paso, onListo }: any) {
  const [ubicacion, setUbicacion] = useState<Record<string, number>>({});
  const [verificado, setVerificado] = useState(false);

  const todas = paso.tarjetas.every((t: any) => ubicacion[t.id] !== undefined);
  const aciertos = paso.tarjetas.filter(
    (t: any) => ubicacion[t.id] === t.columna,
  ).length;

  const verificar = () => {
    setVerificado(true);
    onListo();
  };

  return (
    <div className="space-y-5">
      <p className="font-medium">{paso.pregunta}</p>

      <div className="space-y-2">
        {paso.tarjetas.map((t: any) => {
          const elegida = ubicacion[t.id];
          const correcto = verificado && elegida === t.columna;
          const errado = verificado && elegida !== undefined && elegida !== t.columna;

          return (
            <div
              key={t.id}
              className={`flex items-center justify-between gap-3 rounded-lg border px-4 py-3 ${
                correcto
                  ? "border-[var(--color-cumple)]"
                  : errado
                    ? "border-[var(--color-hallazgo)]"
                    : "border-[var(--color-borde)]"
              } bg-[var(--color-superficie)]`}
            >
              <span className="text-sm">{t.texto}</span>
              <div className="flex shrink-0 gap-1">
                {paso.columnas.map((c: string, ci: number) => (
                  <button
                    key={ci}
                    disabled={verificado}
                    onClick={() => setUbicacion((u) => ({ ...u, [t.id]: ci }))}
                    className={`rounded-md border px-3 py-1 text-xs transition ${
                      elegida === ci
                        ? "border-[var(--color-acento)] bg-[var(--color-acento)] text-white"
                        : "border-[var(--color-borde)] text-[var(--color-texto-suave)]"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {!verificado ? (
        <button
          onClick={verificar}
          disabled={!todas}
          className="rounded-lg border border-[var(--color-acento)] px-4 py-2 text-sm text-[var(--color-acento)] disabled:opacity-30"
        >
          Verificar
        </button>
      ) : (
        <div className="space-y-2 rounded-lg border border-[var(--color-borde)] bg-[var(--color-superficie)] p-4">
          <p className="text-sm font-medium">
            {aciertos} de {paso.tarjetas.length} correctas
          </p>
          <p className="text-sm text-[var(--color-texto-suave)]">{paso.cierre}</p>
        </div>
      )}
    </div>
  );
}

function PasoRevelar({ paso, onListo }: any) {
  const [abierto, setAbierto] = useState(false);

  return (
    <div className="space-y-5">
      <p className="font-medium">{paso.pregunta}</p>

      <blockquote className="border-l-2 border-[var(--color-acento)] py-1 pl-4 text-[var(--color-texto-suave)] italic">
        {paso.cita}
      </blockquote>
      <p className="text-xs text-[var(--color-texto-suave)]">{paso.fuente}</p>

      {!abierto ? (
        <button
          onClick={() => {
            setAbierto(true);
            onListo();
          }}
          className="rounded-lg border border-[var(--color-acento)] px-4 py-2 text-sm text-[var(--color-acento)]"
        >
          Ver respuesta
        </button>
      ) : (
        <div className="space-y-2 rounded-lg border border-[var(--color-borde)] bg-[var(--color-superficie)] p-4">
          <p className="font-medium">{paso.respuesta}</p>
          <p className="text-sm text-[var(--color-texto-suave)]">{paso.detalle}</p>
        </div>
      )}
    </div>
  );
}

function PasoDecidir({ paso, onListo }: any) {
  const [elegida, setElegida] = useState<number | null>(null);

  return (
    <div className="space-y-5">
      <div className="rounded-lg border border-[var(--color-borde)] bg-[var(--color-superficie)] p-4">
        <p className="text-sm text-[var(--color-texto-suave)]">{paso.escenario}</p>
      </div>

      <p className="font-medium">{paso.pregunta}</p>

      <div className="space-y-2">
        {paso.opciones.map((o: any, oi: number) => {
          const esta = elegida === oi;
          const mostrar = elegida !== null;

          return (
            <div key={oi}>
              <button
                disabled={mostrar}
                onClick={() => {
                  setElegida(oi);
                  onListo();
                }}
                className={`w-full rounded-lg border px-4 py-3 text-left text-sm transition ${
                  mostrar && o.correcta
                    ? "border-[var(--color-cumple)]"
                    : esta
                      ? "border-[var(--color-hallazgo)]"
                      : "border-[var(--color-borde)] hover:border-[var(--color-acento)]"
                } bg-[var(--color-superficie)]`}
              >
                {o.texto}
              </button>
              {esta && (
                <p className="mt-2 px-4 text-sm text-[var(--color-texto-suave)]">
                  {o.consecuencia}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function PasoSenalar({ paso, onListo }: any) {
  const [clic, setClic] = useState<string | null>(null);
  const elegido = paso.elementos.find((e: any) => e.id === clic);

  return (
    <div className="space-y-5">
      <p className="font-medium">{paso.instruccion}</p>

      <div className="space-y-2 rounded-lg border border-[var(--color-borde)] bg-[var(--color-superficie)] p-4">
        {paso.elementos.map((e: any) => (
          <button
            key={e.id}
            disabled={clic !== null}
            onClick={() => {
              setClic(e.id);
              onListo();
            }}
            className={`block w-full rounded-md border px-3 py-2 text-left text-sm transition ${
              clic === null
                ? "border-transparent hover:border-[var(--color-acento)]"
                : e.correcto
                  ? "border-[var(--color-cumple)]"
                  : clic === e.id
                    ? "border-[var(--color-hallazgo)]"
                    : "border-transparent opacity-50"
            }`}
          >
            {e.etiqueta}
          </button>
        ))}
      </div>

      {elegido && (
        <p className="text-sm text-[var(--color-texto-suave)]">{elegido.respuesta}</p>
      )}
    </div>
  );
}

function PasoCierre({ paso, titulo }: any) {
  return (
    <div className="space-y-5 pt-6">
      <p className="text-xs text-[var(--color-texto-suave)]">{titulo}</p>
      <h2 className="text-xl font-medium">{paso.titulo}</h2>
      <ul className="space-y-3">
        {paso.puntos.map((p: string, pi: number) => (
          <li key={pi} className="flex gap-3 text-sm">
            <span className="text-[var(--color-acento)]">—</span>
            <span>{p}</span>
          </li>
        ))}
      </ul>
      {paso.siguiente && (
        <p className="border-t border-[var(--color-borde)] pt-4 text-sm text-[var(--color-texto-suave)]">
          {paso.siguiente}
        </p>
      )}
    </div>
  );
}
