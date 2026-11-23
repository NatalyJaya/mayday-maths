// Esquemas del contenido educativo. Viven fuera de content.config.ts para
// que los tests puedan validar los archivos YAML con las mismas reglas que
// usa Astro al compilar.
import { z } from 'astro/zod';
import { DIFFICULTY_IDS, LESSON_STAGE_IDS, ORIGIN_IDS, SKILL_IDS } from './taxonomy';

// ─── Temario ──────────────────────────────────────────────────────────────

export const blockSchema = z.object({
	titulo: z.string(),
	lema: z.string(),
	descripcion: z.string(),
	/** nucleo: contenido de 1.º en el currículo vigente; ampliacion: según el centro. */
	nivel: z.enum(['nucleo', 'ampliacion']),
	orden: z.number(),
	icono: z.string(),
	curriculo: z.string(),
});

export const topicBaseSchema = z.object({
	bloque: z.string(),
	titulo: z.string(),
	sigla: z.string().optional(),
	estado: z.enum(['disponible', 'proximamente']),
	orden: z.number(),
	resumen: z.string(),
	/** La idea central del tema en una frase (portada del tema). */
	esencia: z.string().optional(),
	aprenderas: z.array(z.string()).min(1),
	requisitos: z.array(z.string()).default([]),
	/** Texto de «Antes de empezar» en la portada del tema (Markdown). */
	antes: z.string().optional(),
	/** Mapa rápido de la portada: cada pregunta típica y la herramienta que la resuelve. */
	mapa: z.array(z.object({ q: z.string(), c: z.string(), d: z.string() })).default([]),
});

// ─── Lecciones ────────────────────────────────────────────────────────────

export const lessonBaseSchema = z.object({
	tema: z.string(),
	etapa: z.enum(LESSON_STAGE_IDS),
	titulo: z.string(),
	descripcion: z.string(),
	minutos: z.number().int().positive(),
});

// ─── Fuentes ──────────────────────────────────────────────────────────────

export const sourceSchema = z.object({
	/** clase: apuntes de clase · externo: se adapta contenido · referencia: solo se consulta · curriculo: normativa */
	tipo: z.enum(['clase', 'externo', 'referencia', 'curriculo']),
	titulo: z.string(),
	autor: z.string(),
	url: z.url().optional(),
	licencia: z.string(),
	licencia_url: z.url().optional(),
	consultado: z.string().optional(),
	uso: z.string(),
});

// ─── Ejercicios ───────────────────────────────────────────────────────────

/** Paso de una resolución. En los ejemplos guiados, `piensa` se muestra antes que el desarrollo. */
const stepSchema = z.object({
	titulo: z.string(),
	piensa: z.string().optional(),
	desarrollo: z.string(),
	porque: z.string().optional(),
});

const trapSchema = z.object({
	valor: z.number(),
	tolerancia: z.number().positive().optional(),
	explicacion: z.string(),
});

const numericFieldSchema = z.object({
	/** Símbolo en LaTeX, p. ej. "t_{vuelo}". */
	simbolo: z.string(),
	etiqueta: z.string(),
	/** Unidad en texto plano, p. ej. "m/s". Vacía si es adimensional. */
	unidad: z.string(),
	valor: z.number(),
	/** Tolerancia relativa (0,02 = 2 %) para aceptar redondeos razonables. */
	tolerancia: z.number().positive().default(0.02),
	/** Tolerancia absoluta mínima: útil cuando el valor correcto es 0 o muy pequeño. */
	tolerancia_abs: z.number().positive().default(0.01),
	/** Respuestas erróneas típicas con una explicación específica. */
	trampas: z.array(trapSchema).default([]),
});

