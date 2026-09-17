import { Regla, Hallazgo, Contexto, Veredicto } from "./tipos";
import * as v from "./verificadores";

export interface Criterio {
  codigo: string;
  leccion?: string;
  descripcion: string;
  riesgo: "bajo" | "medio" | "alto";
  fuente: { norma?: string; numeral?: string; nivel: string };
  aplica_a_servicio?: string;
}

export interface Resultado {
  criterio: string;
  veredicto: Veredicto;
  riesgo: string;
  numeral?: string;
  nivelFuente: string;
  hallazgos: Hallazgo[];
}

export interface Informe {
  fecha: string;
  versionCriterios: string;
  resultados: Resultado[];
  resumen: {
    cumple: number;
    no_cumple: number;
    sin_evidencia: number;
    no_aplica: number;
    advertencias: number;
  };
}

const despacho: Record<string, (r: Regla, c: Contexto) => any[]> = {
  campo_requerido: v.campoRequerido,
  condicional: v.condicional,
  cobertura: v.cobertura,
  coincidencia: v.coincidencia,
  vigencia: v.vigencia,
  coherencia_fabricante: v.coherenciaFabricante,
  valor_prohibido: v.valorProhibido,
};

export function evaluar(
  criterios: Criterio[],
  reglas: Regla[],
  ctx: Contexto,
  versionCriterios: string,
): Informe {
  const porCriterio = new Map<string, Hallazgo[]>();

  for (const regla of reglas) {
    const verificar = despacho[regla.tipo];
    if (!verificar) throw new Error(`Tipo de regla desconocido: ${regla.tipo}`);

    let encontrados: any[];
    try {
      encontrados = verificar(regla, ctx);
    } catch (e) {
      throw new Error(`Error en regla de ${regla.criterio} (${regla.tipo}): ${(e as Error).message}`);
    }

    const acumulado = porCriterio.get(regla.criterio) ?? [];
    for (const h of encontrados) {
      acumulado.push({ ...h, criterio: regla.criterio });
    }
    porCriterio.set(regla.criterio, acumulado);
  }

  const resultados: Resultado[] = criterios.map((c) => {
    const hallazgos = porCriterio.get(c.codigo) ?? [];

    if (!aplica(c, ctx)) {
      return base(c, "no_aplica", []);
    }

    // Un criterio sin reglas no se declara cumplido: lo evalúa el docente.
    if (!porCriterio.has(c.codigo)) {
      return base(c, "sin_evidencia", []);
    }

    const bloqueantes = hallazgos.filter((h) => h.nivel === "hallazgo");
    if (bloqueantes.length === 0) {
      return base(c, "cumple", hallazgos);
    }

    const veredicto = bloqueantes.every((h) => h.veredicto === "sin_evidencia")
      ? "sin_evidencia"
      : "no_cumple";

    return base(c, veredicto, hallazgos);
  });

  return {
    fecha: ctx.fechaEvaluacion.toISOString(),
    versionCriterios,
    resultados,
    resumen: {
      cumple: contar(resultados, "cumple"),
      no_cumple: contar(resultados, "no_cumple"),
      sin_evidencia: contar(resultados, "sin_evidencia"),
      no_aplica: contar(resultados, "no_aplica"),
      advertencias: resultados.reduce(
        (n, r) => n + r.hallazgos.filter((h) => h.nivel === "advertencia").length,
        0,
      ),
    },
  };
}

function aplica(c: Criterio, ctx: Contexto): boolean {
  if (!c.aplica_a_servicio) return true;
  const servicios: string[] = ctx.caso?.prestador?.servicios ?? [];
  return servicios.includes(c.aplica_a_servicio);
}

function base(c: Criterio, veredicto: Veredicto, hallazgos: Hallazgo[]): Resultado {
  return {
    criterio: c.codigo,
    veredicto,
    riesgo: c.riesgo,
    numeral: c.fuente?.numeral,
    nivelFuente: c.fuente?.nivel,
    hallazgos: hallazgos.map((h) => ({ ...h, numeral: c.fuente?.numeral })),
  };
}

function contar(rs: Resultado[], veredicto: Veredicto): number {
  return rs.filter((r) => r.veredicto === veredicto).length;
}
