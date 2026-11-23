// Vocabulario común de la plataforma: etapas de la metodología, niveles de
// dificultad, habilidades y procedencia de los ejercicios. El esquema del
// contenido (content.config.ts) y la interfaz leen de aquí, así que para
// añadir una habilidad nueva basta con añadirla en este archivo.

/** Las seis etapas de la metodología. Todos los temas siguen este orden. */
export const STAGES = [
	{
		id: 'idea',
		titulo: 'Entiende la idea',
		corto: 'Idea',
		pregunta: '¿Qué problema resuelve?',
		descripcion: 'Una situación real o visual que necesita esta herramienta. Todavía sin notación formal.',
	},
	{
		id: 'objetos',
		titulo: 'Conoce los objetos',
		corto: 'Objetos',
		pregunta: '¿Con qué trabajamos?',
		descripcion: 'Definiciones y notación: qué representa cada símbolo y qué pasa si lo cambias.',
	},
	{
		id: 'propiedades',
		titulo: 'Comprende las propiedades',
		corto: 'Propiedades',
		pregunta: '¿De dónde sale?',
		descripcion: 'Cómo se deducen las fórmulas y los teoremas, cuándo usarlos y, sobre todo, cuándo no.',
	},
	{
		id: 'laboratorio',
		titulo: 'Laboratorio',
		corto: 'Laboratorio',
		pregunta: '¿Qué pasa si…?',
		descripcion: 'Mueve, arrastra y cambia los datos para comprobar con tus ojos lo que has deducido.',
	},
	{
		id: 'ejemplos',
		titulo: 'Ejemplos guiados',
		corto: 'Ejemplos',
		pregunta: '¿Cómo se plantea?',
		descripcion: 'Problemas típicos resueltos paso a paso, explicando el porqué de cada paso.',
	},
	{
		id: 'practica',
		titulo: 'Practica por tu cuenta',
		corto: 'Práctica',
		pregunta: '¿Sé hacerlo solo?',
		descripcion: 'Ejercicios de clase y de práctica adicional, con pistas, corrección y solución explicada.',
	},
] as const;

export type StageId = (typeof STAGES)[number]['id'];
export const STAGE_IDS = STAGES.map((s) => s.id) as [StageId, ...StageId[]];
export const LESSON_STAGE_IDS = STAGE_IDS.filter((s) => s !== 'practica') as [StageId, ...StageId[]];

export const DIFFICULTIES = {
	basico: { label: 'Básico', nivel: 1, descripcion: 'Entender el concepto y aplicar una fórmula de forma directa.' },
	intermedio: { label: 'Intermedio', nivel: 2, descripcion: 'Combinar dos ideas o elegir entre varias fórmulas.' },
	avanzado: { label: 'Avanzado', nivel: 3, descripcion: 'Problemas de varios pasos que exigen razonar el planteamiento.' },
	examen: { label: 'Tipo examen', nivel: 4, descripcion: 'Problemas completos como los de los exámenes de 1.º de Bachillerato.' },
} as const;
export type DifficultyId = keyof typeof DIFFICULTIES;
export const DIFFICULTY_IDS = Object.keys(DIFFICULTIES) as [DifficultyId, ...DifficultyId[]];

export const SKILLS = {
	conceptual: { label: 'Comprensión conceptual', corto: 'Conceptos' },
	calculo: { label: 'Cálculo y manipulación algebraica', corto: 'Cálculo' },
	geometria: { label: 'Razonamiento geométrico', corto: 'Geometría' },
	graficas: { label: 'Gráficas y circunferencia', corto: 'Gráficas' },
	metodo: { label: 'Elegir el método', corto: 'Método' },
	planteamiento: { label: 'Traducir el enunciado', corto: 'Planteamiento' },
	demostracion: { label: 'Demostrar y justificar', corto: 'Demostración' },
	multipaso: { label: 'Razonamiento en varios pasos', corto: 'Varios pasos' },
	modelizacion: { label: 'Problemas de contexto real', corto: 'Contexto real' },
} as const;
export type SkillId = keyof typeof SKILLS;
export const SKILL_IDS = Object.keys(SKILLS) as [SkillId, ...SkillId[]];

/**
 * Procedencia de los ejercicios. Los de clase llevan la etiqueta
 * «Ejercicio de clase» para que el alumno los reconozca de un vistazo.
 */
export const ORIGINS = {
	clase: { label: 'Ejercicio de clase', descripcion: 'Ejercicio trabajado en clase (de los apuntes del cuaderno).' },
	original: { label: 'Práctica adicional', descripcion: 'Ejercicio nuevo creado para esta plataforma.' },
	externo: { label: 'Fuente externa', descripcion: 'Adaptado de un recurso con licencia abierta.' },
} as const;
export type OriginId = keyof typeof ORIGINS;
export const ORIGIN_IDS = Object.keys(ORIGINS) as [OriginId, ...OriginId[]];

export const TOPIC_STATUS = {
	disponible: { label: 'Disponible' },
	proximamente: { label: 'Próximamente' },
} as const;
export type TopicStatus = keyof typeof TOPIC_STATUS;
