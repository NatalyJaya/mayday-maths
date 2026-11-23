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
	correct: '¡Correcto!',
	sign: 'El valor absoluto es correcto, pero el signo no. Revisa en qué cuadrante estás y qué signo tiene allí cada razón.',
	close: 'Te acercas, pero no del todo. Revisa los redondeos: no redondees los pasos intermedios a menos de tres cifras.',
	wrong: 'No es correcto. Revisa el planteamiento o pide una pista.',
	invalid: 'Escribe solo el número, sin unidades. Puedes usar coma decimal (por ejemplo, 0,866).',
	empty: 'Escribe tu resultado antes de comprobar.',
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
		.replace(/\by\b/g, ';')
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
			return '¡Correcto! Tienes todas las soluciones y ninguna de más.';
		case 'missing':
			return `Lo que has escrito está bien, pero te ${r.missing === 1 ? 'falta' : 'faltan'} ${plural(r.missing!, 'solución', 'soluciones')}. Recuerda que cada valor del seno o del coseno (salvo ±1) corresponde a dos ángulos en una vuelta.`;
		case 'extra':
			return `Tienes todas las soluciones, pero ${r.extra!.length === 1 ? 'sobra' : 'sobran'} ${list(r.extra!)}: sustitúyelo en la ecuación y verás que no la cumple (o que anula un denominador).`;
		case 'mixed':
			return `Hay algo que no encaja: ${r.extra!.length === 1 ? 'no es solución' : 'no son soluciones'} ${list(r.extra!)} y te ${r.missing === 1 ? 'falta una solución' : `faltan ${r.missing} soluciones`}.`;
		case 'radians':
			return 'Parece que tu calculadora está en radianes (RAD). Ponla en grados (DEG) y vuelve a calcular.';
		case 'repeated':
			return 'Has escrito la misma solución dos veces. Cada solución se escribe una sola vez.';
		case 'invalid':
			return 'Escribe solo los números separados por punto y coma, por ejemplo: 30; 150. Puedes usar coma decimal (63,43).';
		case 'empty':
			return 'Escribe tus soluciones antes de comprobar.';
		default:
			return '';
	}
}
