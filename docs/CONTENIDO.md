# Cómo añadir contenido

Todo el contenido educativo está en `src/content/` y no tiene código de presentación.

```
src/content/
├── temario/bloques.yaml, temas.yaml   Bloques y temas (estado, mapa rápido, figura de portada)
├── lecciones/<tema>/<etapa>.mdx       idea, objetos, propiedades, laboratorio, ejemplos
├── ejercicios/<tema>/<id>.yaml        Un archivo por ejercicio o ejemplo guiado
├── colecciones.yaml                   Series de ejercicios de clase
└── fuentes.yaml                       Procedencia y licencia de todo el material
```

Después de cualquier cambio: `npm test` y `npm run build`.

## Abrir un tema nuevo

1. En `temario/temas.yaml`: `estado: disponible`, y rellena `esencia`, `antes`, `mapa` y (opcional) `portada`.
2. Crea las cinco lecciones en `lecciones/<tema>/` (un test comprueba que estén todas).
3. Añade ejercicios en `ejercicios/<tema>/`.

## Lecciones (MDX)

- Fórmulas en LaTeX: `$…$` en línea y, para una fórmula en bloque, `$$` **en líneas separadas**.
- Coma decimal: `$0,5$` se compone bien. Coordenadas: `$(3,\ 4)$`.
- Colores: `\cx{…}` coseno/contiguo (azul), `\cy{…}` seno/opuesto (naranja), `\cg{…}` tangente o incógnita (verde).
- Dentro de las props JavaScript de un componente (`opciones={[{ texto: '…' }]}`, `figura={{ … }}`) las barras invertidas van **dobles**: `'$\\sin x$'`.

Componentes disponibles sin importar nada (`src/lib/mdx-components.ts`):

| Componente | Para qué |
| --- | --- |
| `<Callout tipo="idea \| ojo \| analogia \| porque \| repaso \| limite \| definicion \| contraejemplo \| clase">` | Recuadros didácticos. `clase` remite a los apuntes. |
| `<Predict pregunta opciones despues>` | Predice antes de mirar |
| `<VariableGrid>` + `<Variable simbolo nombre tipo unidad eje mide cambia relacion>` | Fichas de objetos matemáticos |
| `<Derivation>` + `<Paso titulo porque>` | Deducciones paso a paso |
| `<Formula titulo usala nousar>` | Fórmula clave con sus condiciones de uso |
| `<Reveal titulo>` | Contenido plegable (ampliaciones, soluciones de retos) |
| `<Figura figura={{ … }} alt pie>` | Figura a escala (mismos tipos que en los ejercicios) |
| `<GuidedExample id="tema/archivo" n={1} />` | Ejemplo guiado (el YAML debe tener `rol: ejemplo`) |
| `<UnitCircleLab lab angle tan>`, `<CircleWave fn bare>`, `<RightTriangleExplorer>`, `<RadianDemo>`, `<SymmetryExplorer rel>` | Simulaciones de razones |
| `<TriangleLab lab>`, `<AmbiguousCase>` | Simulaciones de triángulos |
| `<SumFormula>`, `<IdentityGrapher pair>`, `<EquationLab lab f n k>` | Simulaciones de identidades y ecuaciones |

## Ejercicios (YAML)

Plantillas: `razones-trigonometricas/escalera.yaml` (sencillo), `resolucion-triangulos/clase-problema-31.yaml` (completo, con viñetas) e `identidades-ecuaciones/clase-a7.yaml` (ecuación con trampas).

**Procedencia** (obligatoria):

- `clase`: ejercicio de los apuntes. Lleva `fuente`, `referencia` (cómo aparece en los apuntes, p. ej. «Serie A, apartado i)») y, si hace falta, `nota_fuente` (por ejemplo, un aviso de lectura dudosa). Se muestra con la etiqueta **«Ejercicio de clase»** y aparece en su propia sección de la práctica.
- `original`: práctica adicional creada para la plataforma. **No debe repetir** un ejercicio de clase.
- `externo`: solo con licencia que lo permita, con atribución.

**Tipos de respuesta:**

- `numerica`: campos con `valor`, `unidad` y tolerancia (2 % por defecto). `trampas`: respuestas erróneas típicas con su explicación (calculadora en radianes, intercambiar seno y coseno, olvidar la raíz…).
- `conjunto`: todas las soluciones de una ecuación, sin orden (`valores`, `intervalo`, `tolerancia` en grados). Detecta soluciones que faltan, que sobran, repetidas y la calculadora en radianes. Sus `trampas` son conjuntos completos con explicación (por ejemplo, las soluciones que salen con el error de los apuntes).
- `opciones`: test conceptual; cada opción con su `explicacion`.
- `abierta`: demostraciones; el alumno se autocorrige con la solución.

**Figuras** (`figura` y viñetas de `visual`), siempre a escala:

- `triangulo`: tres lados `a`, `b`, `c`; `base`, `etiquetas` (`?` marca la incógnita), `colores`, `altura`.
- `geometria`: `puntos` (coordenadas reales), `segmentos`, `angulos` (con `recto`), `suelo`, `textos`.
- `circunferencia`: `angulos`, `proyecciones`, `tangente`, `cuadrantes`, `recta` (`seno`/`coseno`, para ver las soluciones de `sin x = k`).
- `funcion`: `curvas` del tipo `a·f(b·x + c) + d`, `niveles` (`y = k`), `puntos`, `radianes`.
- `flujo`: el método en pasos.

**Verificación:** añade en `tests/expected.ts` los valores de cada ejercicio con respuesta numérica (calculados con `src/lib/math/trig.ts`) y la ecuación de cada respuesta `conjunto`. Si un número del YAML no coincide, o falta o sobra una solución, `npm test` falla.

Cuidado con YAML: si un texto contiene `: ` o empieza por `*`, `[`, `{` o `'`, ponlo entre comillas simples (y escribe `''` para una comilla dentro).

## Simulaciones

1. Si hace falta matemática nueva, añádela como funciones puras en `src/lib/math/` con sus tests.
2. Lógica en `src/sims/<nombre>.ts` como elemento personalizado; usa `core/svg.ts` y `core/drag.ts` (el arrastre se escucha en el `<svg>`, que no se redibuja).
3. Envoltorio en `src/components/sims/<Nombre>.astro` (controles en español, accesibles) y registro en `src/lib/mdx-components.ts`.
4. El SVG lleva las clases `sim-svg mfig` para reutilizar los estilos de las figuras.
