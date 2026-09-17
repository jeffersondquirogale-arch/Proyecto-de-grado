import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { evaluar } from "../../lib/motor";

const leerJson = (p: string) => JSON.parse(readFileSync(p, "utf-8"));

const { criterios } = leerJson("criterios/2026.09/dotacion.json");
const { reglas } = leerJson("criterios/2026.09/reglas-dotacion.json");
const caso = leerJson("content/casos/caso-02-consultorio.json");

const formularios = {
  "inventario-equipos": [
    { id: "EQ-001", nombre: "Monitor de signos vitales", marca: "Acme", modelo: "M100", serie: "SN-44127",
      requiere_registro: true, registro_sanitario: "DEMO-2019DM-0012345", clase_riesgo: "IIa",
      servicio: "consulta externa medicina general", codigo_interno: "MON-01", ubicacion: "Consultorio 1" },
    { id: "EQ-002", nombre: "Tensiómetro digital", marca: "Acme", modelo: "T20", serie: "SN-90210",
      requiere_registro: true, registro_sanitario: "DEMO-2020DM-0067890", clase_riesgo: "IIa",
      servicio: "enfermería", codigo_interno: "TEN-01", ubicacion: "Consultorio 2" },
    { id: "EQ-003", nombre: "Centrífuga de laboratorio", marca: "Beta", modelo: "C5", serie: "SN-77001",
      requiere_registro: true, registro_sanitario: "DEMO-2021DM-0011223", clase_riesgo: "I",
      servicio: "toma de muestras de laboratorio clínico", codigo_interno: "CEN-01", ubicacion: "Área de muestras" }
  ],
  "programa-mantenimiento": {
    generalidades: { vigencia: "2026", responsable: "Ingeniería biomédica", ejecucion: "propia" },
    cronograma: [
      { equipo_ref: "EQ-001", periodicidad_meses: 12, fuente_periodicidad: "recomendación del fabricante" },
      { equipo_ref: "EQ-002", periodicidad_meses: 12, fuente_periodicidad: "recomendación del fabricante" }
    ]
  },
  "hoja-de-vida": {
    identificacion: { equipo_ref: "EQ-001", serie: "SN-44127" },
    adquisicion: { forma_adquisicion: "compra", soporte_numero: "FAC-4471", fecha_adquisicion: "2024-03-10" },
    mantenimiento: [
      { fecha: "2026-03-10", tipo: "preventivo", descripcion: "Rutina semestral", ejecutor_nombre: "J. Pérez", ejecutor_formacion: "tecnólogo" },
      { fecha: "2026-07-02", tipo: "correctivo", descripcion: "Cambio de cable", ejecutor_nombre: "L. Gómez", ejecutor_formacion: "sin formación en áreas relacionadas" }
    ],
    verificacion: { fabricante_exige: false }
  }
};

const ctx = { formularios, caso, fechaEvaluacion: new Date("2026-09-17") };
const informe = evaluar(criterios, reglas, ctx, "2026.09");

const criteriosConHallazgo = new Set(
  informe.resultados
    .filter((r) => r.hallazgos.some((h) => h.nivel === "hallazgo"))
    .map((r) => r.criterio),
);

describe("motor de reglas sobre el caso 02", () => {
  it("encuentra todos los hallazgos de la clave de respuestas", () => {
    for (const esperado of caso.clave_respuestas.hallazgos_esperados) {
      expect(criteriosConHallazgo, esperado.motivo).toContain(esperado.criterio);
    }
  });

  it("no reporta lo que no debe", () => {
    for (const falso of caso.clave_respuestas.no_debe_reportar) {
      expect(criteriosConHallazgo, falso.motivo).not.toContain(falso.criterio);
    }
  });

  it("registra la discrepancia de serie como advertencia, no como hallazgo", () => {
    const bp02 = informe.resultados.find((r) => r.criterio === "BP-02")!;
    expect(bp02.hallazgos.length).toBeGreaterThan(0);
    expect(bp02.hallazgos.every((h) => h.nivel === "advertencia")).toBe(true);
    expect(bp02.veredicto).toBe("cumple");
  });

  it("marca como sin_evidencia los criterios que no tienen reglas", () => {
    const dot11 = informe.resultados.find((r) => r.criterio === "DOT-11")!;
    expect(dot11.veredicto).toBe("sin_evidencia");
  });

  it("cita el numeral de la norma en cada resultado", () => {
    const dot06 = informe.resultados.find((r) => r.criterio === "DOT-06")!;
    expect(dot06.numeral).toBe("11.1.3 - 2.1");
  });
});