const answerSchema = z.discriminatedUnion('tipo', [
	z.object({ tipo: z.literal('numerica'), campos: z.array(numericFieldSchema).min(1) }),
	z.object({
		tipo: z.literal('opciones'),
		opciones: z
			.array(z.object({ texto: z.string(), correcta: z.boolean().default(false), explicacion: z.string() }))
			.min(2)
			.refine((ops) => ops.filter((o) => o.correcta).length === 1, 'Debe haber exactamente una opción correcta.'),
	}),
	/**
	 * Conjunto de soluciones sin orden (por ejemplo, las de una ecuación en [0°, 360°)).
	 * Detecta soluciones que faltan y soluciones que sobran.
	 */
	z.object({
		tipo: z.literal('conjunto'),
		simbolo: z.string().default('x'),
		unidad: z.string().default('°'),
		/** Texto del intervalo en LaTeX, p. ej. "[0°, 360°)". */
		intervalo: z.string().default('[0^\\circ,\\ 360^\\circ)'),
		valores: z.array(z.number()),
		/** Tolerancia absoluta para cada valor (en la unidad de la respuesta). */
		tolerancia: z.number().positive().default(0.1),
		trampas: z.array(z.object({ valores: z.array(z.number()), explicacion: z.string() })).default([]),
	}),
	/** Respuesta abierta (demostraciones, explicaciones): el alumno se autocorrige con la solución. */
	z.object({ tipo: z.literal('abierta'), criterio: z.string().optional() }),
]);

const partSchema = z.object({
	id: z.string(),
	enunciado: z.string(),
	respuesta: answerSchema,
	pistas: z.array(z.string()).default([]),
	pasos: z.array(stepSchema).min(1),
	resultado: z.string(),
});

/** Color semántico: x = coseno / cateto contiguo (azul) · y = seno / cateto opuesto (naranja) · g = tangente o incógnita (verde) · v = tinta. */
const toneSchema = z.enum(['x', 'y', 'g', 'v']);

/**
 * Triángulo dibujado A ESCALA a partir de sus tres lados (a opuesto a A, b a B, c a C).
 * Las etiquetas son texto plano; "?" marca una incógnita y "" la oculta.
 */
const triangleFigureSchema = z.object({
	tipo: z.literal('triangulo'),
	titulo: z.string().optional(),
	a: z.number().positive(),
	b: z.number().positive(),
	c: z.number().positive(),
	/** Lado que se dibuja horizontal, abajo. */
	base: z.enum(['a', 'b', 'c']).default('c'),
	/** Dibuja el triángulo reflejado (el tercer vértice al otro lado). */
	espejo: z.boolean().default(false),
	nombres: z.object({ A: z.string().default('A'), B: z.string().default('B'), C: z.string().default('C') }).default({ A: 'A', B: 'B', C: 'C' }),
	etiquetas: z
		.object({
			a: z.string().optional(),
			b: z.string().optional(),
			c: z.string().optional(),
			A: z.string().optional(),
			B: z.string().optional(),
			C: z.string().optional(),
		})
		.default({}),
	colores: z.object({ a: toneSchema.optional(), b: toneSchema.optional(), c: toneSchema.optional() }).default({}),
	/** Altura trazada desde un vértice (discontinua), con su etiqueta opcional. */
	altura: z.object({ desde: z.enum(['A', 'B', 'C']), etiqueta: z.string().default('h') }).optional(),
});

/** Figura geométrica general: puntos, segmentos y ángulos en coordenadas reales (misma escala en los dos ejes). */
const geometryFigureSchema = z.object({
	tipo: z.literal('geometria'),
	titulo: z.string().optional(),
	puntos: z
		.array(
			z.object({
				id: z.string(),
				x: z.number(),
				y: z.number(),
				/** Texto junto al punto; por defecto, su id. "" lo oculta. */
				etiqueta: z.string().optional(),
				/** Hacia dónde va la etiqueta. */
				lado: z.enum(['n', 's', 'e', 'o', 'ne', 'no', 'se', 'so']).default('n'),
				/** Dibuja un punto visible. */
				marca: z.boolean().default(true),
			}),
		)
		.min(2),
	segmentos: z
		.array(
			z.object({
				de: z.string(),
				a: z.string(),
				etiqueta: z.string().optional(),
				color: toneSchema.default('v'),
				discontinuo: z.boolean().default(false),
				/** Lado de la etiqueta respecto al segmento recorrido de «de» a «a». */
				lado: z.enum(['izquierda', 'derecha']).default('izquierda'),
			}),
		)
		.default([]),
	angulos: z
		.array(
			z.object({
				vertice: z.string(),
				desde: z.string(),
				hasta: z.string(),
				etiqueta: z.string().optional(),
				recto: z.boolean().default(false),
				color: toneSchema.default('v'),
				radio: z.number().positive().default(30),
			}),
		)
		.default([]),
	/** Suelo rayado entre dos abscisas, a la altura y. */
	suelo: z.object({ y: z.number().default(0), desde: z.number(), hasta: z.number() }).optional(),
	/** Texto suelto (por ejemplo, «río»). */
	textos: z.array(z.object({ x: z.number(), y: z.number(), texto: z.string() })).default([]),
});

