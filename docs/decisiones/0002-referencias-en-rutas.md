# 0002 · Resolución de referencias en rutas de reglas

Fecha: 17 de septiembre de 2026
Estado: pendiente

## Problema

La regla BP-02 necesita comparar la serie de la hoja de vida contra la del soporte de adquisición que el propio formulario declara. Eso exige resolver una ruta usando el valor de otra como clave.

El resolutor actual no lo soporta, así que la regla quedó apuntando al identificador fijo del caso 02 (`caso.soportes.FAC-4471.serie`). Funciona para validar el motor, pero no sirve en producción: cada caso tiene sus propios soportes.

## Solución propuesta

Ampliar `lib/motor/rutas.ts` con notación de referencia entre llaves:

```
caso.soportes{hoja-de-vida.adquisicion.soporte_numero}.serie
```

El contenido entre llaves se resuelve primero contra el ámbito y su resultado se usa como clave del objeto. Si la referencia queda vacía, la regla no aplica y no genera hallazgo.

## Estado

Pendiente de implementar. Mientras tanto, el caso 02 y su prueba funcionan con la ruta fija.
