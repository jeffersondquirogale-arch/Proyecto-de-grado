# Simulador de cumplimiento normativo en salud

Plataforma web de formación que enseña a construir la documentación exigida a los prestadores de servicios de salud en Colombia, analiza con IA los documentos que carga el estudiante, genera planes de mejoramiento, permite la retroalimentación del docente y simula una visita de verificación.

Trabajo de grado · Ingeniería Biomédica · Universidad ECCI · 2026

> **Estado:** en desarrollo. Ningún resultado de esta plataforma constituye concepto oficial de habilitación, acreditación o certificación. Es una herramienta formativa.

---

## Qué hace

1. El estudiante elige la ruta y configura un prestador ficticio (tipo, servicios, complejidad).
2. Cursa módulos que le enseñan a construir cada documento, con ejemplos y errores frecuentes.
3. Construye el documento a partir de los insumos de un caso simulado y lo carga.
4. La IA lo analiza contra una base de criterios versionada y devuelve un veredicto por criterio, siempre con la evidencia citada.
5. El docente confirma o corrige ese veredicto; su palabra es la final y es la que califica.
6. Las brechas se convierten en un plan de mejoramiento con causa, acción, responsable, plazo e indicador.
7. Cierra con una visita de verificación simulada, donde un auditor pide evidencia y el estudiante debe encontrarla en un gestor documental de práctica.

## Alcance

| # | Módulo | Profundidad |
|---|---|---|
| 1 | Habilitación · Resolución 3100 de 2019 (dotación a fondo) | Profundo |
| 2 | PAMEC · auditoría para el mejoramiento de la calidad | Profundo |
| 3 | INVIMA · tecnovigilancia, farmacovigilancia y reactivovigilancia | Profundo |
| 4 | Seguridad del paciente | Referencia |
| 5 | Seguridad de la información · MSPI e historia clínica electrónica | Referencia |
| 6 | Protección de datos personales · Ley 1581 de 2012 | Referencia |
| 7 | Acreditación en salud · Manual versión 3.1 | Referencia |

**Profundo** significa con casos, carga de documentos y análisis con IA. **Referencia** significa contenido, ejercicios y evaluación, sin análisis documental.

## Stack

| Capa | Tecnología |
|---|---|
| Frontend | Next.js · TypeScript |
| Base de datos | Supabase · PostgreSQL |
| Autenticación y roles | Supabase Auth · Row Level Security |
| Archivos | Supabase Storage (buckets privados) |
| Lógica de servidor | Supabase Edge Functions |
| IA | API de Claude |
| Despliegue | Vercel |
| CI | GitHub Actions |

## Estructura del repositorio

```
.
├── app/            Rutas por rol: estudiante, docente, administrador
├── components/     Componentes de interfaz
├── lib/            Clientes, utilidades y tipos
├── criterios/      Base de criterios versionada (JSON + esquema)
├── prompts/        Prompts de la IA, versionados
├── content/
│   ├── modulos/    Lecciones en MDX
│   └── casos/      Casos ficticios y claves de respuesta
├── supabase/
│   ├── migrations/ Cambios de base de datos
│   ├── functions/  analizar-documento, evaluar-plan, calificar-visita
│   └── seed.sql    Datos de demostración
├── tests/          Pruebas unitarias y de extremo a extremo
└── docs/           Arquitectura, diccionario de datos, normograma, decisiones
```

## Instalación

Requisitos: Node.js LTS, Docker Desktop y Supabase CLI.

```bash
git clone <url-del-repositorio>
cd Proyecto-de-grado
npm install
cp .env.example .env.local   # completar las variables
supabase start
supabase db reset            # aplica migraciones y datos de demostración
npm run dev
```

## Variables de entorno

| Variable | Dónde vive | Para qué |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Cliente | URL del proyecto |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Cliente | Llave pública, limitada por RLS |
| `SUPABASE_SERVICE_ROLE_KEY` | Solo servidor | Operaciones administrativas |
| `ANTHROPIC_API_KEY` | Solo Edge Functions | Análisis de documentos |

Las dos últimas nunca se exponen al navegador ni se suben al repositorio.

## Base de criterios

Vive en `criterios/<versión>/` y es la fuente de verdad del análisis. Cada criterio declara su código, la norma de origen, la evidencia esperada, el nivel de riesgo para el paciente y los criterios con los que se cruza.

La base se versiona aparte del código: si cambia la normativa, se publica una versión nueva y los análisis anteriores conservan la versión con la que se hicieron. Sin eso, los resultados dejan de ser reproducibles.

## Convenciones

- **Ramas:** `main` estable, `develop` de integración, `feature/...` y `fix/...` por tarea.
- **Commits:** `feat:`, `fix:`, `docs:`, `test:`, `refactor:`, `chore:`.
- **Migraciones:** todo cambio de base de datos va en `supabase/migrations`, nunca a mano en producción.
- **Pull requests:** con pruebas en verde antes de fusionar.

## Datos y privacidad

- Todos los casos usan datos ficticios. Los registros sanitarios de ejemplo llevan el prefijo `DEMO`.
- Los formatos de reporte son de práctica y nunca se envían a sistemas reales del INVIMA.
- No se almacenan datos reales de pacientes ni de instituciones.
- El tratamiento de datos de estudiantes y docentes sigue la Ley 1581 de 2012, con autorización previa.

## Normativa

El normograma completo, con el estado de vigencia de cada norma y su fecha de verificación, está en `docs/normograma.md`. Se revisa mensualmente.

## Licencia

Por definir, según la política de propiedad intelectual de la Universidad ECCI para trabajos de grado.
