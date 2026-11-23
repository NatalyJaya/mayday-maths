# Plan del bloque de Trigonometría

Documento de trabajo: cómo se organiza el primer bloque disponible de Mayday Matemáticas y de dónde sale cada pieza.

## Qué se reutiliza de Mayday Física y qué cambia

| Se reutiliza tal cual | Se adapta | Es nuevo |
| --- | --- | --- |
| Astro + MDX + YAML + KaTeX al compilar, colecciones con Zod, Vitest | Etapas: `idea`, `objetos`, `propiedades`, `laboratorio`, `ejemplos`, `practica` | Respuesta `conjunto` (soluciones de una ecuación, sin orden) |
| Pistas, corrección, solución paso a paso, ejemplos guiados | Habilidades (cálculo, geometría, demostración, elegir método…) | Figuras matemáticas a escala: triángulo, geometría, circunferencia goniométrica, gráfica de funciones trigonométricas |
| Progreso en `localStorage`, modo claro/oscuro, coma decimal | Código de color: azul = coseno / cateto contiguo, naranja = seno / cateto opuesto, verde = tangente o incógnita | Simulaciones: circunferencia goniométrica, radián, triángulo arrastrable, caso ambiguo, fórmula de la suma, ecuaciones, comparador de identidades |
| Colecciones de clase, variantes, página de fuentes | Procedencia: `clase` (etiqueta **EJERCICIO DE CLASE**) y `original` (**Práctica adicional**) | Tests que comprueban que cada conjunto de soluciones cumple la ecuación y que no falta ninguna |

## Temas del bloque (los tres disponibles)

1. **Ángulos y razones trigonométricas** (`razones-trigonometricas`)
   - Idea: medir alturas y distancias inaccesibles; triángulos semejantes → la razón solo depende del ángulo.
   - Objetos: grados y radianes, ángulos de giro, seno, coseno y tangente en el triángulo rectángulo, calculadora (DEG/RAD, funciones inversas).
   - Propiedades: identidad fundamental, ángulos de 30°, 45° y 60°, complementarios, circunferencia goniométrica, signos por cuadrantes, reducción al primer cuadrante, gráficas y periodicidad.
   - Laboratorio: circunferencia goniométrica con gráficas sincronizadas, explorador de ángulos relacionados.
2. **Resolución de triángulos** (`resolucion-triangulos`)
   - Idea: triangulación; qué datos determinan un triángulo.
   - Objetos: notación A, B, C / a, b, c, ángulos de elevación y depresión, los cuatro casos.
   - Propiedades: triángulos rectángulos, doble observación, teorema del seno (con el caso ambiguo), teorema del coseno, área.
   - Laboratorio: triángulo arrastrable con los dos teoremas en vivo, caso ambiguo.
   - Ejercicio de clase: Problema 31.
3. **Identidades y ecuaciones trigonométricas** (`identidades-ecuaciones`)
   - Idea: sin(α + β) ≠ sin α + sin β; las ecuaciones trigonométricas tienen infinitas soluciones.
   - Objetos: identidad frente a ecuación, solución general y soluciones en [0°, 360°).
   - Propiedades: suma, resta, ángulo doble y ángulo mitad (con la deducción de clase), estrategias para demostrar identidades y para resolver ecuaciones.
   - Laboratorio: ecuaciones en la gráfica y en la circunferencia, comparador de identidades.
   - Ejercicios de clase: identidades 3.1 y 3.2, Serie A (8 ecuaciones), Serie B (8 ecuaciones).

## Ejercicios de clase

Proceden de `trigonometria_2_resuelto.md` (apuntes del cuaderno pasados a limpio). Se conservan los enunciados tal como se leyeron, con los avisos de lectura dudosa (⚠️). Todas las soluciones se han vuelto a comprobar (ver `tests/content.test.ts`). Los errores reales de los apuntes alimentan la sección «Errores frecuentes» de cada ejercicio.

## Práctica adicional

Ejercicios originales que no repiten los de clase, en cuatro niveles (básico, intermedio, avanzado, tipo examen) y de tipos distintos: aplicación directa, razonamiento geométrico, varios pasos, elegir el método y problemas que combinan conceptos.
