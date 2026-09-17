import { Regla, Hallazgo, Contexto, Nivel } from "./tipos";
import { leer, vacio } from "./rutas";
import { cumpleCondicion } from "./condicion";

type Salida = Omit<Hallazgo, "criterio" | "numeral">[];

function nivelDe(r: Regla): Nivel {
  return r.nivel ?? "hallazgo";
}

function texto(plantilla: string, datos: Record<string, any>): string {
  return plantilla.replace(/\{(\w+)\}/g, (_, clave) =>
    datos[clave] !== undefined ? String(datos[clave]) : `{${clave}}`,
  );
}

export function campoRequerido(r: Regla, ctx: Contexto): Salida {
  const salida: Salida = [];
  const objetivo = r.objetivo!;

  if (r.minimo_filas !== undefined) {
    const lista = leer(ctx.formularios, objetivo);
    const n = Array.isArray(lista) ? lista.length : 0;
    if (n < r.minimo_filas) {
      salida.push({ veredicto: "sin_evidencia", nivel: nivelDe(r), mensaje: texto(r.mensaje, {}), ubicacion: objetivo });
    }
    return salida;
  }

  const [ruta, campos] = partirObjetivo(objetivo);
  const esLista = ruta.endsWith("[]");
  const base = leer(ctx.formularios, esLista ? ruta.slice(0, -2) : ruta);
  const filas = esLista ? (Array.isArray(base) ? base : []) : [base];

  filas.forEach((fila, i) => {
    for (const campo of campos) {
      if (vacio(fila?.[campo])) {
        salida.push({
          veredicto: "no_cumple",
          nivel: nivelDe(r),
          mensaje: texto(r.mensaje, { campo, fila: etiquetaFila(fila, i) }),
          ubicacion: `${ruta}.${campo}`,
        });
      }
    }
  });

  return salida;
}

export function condicional(r: Regla, ctx: Contexto): Salida {
  const salida: Salida = [];
  const objetivo = r.objetivo!;
  const esLista = objetivo.endsWith("[]");
  const base = leer(ctx.formularios, esLista ? objetivo.slice(0, -2) : objetivo);
  const filas = esLista ? (Array.isArray(base) ? base : []) : [base];
  const requeridos = r.entonces_requerido!.split(",").map((c) => c.trim());

  filas.forEach((fila, i) => {
    if (!fila || !cumpleCondicion(r.cuando, fila)) return;
    for (const campo of requeridos) {
      if (vacio(fila[campo])) {
        salida.push({
          veredicto: "no_cumple",
          nivel: nivelDe(r),
          mensaje: texto(r.mensaje, { campo, fila: etiquetaFila(fila, i), equipo: etiquetaFila(fila, i) }),
          ubicacion: `${objetivo}.${campo}`,
        });
      }
    }
  });

  return salida;
}

export function cobertura(r: Regla, ctx: Contexto): Salida {
  const ambito = { ...ctx.formularios, caso: ctx.caso };
  const origen = normalizar(leer(ambito, r.origen!));
  const destino = normalizar(leer(ambito, r.destino!));

  return origen
    .filter((v) => !destino.includes(v))
    .map((faltante) => ({
      veredicto: "no_cumple" as const,
      nivel: nivelDe(r),
      mensaje: texto(r.mensaje, { faltante }),
      ubicacion: r.destino,
    }));
}

export function coincidencia(r: Regla, ctx: Contexto): Salida {
  const ambito = { ...ctx.formularios, caso: ctx.caso };
  if (!cumpleCondicion(r.cuando, ambito)) return [];

  const a = leer(ambito, r.campo_a!);
  const b = leer(ambito, r.campo_b!);
  if (vacio(a) || vacio(b) || a === b) return [];

  return [{
    veredicto: "no_cumple",
    nivel: nivelDe(r),
    mensaje: texto(r.mensaje, { valor_a: a, valor_b: b }),
    ubicacion: r.campo_a,
  }];
}

export function vigencia(r: Regla, ctx: Contexto): Salida {
  const ambito = { ...ctx.formularios, caso: ctx.caso };
  const contenedor = contenedorDe(ambito, r.campo!);
  if (!cumpleCondicion(r.cuando, contenedor ?? {})) return [];

  const fecha = leer(ambito, r.campo!);
  const meses = Number(leer(ambito, r.periodicidad!));
  if (vacio(fecha) || !meses) return [];

  const vence = new Date(fecha);
  vence.setMonth(vence.getMonth() + meses);
  if (vence >= ctx.fechaEvaluacion) return [];

  return [{
    veredicto: "no_cumple",
    nivel: nivelDe(r),
    mensaje: texto(r.mensaje, { valor: fecha, periodicidad: meses }),
    ubicacion: r.campo,
  }];
}

export function coherenciaFabricante(r: Regla, ctx: Contexto): Salida {
  const salida: Salida = [];
  const ruta = r.campo!.replace(/\[\]\..+$/, "[]");
  const campo = r.campo!.split(".").pop()!;
  const filas = leer(ctx.formularios, ruta.slice(0, -2)) ?? [];

  for (const fila of Array.isArray(filas) ? filas : []) {
    if (!cumpleCondicion(r.cuando, fila)) continue;

    const manual = ctx.caso?.manuales?.[fila.equipo_ref];
    const esperado = manual?.periodicidad_mantenimiento_meses;
    const declarado = fila[campo];

    if (esperado === undefined || vacio(declarado)) continue;
    if (Number(declarado) === Number(esperado)) continue;

    salida.push({
      veredicto: "no_cumple",
      nivel: nivelDe(r),
      mensaje: texto(r.mensaje, { equipo: fila.equipo_ref, valor: declarado, referencia: esperado }),
      ubicacion: r.campo,
    });
  }

  return salida;
}

export function valorProhibido(r: Regla, ctx: Contexto): Salida {
  const ruta = r.campo!.replace(/\[\]\..+$/, "");
  const campo = r.campo!.split(".").pop()!;
  const filas = leer(ctx.formularios, ruta) ?? [];

  return (Array.isArray(filas) ? filas : [])
    .filter((fila) => r.prohibido!.includes(fila?.[campo]))
    .map((fila) => ({
      veredicto: "no_cumple" as const,
      nivel: nivelDe(r),
      mensaje: texto(r.mensaje, { ...fila }),
      ubicacion: r.campo,
    }));
}

function partirObjetivo(objetivo: string): [string, string[]] {
  const i = objetivo.lastIndexOf(".");
  const ruta = objetivo.slice(0, i);
  const campos = objetivo.slice(i + 1).split(",").map((c) => c.trim());
  return [ruta, campos];
}

function etiquetaFila(fila: any, i: number): string {
  return fila?.nombre ?? fila?.equipo_ref ?? fila?.serie ?? `fila ${i + 1}`;
}

function normalizar(v: any): string[] {
  if (!v) return [];
  return (Array.isArray(v) ? v : [v]).filter(Boolean).map(String);
}

function contenedorDe(ambito: any, ruta: string): any {
  return leer(ambito, ruta.split(".").slice(0, -1).join("."));
}
