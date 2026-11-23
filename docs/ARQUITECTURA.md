# Arquitectura

Sitio estático con **Astro 7**, con la misma arquitectura que Mayday Física. No hay servidor ni base de datos: todo se genera al compilar y el navegador solo recibe HTML, CSS y un poco de JavaScript para las simulaciones y los ejercicios.

## Decisiones principales

| Decisión | Motivo |
| --- | --- |
| **Contenido en colecciones** (`src/content/`) con esquemas Zod (`src/lib/schemas.ts`) | El contenido está separado de la presentación. Un error en un ejercicio se detecta al compilar. |
| **Lecciones en MDX** y **ejercicios en YAML** | La prosa necesita libertad; los ejercicios, estructura fija. |
| **KaTeX al compilar** (remark-math + rehype-katex con `unified`) | Notación de calidad sin JavaScript en el navegador. |
| **Figuras generadas a partir de los datos** (`src/lib/figures.ts`) | Triángulos, figuras geométricas, circunferencia goniométrica y gráficas se dibujan **a escala** desde el YAML o el MDX: el dibujo no puede contradecir al enunciado. Se pintan al compilar (SVG). |
| **Simulaciones sin framework** (elementos personalizados + SVG) | Poco peso y un archivo TypeScript legible por simulación. |
| **Modelo matemático puro** (`src/lib/math/trig.ts`) | Lo comparten simulaciones, figuras y tests: razones en grados, resolución de triángulos (LLL, LAL, AAL, LLA), ecuaciones `f(n·x) = k` y búsqueda numérica de raíces. |
| **Verificación automática del contenido** (`tests/content.test.ts` + `tests/expected.ts`) | Cada respuesta numérica se recalcula con el modelo, y cada conjunto de soluciones se comprueba **completo**: se buscan numéricamente todas las raíces de la ecuación en [0°, 360°) y deben coincidir con las del YAML. |
| **Progreso solo en el navegador** (`localStorage`) | Sin cuentas ni datos personales. |

## Mapa del código

```
src/
├── content.config.ts         Colecciones: bloques, temas, lecciones, ejercicios, fuentes
├── content/                  Contenido (ver docs/CONTENIDO.md)
├── lib/
│   ├── math/trig.ts          Modelo matemático (+ tests)
│   ├── math/exact.ts         Valores exactos de los ángulos notables
│   ├── math/config.mjs       Macros KaTeX (\cx \cy \cg \un), coma decimal
│   ├── figures.ts            Figuras a escala: triángulo, geometría, circunferencia, gráfica
│   ├── schemas.ts            Esquemas del contenido
│   ├── taxonomy.ts           Etapas, niveles, habilidades, procedencias
│   ├── answers.ts            Corrección: numérica y conjuntos de soluciones (+ tests)
│   ├── angles.ts             Ángulos en grados y en radianes (π/2…)
│   └── …                     content.ts, rich-text.ts, exercise-render.ts, format.ts, progress.ts
├── sims/                     Simulaciones (TypeScript); core/: SVG y arrastre
├── scripts/exercise.ts       Pistas, corrección y solución progresiva
├── components/               layout, syllabus, lesson, exercises, sims
├── pages/                    index, fuentes, [bloque]/[tema]/…
└── styles/                   global.css (tokens), figures.css, sims.css
```

## Rutas

| Ruta | Página |
| --- | --- |
| `/` | Portada y temario |
| `/trigonometria/` | Bloque |
| `/trigonometria/<tema>/` | Portada del tema: recorrido, requisitos, mapa rápido |
| `/trigonometria/<tema>/<etapa>/` | `idea`, `objetos`, `propiedades`, `laboratorio`, `ejemplos` |
| `/trigonometria/<tema>/practica/` | Ejercicios de clase y práctica adicional, con filtros |
| `/trigonometria/<tema>/practica/<ejercicio>/` | Ejercicio |
| `/trigonometria/<tema>/colecciones/<coleccion>/` | Ejercicios de clase de una serie de los apuntes |
| `/fuentes/` | Procedencia y licencias |

Cada laboratorio lee parámetros de la URL y los ejercicios lo abren con sus datos:

- Razones: `?ang=150`
- Triángulos: `?a=7&b=5&c=8`
- Ecuaciones: `?f=sin&n=2&k=0.5`

## Diseño

- **Código de color matemático**: azul = coseno / cateto contiguo / eje X; naranja = seno / cateto opuesto / eje Y; verde agua = tangente o la incógnita; tinta = hipotenusa, radio, curva. En el laboratorio de triángulos, cada lado tiene el color de su ángulo opuesto. El violeta es solo de la interfaz.
- La etiqueta **«Ejercicio de clase»** tiene su propio color (`--badge-class`, contraste ≥ 4,5:1 en claro y oscuro).
- Las figuras geométricas usan la **misma escala en los dos ejes**.
- Se escribe `sin`, `cos` y `tan` (como la calculadora y los apuntes de clase); la lección de objetos explica que muchos libros usan `sen` y `tg`.

## Versiones a vigilar

- `katex` está fijado a la misma versión que usa `rehype-katex` (0.16.x).
- Astro 7 usa Sätteri como procesador de Markdown por defecto; aquí se usa `unified` para remark-math y rehype-katex.