/** Circunferencia goniométrica (radio 1) con uno o varios ángulos. */
const circleFigureSchema = z.object({
	tipo: z.literal('circunferencia'),
	titulo: z.string().optional(),
	angulos: z
		.array(
			z.object({
				grados: z.number(),
				etiqueta: z.string().optional(),
				/** El primero se dibuja destacado; los demás, en gris. */
				destacado: z.boolean().optional(),
			}),
		)
		.min(1),
	/** Dibuja coseno (azul) y seno (naranja) del ángulo destacado. */
	proyecciones: z.boolean().default(true),
	tangente: z.boolean().default(false),
	cuadrantes: z.boolean().default(false),
	/** Recta horizontal y = k (soluciones de sen x = k) o vertical x = k (cos x = k). */
	recta: z.object({ tipo: z.enum(['seno', 'coseno']), valor: z.number().min(-1).max(1) }).optional(),
	/** Marca el arco del ángulo destacado. */
	arco: z.boolean().default(true),
});

const curveSchema = z.object({
	/** y = a · f(b·x + c) + d, con x y c en grados. */
	f: z.enum(['sin', 'cos', 'tan']),
	a: z.number().default(1),
	b: z.number().default(1),
	c: z.number().default(0),
	d: z.number().default(0),
	etiqueta: z.string(),
	color: toneSchema.default('v'),
	discontinua: z.boolean().default(false),
});

/** Gráfica de funciones trigonométricas (x en grados). */
const functionFigureSchema = z.object({
	tipo: z.literal('funcion'),
	titulo: z.string().optional(),
	dominio: z.tuple([z.number(), z.number()]).default([0, 360]),
	rango: z.tuple([z.number(), z.number()]).default([-1.5, 1.5]),
	/** Separación de las marcas del eje X, en grados. */
	paso: z.number().positive().default(90),
	/** Etiqueta las marcas del eje X en radianes (π/2, π…). */
	radianes: z.boolean().default(false),
	curvas: z.array(curveSchema).min(1),
	niveles: z.array(z.object({ y: z.number(), etiqueta: z.string().optional() })).default([]),
	/** Puntos sobre la primera curva (o en la y indicada), p. ej. las soluciones de una ecuación. */
	puntos: z.array(z.object({ x: z.number(), y: z.number().optional(), etiqueta: z.string().optional() })).default([]),
});

/** Esquema del método: pasos encadenados. */
const flowFigureSchema = z.object({
	tipo: z.literal('flujo'),
	titulo: z.string().optional(),
	pasos: z
		.array(z.object({ color: toneSchema.default('v'), etiqueta: z.string().optional(), titulo: z.string(), texto: z.string() }))
		.min(2),
});

export const figureSchema = z.discriminatedUnion('tipo', [
	triangleFigureSchema,
	geometryFigureSchema,
	circleFigureSchema,
	functionFigureSchema,
	flowFigureSchema,
]);

