# Arquitectura

Documento técnico de referencia. Explica cómo está construido el simulador y por qué se tomaron las decisiones principales.

Versión 0.1 · septiembre de 2026

---

## 1. Idea central

Todo el sistema gira alrededor de una idea: **la norma no se programa, se declara**.

Los requisitos de habilitación no viven en el código sino en una base de criterios versionada, en archivos JSON. El software lee esa base para saber qué exigir, qué evaluar y qué desbloquear. Cuando la normativa cambia, se publica una versión nueva de criterios y el software sigue igual.

Esa decisión no es estética. Durante el desarrollo de esta tesis, el Ministerio expidió un manual nuevo de habilitación y lo revocó un mes después. Un sistema con la norma incrustada en el código habría tenido que rehacerse dos veces.

## 2. Roles

| Rol | Alcance |
|---|---|
| Estudiante | Sus propias simulaciones, entregas y resultados |
| Docente | Los estudiantes de sus grupos; corrige veredictos y califica |
| Administrador | Criterios, contenido, casos y usuarios |

El docente tiene siempre la última palabra sobre un veredicto. La IA prioriza, explica y agiliza, pero no califica.

## 3. Recorrido del usuario

```
Introducción → Elegir ruta → Configurar prestador → Módulos guía
     → Cargar documento → Análisis IA (preliminar)
     → Revisión docente (final) → Plan de mejoramiento
     → Corregir y recargar ↺ → Visita simulada → Informe
```

El ciclo de corrección es el que produce aprendizaje: cada reintento genera una entrega nueva, no reemplaza la anterior, y la comparación entre versiones es evidencia directa del efecto formativo.

## 4. Capas

| Capa | Responsabilidad | Prohibido |
|---|---|---|
| Navegador | Interfaz, estado local, subida directa a Storage | Llamar a la IA, manejar llaves |
| Servidor del front | Renderizado, sesión, lectura con la llave pública | Guardar secretos en el bundle |
| Edge Functions | Análisis, evaluación de planes, calificación | Confiar en datos del cliente sin validar |
| Base de datos | Verdad única, políticas RLS, migraciones | Lógica de negocio compleja en triggers |

**Regla que ordena todo:** el cliente solo lee y escribe lo suyo; todo lo que decide una calificación pasa por una Edge Function. Si el análisis pudiera invocarse desde el navegador, un estudiante podría fabricar su propio resultado.

## 5. Motor de análisis

### 5.1 Entrada

El documento se sube directo a Storage desde el navegador con una URL firmada. La Edge Function recibe el identificador, no el archivo, y lo lee del bucket privado.

Antes de analizar se guarda la huella (hash) del archivo. Eso permite detectar recargas idénticas y reproducir cualquier análisis pasado.

### 5.2 Las cuatro capas de evaluación

| Capa | Qué revisa |
|---|---|
| Forma | Control documental: código, versión, fecha, elaboró, revisó, aprobó |
| Contenido | Si tiene lo que el criterio exige |
| Coherencia | Si concuerda con el prestador configurado y con los demás documentos del caso |
| Vigencia | Fechas, certificados, mantenimientos y calibraciones al día |

La capa de coherencia es la que aprovecha el campo `cruza_con` de los criterios. Cuando se evalúa la hoja de vida, el motor sabe que debe compararla contra la factura del mismo caso.

### 5.3 Salida

Por cada criterio, un objeto estructurado:

```json
{
  "criterio": "DOT-HV-05",
  "veredicto": "no_cumple",
  "evidencia": "Hoja de vida pág. 1: Serie SN-44127",
  "brecha": "La serie no coincide con la de la factura (SN-44172).",
  "confianza": "alta",
  "recomendacion": "Verificar cuál es la serie real del equipo y corregir el documento."
}
```

### 5.4 Reglas anti-error

- Sin evidencia citada del documento, no se puede emitir `cumple`.
- Si no encuentra algo, responde `sin_evidencia`. Nunca lo supone.
- Solo evalúa criterios que están en la base. No inventa requisitos.
- Lo que un documento no puede demostrar (infraestructura física, por ejemplo) se marca para la visita simulada.
- Confianza baja o riesgo alto se envían con prioridad al docente.

