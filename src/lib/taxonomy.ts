// Vocabulario común de la plataforma: etapas de la metodología, niveles de
// dificultad, habilidades y procedencia de los ejercicios. El esquema del
// contenido (content.config.ts) y la interfaz leen de aquí, así que para
// añadir una habilidad nueva basta con añadirla en este archivo.

/** Las seis etapas de la metodología. Todos los temas siguen este orden. */
export const STAGES = [
	{
		id: 'idea',
		titulo: 'Entén la idea',
		corto: 'Idea',
		pregunta: 'Quin problema resol?',
		descripcion: 'Una situació real o visual que necessita aquesta eina. Encara sense notació formal.',
	},
	{
		id: 'objetos',
		titulo: 'Coneix els objectes',
		corto: 'Objectes',
		pregunta: 'Amb què treballem?',
		descripcion: 'Definicions i notació: què representa cada símbol i què passa si el canvies.',
	},
	{
		id: 'propiedades',
		titulo: 'Comprèn les propietats',
		corto: 'Propietats',
		pregunta: 'D’on surt?',
		descripcion: 'Com es dedueixen les fórmules i els teoremes, quan fer-los servir i, sobretot, quan no.',
	},
	{
		id: 'laboratorio',
		titulo: 'Laboratori',
		corto: 'Laboratori',
		pregunta: 'Què passa si…?',
		descripcion: 'Mou, arrossega i canvia les dades per comprovar amb els teus ulls el que has deduït.',
	},
	{
		id: 'ejemplos',
		titulo: 'Exemples guiats',
		corto: 'Exemples',
		pregunta: 'Com es planteja?',
		descripcion: 'Problemes típics resolts pas a pas, explicant el perquè de cada pas.',
	},
	{
		id: 'practica',
		titulo: 'Practica pel teu compte',
		corto: 'Pràctica',
		pregunta: 'Ho sé fer sense ajuda?',
		descripcion: 'Exercicis de classe i de pràctica addicional, amb pistes, correcció i solució explicada.',
	},
] as const;

export type StageId = (typeof STAGES)[number]['id'];
export const STAGE_IDS = STAGES.map((s) => s.id) as [StageId, ...StageId[]];
export const LESSON_STAGE_IDS = STAGE_IDS.filter((s) => s !== 'practica') as [StageId, ...StageId[]];

export const DIFFICULTIES = {
	basico: { label: 'Bàsic', nivel: 1, descripcion: 'Entendre el concepte i aplicar una fórmula de manera directa.' },
	intermedio: { label: 'Intermedi', nivel: 2, descripcion: 'Combinar dues idees o triar entre diverses fórmules.' },
	avanzado: { label: 'Avançat', nivel: 3, descripcion: 'Problemes de diversos passos que exigeixen raonar el plantejament.' },
	examen: { label: 'Tipus examen', nivel: 4, descripcion: 'Problemes complets com els dels exàmens de 1r de Batxillerat.' },
} as const;
export type DifficultyId = keyof typeof DIFFICULTIES;
export const DIFFICULTY_IDS = Object.keys(DIFFICULTIES) as [DifficultyId, ...DifficultyId[]];

export const SKILLS = {
	conceptual: { label: 'Comprensió conceptual', corto: 'Conceptes' },
	calculo: { label: 'Càlcul i manipulació algebraica', corto: 'Càlcul' },
	geometria: { label: 'Raonament geomètric', corto: 'Geometria' },
	graficas: { label: 'Gràfiques i circumferència', corto: 'Gràfiques' },
	metodo: { label: 'Triar el mètode', corto: 'Mètode' },
	planteamiento: { label: 'Traduir l’enunciat', corto: 'Plantejament' },
	demostracion: { label: 'Demostrar i justificar', corto: 'Demostració' },
	multipaso: { label: 'Raonament en diversos passos', corto: 'Diversos passos' },
	modelizacion: { label: 'Problemes de context real', corto: 'Context real' },
} as const;
export type SkillId = keyof typeof SKILLS;
export const SKILL_IDS = Object.keys(SKILLS) as [SkillId, ...SkillId[]];

/**
 * Procedencia de los ejercicios. Los de clase llevan la etiqueta
 * «Ejercicio de clase» para que el alumno los reconozca de un vistazo.
 */
export const ORIGINS = {
	clase: { label: 'Exercici de classe', descripcion: 'Exercici treballat a classe (dels apunts de la llibreta).' },
	original: { label: 'Pràctica addicional', descripcion: 'Exercici nou creat per a aquesta plataforma.' },
	externo: { label: 'Font externa', descripcion: 'Adaptat d’un recurs amb llicència oberta.' },
} as const;
export type OriginId = keyof typeof ORIGINS;
export const ORIGIN_IDS = Object.keys(ORIGINS) as [OriginId, ...OriginId[]];

export const TOPIC_STATUS = {
	disponible: { label: 'Disponible' },
	proximamente: { label: 'Properament' },
} as const;
export type TopicStatus = keyof typeof TOPIC_STATUS;
