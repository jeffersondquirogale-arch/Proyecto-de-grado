export type Veredicto = "cumple" | "no_cumple" | "sin_evidencia" | "no_aplica";
export type Nivel = "hallazgo" | "advertencia";

export interface Regla {
  criterio: string;
  tipo:
    | "campo_requerido"
    | "condicional"
    | "cobertura"
    | "coincidencia"
    | "vigencia"
    | "coherencia_fabricante"
    | "valor_prohibido";
  nivel?: Nivel;
  mensaje: string;
  objetivo?: string;
  campo?: string;
  campo_a?: string;
  campo_b?: string;
  origen?: string;
  destino?: string;
  referencia?: string;
  periodicidad?: string;
  cuando?: string;
  entonces_requerido?: string;
  prohibido?: string[];
  minimo_filas?: number;
}

export interface Hallazgo {
  criterio: string;
  veredicto: Veredicto;
  nivel: Nivel;
  mensaje: string;
  ubicacion?: string;
  numeral?: string;
}

export interface Contexto {
  formularios: Record<string, any>;
  caso: any;
  fechaEvaluacion: Date;
}
