// Huella de los esquemas (la actualiza src/integrations/content-schema-guard.mjs): c0dc5665637cdc77
// Colecciones de contenido. El contenido educativo (temario, lecciones,
// ejercicios y fuentes) vive en src/content/ y está separado de la
// presentación (src/components/). Ver docs/CONTENIDO.md.
import { defineCollection, reference } from 'astro:content';
import { file, glob } from 'astro/loaders';
import { z } from 'astro/zod';
import {
	blockSchema,
	collectionSchema,
	exerciseBaseSchema,
	figureSchema,
	lessonBaseSchema,
	sourceSchema,
	topicBaseSchema,
} from './lib/schemas';

/** Bloques del temario (Números, Álgebra, Trigonometría…). */
const bloques = defineCollection({
	loader: file('src/content/temario/bloques.yaml'),
	schema: blockSchema,
});

/** Temas dentro de cada bloque (Razones trigonométricas, Resolución de triángulos…). */
const temas = defineCollection({
	loader: file('src/content/temario/temas.yaml'),
	schema: topicBaseSchema.extend({
		bloque: reference('bloques'),
		requisitos: z.array(reference('temas')).default([]),
		/** Figura de la portada del tema. */
		portada: figureSchema.optional(),
	}),
});

/** Una lección por etapa de la metodología: src/content/lecciones/<tema>/<etapa>.mdx */
const lecciones = defineCollection({
	loader: glob({ pattern: '**/*.mdx', base: './src/content/lecciones' }),
	schema: lessonBaseSchema.extend({ tema: reference('temas') }),
});

/** Un archivo YAML por ejercicio: src/content/ejercicios/<tema>/<id>.yaml */
const ejercicios = defineCollection({
	loader: glob({ pattern: '**/*.yaml', base: './src/content/ejercicios' }),
	schema: exerciseBaseSchema,
});

/** Procedencia de todo el material: apuntes de clase, recursos externos y normativa. */
const fuentes = defineCollection({
	loader: file('src/content/fuentes.yaml'),
	schema: sourceSchema,
});

/** Colecciones de ejercicios (hojas de clase, repasos de examen…). */
const colecciones = defineCollection({
	loader: file('src/content/colecciones.yaml'),
	schema: collectionSchema,
});

export const collections = { bloques, temas, lecciones, ejercicios, fuentes, colecciones };
