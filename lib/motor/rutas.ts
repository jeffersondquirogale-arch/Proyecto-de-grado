// Resuelve rutas tipo "hoja-de-vida.verificacion.fecha_ultima" o
// "inventario-equipos[].serie" (las de lista devuelven arreglo).

export function esRutaDeLista(ruta: string): boolean {
  return ruta.includes("[]");
}

export function leer(ctx: Record<string, any>, ruta: string): any {
  const partes = ruta.split(".");
  let actual: any = ctx;

  for (const parte of partes) {
    if (actual === undefined || actual === null) return undefined;

    if (parte.endsWith("[]")) {
      const clave = parte.slice(0, -2);
      const lista = actual[clave];
      if (!Array.isArray(lista)) return undefined;
      const resto = partes.slice(partes.indexOf(parte) + 1).join(".");
      if (!resto) return lista;
      return lista.map((item) => leer(item, resto));
    }

    actual = actual[parte];
  }

  return actual;
}

export function vacio(valor: any): boolean {
  return (
    valor === undefined ||
    valor === null ||
    (typeof valor === "string" && valor.trim() === "") ||
    (Array.isArray(valor) && valor.length === 0)
  );
}
