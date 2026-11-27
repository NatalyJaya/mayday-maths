// Corrección de respuestas numéricas. Se ejecuta en el navegador del alumno,
// pero es una función pura (y tiene tests).
import { parseNumber } from './format';

export interface NumericSpec {
	valor: number;
	tolerancia: number;
	tolerancia_abs: number;
	trampas: { valor: number; tolerancia?: number; html: string }[];
}

export type CheckStatus = 'correct' | 'trap' | 'sign' | 'close' | 'wrong' | 'invalid' | 'empty';

export interface CheckResult {
	status: CheckStatus;
	/** HTML de la explicación (solo para las trampas). */
	html?: string;
}

const within = (x: number, target: number, rel: number, abs: number) =>
	Math.abs(x - target) <= Math.max(rel * Math.abs(target), abs);

export function checkNumeric(input: string, spec: NumericSpec): CheckResult {
	if (!input.trim()) return { status: 'empty' };
	const x = parseNumber(input);
	if (x === null) return { status: 'invalid' };
	if (within(x, spec.valor, spec.tolerancia, spec.tolerancia_abs)) return { status: 'correct' };
	for (const t of spec.trampas) {
		if (within(x, t.valor, t.tolerancia ?? spec.tolerancia, spec.tolerancia_abs)) return { status: 'trap', html: t.html };
	}
	if (spec.valor !== 0 && within(-x, spec.valor, spec.tolerancia, spec.tolerancia_abs)) return { status: 'sign' };
	if (within(x, spec.valor, spec.tolerancia * 4, spec.tolerancia_abs * 4)) return { status: 'close' };
	return { status: 'wrong' };
}

/** Mensajes genéricos (las trampas traen el suyo). */
export const MESSAGES: Record<Exclude<CheckStatus, 'trap'>, string> = {
	correct: 'Correcte!',
	sign: 'El valor absolut és correcte, però el signe no. Revisa en quin quadrant ets i quin signe hi té cada raó.',
	close: 'T’hi acostes, però no del tot. Revisa els arrodoniments: no arrodoneixis els passos intermedis a menys de tres xifres.',
	wrong: 'No és correcte. Revisa el plantejament o demana una pista.',
	invalid: 'Escriu només el nombre, sense unitats. Pots fer servir la coma decimal (per exemple, 0,866).',
	empty: 'Escriu el teu resultat abans de comprovar.',
};

// ─── Conjuntos de soluciones ──────────────────────────────────────────────

export interface SetSpec {
	valores: number[];
	tolerancia: number;
	unidad: string;
	trampas: { valores: number[]; html: string }[];
}

export type SetStatus = 'correct' | 'trap' | 'missing' | 'extra' | 'mixed' | 'radians' | 'repeated' | 'invalid' | 'empty';

export interface SetResult {
	status: SetStatus;
	/** Cuántas faltan y cuáles sobran (para el mensaje). */
	missing?: number;
	extra?: number[];
	html?: string;
}

/**
 * Lee una lista de números escrita por el alumno. Como la coma es el
 * separador decimal, las soluciones se separan con punto y coma; también se
 * acepta «coma + espacio» y los espacios. Se ignoran «°», «x =» y llaves.
 */
export function parseList(input: string): number[] | null {
	const s = input
		.replace(/[{}[\]()]/g, ' ')
		.replace(/[a-zA-Zα-ω]\s*=/g, ' ')
		.replace(/[°º]/g, ' ')
		.replace(/\b(y|i)\b/g, ';')
		.trim();
	if (!s) return [];
	const parts = (s.includes(';') ? s.split(';') : s.split(/,\s+|\s+/)).map((p) => p.trim()).filter(Boolean);
	const out: number[] = [];
	for (const p of parts) {
		const n = parseNumber(p);
		if (n === null) return null;
		out.push(n);
	}
	return out;
}

const matchSets = (given: number[], target: number[], tol: number) => {
	const used = new Set<number>();
	const extra: number[] = [];
	for (const g of given) {
		const i = target.findIndex((t, k) => !used.has(k) && Math.abs(g - t) <= tol);
		if (i >= 0) used.add(i);
		else extra.push(g);
	}
	return { missing: target.length - used.size, extra };
};

export function checkSet(input: string, spec: SetSpec): SetResult {
	if (!input.trim()) return { status: 'empty' };
	const given = parseList(input);
	if (given === null) return { status: 'invalid' };
	if (!given.length) return { status: 'empty' };
	const tol = spec.tolerancia;
	for (let i = 0; i < given.length; i++)
		for (let j = i + 1; j < given.length; j++) if (Math.abs(given[i] - given[j]) <= tol) return { status: 'repeated' };

	const { missing, extra } = matchSets(given, spec.valores, tol);
	if (missing === 0 && extra.length === 0) return { status: 'correct' };

	for (const t of spec.trampas) {
		const m = matchSets(given, t.valores, tol);
		if (m.missing === 0 && m.extra.length === 0) return { status: 'trap', html: t.html };
	}
	// ¿Calculadora en radianes? Todas las respuestas coinciden con las soluciones pasadas a radianes.
	if (spec.unidad === '°' && spec.valores.length && extra.length > 0) {
		const rad = spec.valores.map((v) => (v * Math.PI) / 180);
		const m = matchSets(given, rad, 0.01);
		if (m.extra.length === 0 && m.missing < rad.length) return { status: 'radians' };
	}
	if (missing > 0 && extra.length === 0) return { status: 'missing', missing };
	if (missing === 0) return { status: 'extra', extra };
	return { status: 'mixed', missing, extra };
}

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

/** Mensaje para un resultado de conjunto (las trampas traen el suyo). */
export function setMessage(r: SetResult, unidad = '°'): string {
	const list = (xs: number[]) => xs.map((x) => `${String(x).replace('.', ',')}${unidad}`).join('; ');
	switch (r.status) {
		case 'correct':
			return 'Correcte! Tens totes les solucions i cap de més.';
		case 'missing':
			return `El que has escrit està bé, però et ${r.missing === 1 ? 'falta' : 'falten'} ${plural(r.missing!, 'solució', 'solucions')}. Recorda que cada valor del sinus o del cosinus (excepte ±1) correspon a dos angles en una volta.`;
		case 'extra':
			return `Tens totes les solucions, però ${r.extra!.length === 1 ? 'sobra' : 'sobren'} ${list(r.extra!)}: substitueix-ho a l’equació i veuràs que no la compleix (o que anul·la un denominador).`;
		case 'mixed':
			return `Hi ha alguna cosa que no encaixa: ${r.extra!.length === 1 ? 'no és solució' : 'no són solucions'} ${list(r.extra!)} i et ${r.missing === 1 ? 'falta una solució' : `falten ${r.missing} solucions`}.`;
		case 'radians':
			return 'Sembla que la calculadora està en radiants (RAD). Posa-la en graus (DEG) i torna a calcular.';
		case 'repeated':
			return 'Has escrit la mateixa solució dues vegades. Cada solució s’escriu una sola vegada.';
		case 'invalid':
			return 'Escriu només els nombres separats per punt i coma, per exemple: 30; 150. Pots fer servir la coma decimal (63,43).';
		case 'empty':
			return 'Escriu les teves solucions abans de comprovar.';
		default:
			return '';
	}
}