export const exerciseBaseSchema = z
	.object({
		titulo: z.string(),
		tema: z.string(),
		/** ejemplo: se resuelve en la etapa «Ejemplos guiados» · practica: aparece en «Practica». */
		rol: z.enum(['ejemplo', 'practica']).default('practica'),
		orden: z.number(),
		procedencia: z.enum(ORIGIN_IDS),
		fuente: z.string().optional(),
		nota_fuente: z.string().optional(),
		/** Ejercicios de clase: cómo aparece en los apuntes (p. ej. «Serie A, apartado i)»). */
		referencia: z.string().optional(),
		/** Fuentes cuyas tipologías inspiraron un ejercicio original (sin copiar su texto). */
		inspirado_en: z.array(z.string()).default([]),
		dificultad: z.enum(DIFFICULTY_IDS),
		habilidades: z.array(z.enum(SKILL_IDS)).min(1),
		resumen: z.string(),
		enunciado: z.string(),
		figura: figureSchema.optional(),
		datos: z.array(z.object({ simbolo: z.string(), valor: z.string(), significado: z.string() })).default([]),
		incognitas: z.array(z.string()).default([]),
		interpretacion: z.string().optional(),
		conceptos: z.array(z.string()).default([]),
		apartados: z.array(partSchema).min(1),
		errores: z.array(z.object({ error: z.string(), explicacion: z.string() })).default([]),
		alternativas: z.array(z.object({ titulo: z.string(), desarrollo: z.string() })).default([]),
		/** Colección (hoja de clase, examen…) a la que pertenece, para encontrarlo fácilmente. */
		coleccion: z.string().optional(),
		/** Si es una variante de otro ejercicio: el nombre de archivo del original. */
		variante_de: z.string().optional(),
		/** Explicación visual del problema: viñetas con dibujo y texto. */
		visual: z
			.array(z.object({ titulo: z.string(), texto: z.string().optional(), figura: figureSchema.optional() }))
			.default([]),
		/** Parámetros (en la URL) para abrir el laboratorio del tema con los datos del ejercicio. */
		laboratorio: z.record(z.string(), z.union([z.number(), z.string()])).optional(),
	})
	.superRefine((ex, ctx) => {
		if (ex.procedencia !== 'original' && !ex.fuente) {
			ctx.addIssue({ code: 'custom', path: ['fuente'], message: 'Los ejercicios de clase o externos deben indicar su fuente.' });
		}
		const ids = ex.apartados.map((p) => p.id);
		if (new Set(ids).size !== ids.length) {
			ctx.addIssue({ code: 'custom', path: ['apartados'], message: 'Los identificadores de los apartados deben ser únicos.' });
		}
	});

export type Exercise = z.infer<typeof exerciseBaseSchema>;
export type ExercisePart = Exercise['apartados'][number];
export type Answer = ExercisePart['respuesta'];
export type NumericField = Extract<Answer, { tipo: 'numerica' }>['campos'][number];
export type Figure = z.infer<typeof figureSchema>;
export type TriangleFigure = Extract<Figure, { tipo: 'triangulo' }>;
export type GeometryFigure = Extract<Figure, { tipo: 'geometria' }>;
export type CircleFigure = Extract<Figure, { tipo: 'circunferencia' }>;
export type FunctionFigure = Extract<Figure, { tipo: 'funcion' }>;
export type FlowFigure = Extract<Figure, { tipo: 'flujo' }>;

export const collectionSchema = z.object({
	/** clase: hoja de clase con variantes · examen: examen de práctica (ejercicios sueltos, sin variantes). */
	tipo: z.enum(['clase', 'examen']).default('clase'),
	titulo: z.string(),
	/** Nombre corto para la etiqueta. */
	corto: z.string(),
	tema: z.string(),
	fecha: z.string().optional(),
	descripcion: z.string(),
	fuente: z.string().optional(),
	/** Ejercicios principales de la colección, en orden (nombres de archivo). Sus variantes se agrupan debajo. */
	principales: z.array(z.string()).min(1),
	/** Exámenes: duración orientativa en minutos. */
	minutos: z.number().int().positive().optional(),
	/** Exámenes: colección de la que parten (p. ej., la hoja de clase cuyos problemas amplían). */
	basada_en: z.string().optional(),
	/** Exámenes: instrucciones que se muestran antes de empezar. */
	instrucciones: z.array(z.string()).default([]),
});