### 5.5 Trazabilidad

Cada análisis guarda modelo, versión del prompt, versión de la base de criterios, fecha, hash del documento y el resultado completo. Es lo que permite reproducir resultados y medir la concordancia entre la IA y los expertos.

## 6. Modelo de datos

El eje central es una cadena:

```
simulaciones → entregas → documentos → analisis_ia → hallazgos → acciones_plan
```

Con tres entradas laterales: `casos` alimenta la simulación, `criterios` alimenta el análisis, y el docente alimenta el hallazgo.

### Tres decisiones a no negociar

**El hallazgo guarda dos veredictos.** `veredicto_ia` y `veredicto_docente` en columnas separadas. Si la corrección sobrescribe el original, se pierde el dato con el que se calcula la concordancia.

**Las entregas se versionan.** Corregir y recargar crea `version = 2`, no reemplaza la anterior.

**El análisis guarda su versión de criterios.** Si sale una norma nueva a mitad del piloto, los resultados anteriores siguen siendo interpretables.

### Campo `origen_revision`

Distingue si el docente revisó por prioridad, por muestreo aleatorio o por confirmación en bloque. Permite calcular la concordancia general y la de los casos difíciles por separado, sin sesgo.

## 7. Seguridad

| Tabla | Estudiante | Docente | Administrador |
|---|---|---|---|
| `simulaciones` | Solo las suyas | Las de sus grupos | Todas |
| `documentos` | Solo los suyos | Los de sus grupos | Todas |
| `hallazgos` | Lectura de los suyos | Lectura y escritura del veredicto docente | Todas |
| `criterios` | Lectura de la versión activa | Lectura | Escritura |
| `errores_sembrados` | Sin acceso | Lectura | Escritura |

La última fila es crítica: si un estudiante puede leer la clave de respuestas del caso, el ejercicio pierde sentido y la evaluación deja de ser válida.

Otras medidas:

- Buckets privados; los archivos se sirven con URLs firmadas de corta duración.
- La llave de servicio y la de la IA solo viven en Edge Functions.
- Límites de uso de la IA por usuario y por día.
- Registro de auditoría de acciones sensibles.

## 8. Contenido

Las lecciones no se programan. Se escriben en MDX con una cabecera que las conecta con los criterios:

```yaml
---
id: dot-d4-hoja-de-vida
modulo: dotacion
orden: 4
criterios: [DOT-HV-01, DOT-HV-02, DOT-HV-03, DOT-HV-04, DOT-HV-05, DOT-HV-06]
caso: caso-02-monitor
requiere: [dot-d2-registro-sanitario]
tiempo_estimado: 45
---
```

Eso da tres cosas: se escribe contenido sin tocar código, el sistema sabe solo qué criterios evaluar al cargar el documento, y el campo `requiere` arma el desbloqueo sin programarlo lección por lección.

## 9. Casos y errores sembrados

Cada caso es un paquete de documentos ficticios con una clave de respuestas. Los errores se siembran en tres planos:

| Plano | Ejemplo |
|---|---|
| Contenido | Hoja de vida sin periodicidad de mantenimiento |
| Cruzado | La serie de la hoja de vida no coincide con la de la factura |
| Estructural | Documento sin control documental, o archivado en la carpeta equivocada |

Como la clave se conoce de antemano, el mismo caso sirve para enseñar, para calificar al estudiante y para medir la sensibilidad y especificidad de la IA.

## 10. Costos

El análisis se factura por token, así que el diseño incluye tres controles: se analiza solo al entregar (no en borrador), la base de criterios se envía cacheada para no pagarla completa en cada llamada, y las tareas simples (identificar el tipo de documento) usan un modelo más económico que el análisis a fondo.

## 11. Límites conocidos

- Un documento no puede demostrar condiciones físicas de infraestructura.
- La IA puede fallar; por eso el docente corrige y por eso se mide la concordancia.
- El sistema no emite conceptos oficiales ni sustituye la verificación de la Secretaría de Salud.
- El alcance profundo se limita al estándar de dotación; los demás módulos son de referencia.
