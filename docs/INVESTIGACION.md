# Investigación: currículo, fuentes y erratas

## Currículo

- **Real Decreto 243/2022** (Bachillerato, Matemáticas I). La trigonometría aparece en el sentido de la medida (razones trigonométricas, resolución de triángulos) y en el sentido algebraico (identidades y ecuaciones).
- En Cataluña, **Decret 171/2022**. Conviene revisar la concreción de cada centro: algunos incluyen las fórmulas de transformación de sumas en productos y otros no (en la plataforma están como ampliación plegable).

## Organización del bloque

Tres temas, en el orden habitual de los libros de 1.º:

1. **Ángulos y razones trigonométricas**: grados y radianes, razones en el triángulo rectángulo, identidad fundamental, ángulos notables, circunferencia goniométrica, signos, reducción al primer cuadrante y gráficas.
2. **Resolución de triángulos**: triángulos rectángulos, doble observación, teorema del seno (con el caso ambiguo), teorema del coseno y área.
3. **Identidades y ecuaciones trigonométricas**: suma, resta, ángulo doble y ángulo mitad; demostración de identidades; ecuaciones.

## Fuente principal: los apuntes de clase

`trigonometria_2_resuelto.md` (apuntes del cuaderno pasados a limpio). Se han incorporado:

- las deducciones de las fórmulas de la suma, la resta, el ángulo doble y el ángulo mitad (lección de propiedades del tema 3);
- **19 ejercicios de clase**: identidades 3.1 y 3.2, Serie A (8 ecuaciones), Serie B (8 ecuaciones) y el Problema 31.

Se conservan los enunciados tal como se leyeron y los avisos de lectura dudosa (A1, A4, A7 —leída como cos 2x—, A8 y el enunciado reconstruido del Problema 31). **Todas las soluciones se han recalculado** y los tests comprueban que cada conjunto de soluciones cumple la ecuación y está completo.

### Erratas de los apuntes (ya señaladas en el documento de origen y verificadas)

| Ejercicio | Error en el cuaderno | Corrección |
| --- | --- | --- |
| Serie A, 2 sin²x + 3 cos x − 3 = 0 | cos x = 1 − sin²x | Es cos²x; soluciones 0°, 60°, 300° |
| Serie A, cos 2x = 1 + 4 sin x | factor (sin x − 2) | (sin x + 2); soluciones 0°, 180° |
| Serie A, cos 2x = sin x | 2sin²x − sin x + 1 = 0 | 2sin²x + sin x − 1 = 0; 30°, 150°, 270° |
| Serie A, 6cos²(x/2) + cos x − 1 = 0 | raíz del ángulo mitad | cos²(x/2) = (1 + cos x)/2; 120°, 240° |
| Serie B, c) y e) | una sola solución | 30°, 150° y 15°, 75°, 195°, 255° |
| Serie B, g) | sin resolver cos x = 0 | 0°, 90°, 270° |
| Serie B, h) | (2sin x + 1)(2sin x − 1) | (2sin x + 1)(sin x − 1); 90°, 210°, 330° |
| Identidad «per demà» | último paso sin justificar | completado con el ángulo doble aplicado a x/2 |
| Problema 31 | PB leído como 2423,80; falta la raíz | PB = 2923,80; x ≈ 3383 m |

Cada una de estas erratas aparece en el ejercicio correspondiente como «Error frecuente» y, cuando es una respuesta concreta, como **trampa** con su explicación: si el alumno repite el error, la corrección se lo dice.

## Práctica adicional

45 ejercicios originales (15 por tema), en cuatro niveles. Ninguno repite un ejercicio de clase: tienen otros datos y, sobre todo, otras estructuras (por ejemplo, sin 2x = cos x frente a cos 2x = sin x de clase). Tipologías:

- **Aplicación directa**: conversiones, razones en un triángulo, valores exactos, ecuaciones básicas.
- **Razonamiento geométrico**: diagonales de un paralelogramo, anchura de un río, caso ambiguo con la construcción del compás.
- **Varios pasos**: doble observación, terreno de cuatro lados, ángulo mitad con el signo del cuadrante.
- **Elegir el método**: «¿por dónde empiezo?», todo a partir de sin 25°, identidad o ecuación.
- **Combinar conceptos**: noria (modelo con el seno y ecuación), identidad que después resuelve una ecuación, ángulo mitad y doble en la misma ecuación.

## Errores frecuentes programados como trampas

Calculadora en radianes · olvidar la segunda solución de una vuelta · dividir entre sin x o cos x · no comprobar tras elevar al cuadrado · ángulos múltiples (2x en dos vueltas) · repartir el seno o el coseno · intercambiar seno y coseno · Pitágoras en triángulos no rectángulos · el caso ambiguo · el signo del ángulo mitad según el cuadrante de α en lugar de α/2 · olvidar la raíz en el teorema del coseno.
