import { leer } from "./rutas";

// Evalúa condiciones simples: "campo == valor", "campo != null", "campo == true".
// Deliberadamente limitado: nada de eval ni expresiones arbitrarias.

export function cumpleCondicion(
  condicion: string | undefined,
  ambito: Record<string, any>,
): boolean {
  if (!condicion) return true;

  const m = condicion.match(/^\s*([\w.\[\]-]+)\s*(==|!=)\s*(.+?)\s*$/);
  if (!m) throw new Error(`Condición no reconocida: ${condicion}`);

  const [, ruta, operador, crudo] = m;
  const valor = leer(ambito, ruta);
  const esperado = interpretar(crudo);

  const iguales =
    esperado === null ? valor === null || valor === undefined : valor === esperado;

  return operador === "==" ? iguales : !iguales;
}

function interpretar(crudo: string): any {
  const limpio = crudo.trim();
  if (limpio === "true") return true;
  if (limpio === "false") return false;
  if (limpio === "null") return null;
  if (/^-?\d+(\.\d+)?$/.test(limpio)) return Number(limpio);
  return limpio.replace(/^['"]|['"]$/g, "");
}
