# 0001 · Motor de reglas en lugar de modelos de lenguaje

Fecha: 17 de septiembre de 2026
Estado: aceptada

## Contexto

El diseño inicial contemplaba analizar los documentos cargados con un modelo de lenguaje. Se descartó esa vía.

## Decisión

La evaluación se hace con un motor de reglas determinista. El estudiante no carga archivos libres: diligencia formularios estructurados dentro de la plataforma, que son la versión digital de cada documento. El motor evalúa campo por campo contra las reglas declaradas para cada criterio.

## Razones

- **Reproducibilidad.** La misma entrada produce siempre el mismo resultado. Un modelo de lenguaje no lo garantiza, y sin eso la medición de la tesis pierde validez.
- **Explicabilidad.** Cada veredicto señala el campo evaluado, la regla aplicada y el numeral de la norma. No hay caja negra que defender en sustentación.
- **Sin alucinaciones.** El motor no puede inventar un requisito que la norma no tiene. Ese era el riesgo más grave del proyecto: reprobar a alguien por algo no exigible.
- **Costo cero y sin dependencias externas.** No hay facturación por token ni riesgo de que cambie el comportamiento del proveedor a mitad del piloto.
- **Auditable.** Las reglas viven en el repositorio, versionadas junto a los criterios.

## Consecuencias

- No se evalúa texto libre. Lo que exige juicio interpretativo lo califica el docente con rúbrica.
- La entrada es estructurada, lo que obliga a diseñar un formulario por tipo de documento. Ese formulario es, además, el contenido didáctico: enseña la anatomía del documento.
- La validación de la tesis deja de medir concordancia con una IA y pasa a medir sensibilidad y especificidad frente a errores sembrados conocidos, más la validez de contenido de las reglas según juicio de expertos.
- La sensación de adaptabilidad se logra con reglas: retroalimentación distinta según el tipo de error, rutas de refuerzo y un árbol de decisión en la visita simulada.

## Tipos de regla

| Tipo | Verifica |
|---|---|
| `campo_requerido` | El campo existe y no está vacío |
| `formato` | El valor cumple un patrón |
| `vigencia` | La fecha no está vencida a la fecha de evaluación |
| `coincidencia` | Dos documentos declaran el mismo valor |
| `cobertura` | Todo elemento de un conjunto aparece en otro |
| `coherencia_fabricante` | El valor declarado concuerda con el manual del equipo del caso |

## Alternativas descartadas

- **Modelo de lenguaje sobre PDF.** Descartada por las razones anteriores.
- **Lista de chequeo manual.** Descartada: no detecta errores cruzados entre documentos, que es lo que el simulador busca enseñar.
