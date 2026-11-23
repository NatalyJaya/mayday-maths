// Acceso a las colecciones de contenido y rutas de la web. Las páginas no
// llaman a getCollection directamente: así, si cambia la organización del
// contenido, solo hay que tocar este archivo.
import { getCollection, getEntry, type CollectionEntry } from 'astro:content';
import { DIFFICULTIES, STAGES, type StageId } from './taxonomy';
import { withBase } from './url';

export type Block = CollectionEntry<'bloques'>;
export type Topic = CollectionEntry<'temas'>;
export type Lesson = CollectionEntry<'lecciones'>;
export type ExerciseEntry = CollectionEntry<'ejercicios'>;
export type Source = CollectionEntry<'fuentes'>;
export type ExerciseCollection = CollectionEntry<'colecciones'>;

// ─── Rutas ────────────────────────────────────────────────────────────────
export const blockUrl = (blockId: string) => withBase(`/${blockId}/`);
export const topicUrl = (t: Topic) => withBase(`/${t.data.bloque.id}/${t.id}/`);
export const stageUrl = (t: Topic, stage: StageId) => `${topicUrl(t)}${stage}/`;
export const exerciseSlug = (e: ExerciseEntry) => e.id.split('/').pop()!;
export const exerciseUrl = (t: Topic, e: ExerciseEntry) => `${stageUrl(t, 'practica')}${exerciseSlug(e)}/`;
export const collectionUrl = (t: Topic, id: string) => `${topicUrl(t)}colecciones/${id}/`;
/** Abre el laboratorio del tema con unos datos concretos (cada laboratorio lee sus parámetros de la URL). */
export const labUrl = (t: Topic, p: Record<string, string | number>) => {
	const q = new URLSearchParams(Object.entries(p).map(([k, v]) => [k, String(v)]));
	return `${stageUrl(t, 'laboratorio')}?${q}#laboratorio`;
};

// ─── Temario ──────────────────────────────────────────────────────────────
const byOrder = <T extends { data: { orden: number } }>(a: T, b: T) => a.data.orden - b.data.orden;

export async function getBlocks() {
	return (await getCollection('bloques')).sort(byOrder);
}

export async function getTopics(blockId?: string) {
	const all = await getCollection('temas');
	return all.filter((t) => !blockId || t.data.bloque.id === blockId).sort(byOrder);
}

export async function getTopic(id: string) {
	const t = await getEntry('temas', id);
	if (!t) throw new Error(`Tema desconocido: ${id}`);
	return t;
}

export const isAvailable = (t: Topic) => t.data.estado === 'disponible';

// ─── Lecciones ────────────────────────────────────────────────────────────
export async function getLessons(topicId: string) {
	const order = STAGES.map((s) => s.id as string);
	return (await getCollection('lecciones'))
		.filter((l) => l.data.tema.id === topicId)
		.sort((a, b) => order.indexOf(a.data.etapa) - order.indexOf(b.data.etapa));
}

// ─── Ejercicios ───────────────────────────────────────────────────────────
export async function getExercises(topicId: string, rol?: 'ejemplo' | 'practica') {
	return (await getCollection('ejercicios'))
		.filter((e) => e.data.tema === topicId && (!rol || e.data.rol === rol))
		.sort((a, b) => {
			// Primero los ejercicios de clase, en el orden de los apuntes; después,
			// la práctica adicional de menos a más difícil.
			const ca = a.data.procedencia === 'clase' ? 0 : 1,
				cb = b.data.procedencia === 'clase' ? 0 : 1;
			if (ca !== cb) return ca - cb;
			if (ca === 0) return a.data.orden - b.data.orden;
			return DIFFICULTIES[a.data.dificultad].nivel - DIFFICULTIES[b.data.dificultad].nivel || a.data.orden - b.data.orden;
		});
}

export async function getExercise(topicId: string, slug: string) {
	const e = await getEntry('ejercicios', `${topicId}/${slug}`);
	if (!e) throw new Error(`Ejercicio desconocido: ${topicId}/${slug}`);
	return e;
}

/** Variantes de un ejercicio (las que lo indican en «variante_de»), en orden. */
export async function getVariants(topicId: string, slug: string) {
	return (await getCollection('ejercicios'))
		.filter((e) => e.data.tema === topicId && e.data.variante_de === slug)
		.sort((a, b) => a.data.orden - b.data.orden);
}

export async function getCollections(topicId?: string) {
	return (await getCollection('colecciones')).filter((c) => !topicId || c.data.tema === topicId);
}

export async function getSources() {
	return getCollection('fuentes');
}
