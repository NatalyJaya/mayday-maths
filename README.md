# Mayday Matemáticas

Plataforma interactiva de **Matemáticas I (1.º de Bachillerato)** para entender las matemáticas, no para memorizarlas. Es hermana de [Mayday Física](https://natalyjaya.github.io/mayday-physics/) y sigue su misma metodología:

> **Primero, la intuición. Después, la formalización. Por último, los problemas.**

La web está **en catalán** (interfaz, temario, lecciones, ejercicios y simulaciones). Las rutas y los identificadores internos siguen en castellano (`razones-trigonometricas`, `practica`…) para no romper enlaces.

Cada tema tiene seis etapas: **Idea**, **Objetos**, **Propiedades**, **Laboratorio**, **Ejemplos guiados** y **Práctica**.

## Estado

- **Trigonometría** (disponible), con tres temas completos:
  - Ángulos y razones trigonométricas
  - Resolución de triángulos
  - Identidades y ecuaciones trigonométricas
- Números, Álgebra, Geometría analítica, Análisis y Estadística: en el temario, marcados como «Próximamente».

En total: 15 lecciones, 10 simulaciones, 9 ejemplos guiados, 19 **ejercicios de clase** (etiqueta «Ejercicio de clase») y 45 ejercicios de **práctica adicional** en cuatro niveles. Todas las soluciones se verifican automáticamente.

## Comandos

| Comando | Qué hace |
| --- | --- |
| `npm install` | Instala las dependencias |
| `npm run dev` | Servidor de desarrollo en `http://localhost:4321/mayday-maths/` (con agentes: `astro dev --background`) |
| `npm test` | Tests: modelo matemático, corrección de respuestas y **verificación de todo el contenido** |
| `npm run check` | Comprobación de tipos |
| `npm run build` | Compila el sitio estático en `dist/` |

Se publica en GitHub Pages con GitHub Actions (`.github/workflows/deploy.yml`) en cada `push` a `main`.

## Documentación

- [`docs/CONTENIDO.md`](docs/CONTENIDO.md): cómo añadir temas, lecciones, ejercicios y simulaciones.
- [`docs/ARQUITECTURA.md`](docs/ARQUITECTURA.md): decisiones técnicas y mapa del código.
- [`docs/INVESTIGACION.md`](docs/INVESTIGACION.md): currículo, fuentes y erratas detectadas en los apuntes de clase.
- [`docs/PLAN-TRIGONOMETRIA.md`](docs/PLAN-TRIGONOMETRIA.md): plan del bloque de trigonometría.
