// Modelo matemático de la trigonometría: funciones puras que comparten las
// simulaciones, las figuras de los ejercicios y los tests. Todos los ángulos
// van en GRADOS salvo que el nombre diga lo contrario.

export const DEG = Math.PI / 180;

export const toRad = (deg: number) => deg * DEG;
export const toDeg = (rad: number) => rad / DEG;

/** Seno, coseno y tangente de un ángulo en grados, sin «ruido» numérico (sin 180° = 0 exacto). */
const clean = (v: number) => (Math.abs(v) < 1e-12 ? 0 : Math.abs(v - Math.round(v)) < 1e-12 ? Math.round(v) : v);
export const sinD = (deg: number) => clean(Math.sin(toRad(deg)));
export const cosD = (deg: number) => clean(Math.cos(toRad(deg)));
export const tanD = (deg: number) => {
	const c = cosD(deg);
	return c === 0 ? NaN : clean(Math.tan(toRad(deg)));
};
export const asinD = (v: number) => toDeg(Math.asin(v));
export const acosD = (v: number) => toDeg(Math.acos(v));
export const atanD = (v: number) => toDeg(Math.atan(v));

export type TrigFn = 'sin' | 'cos' | 'tan';
export const trig: Record<TrigFn, (deg: number) => number> = { sin: sinD, cos: cosD, tan: tanD };

/** Lleva un ángulo a [0°, 360°). */
export function normalize(deg: number) {
	const r = ((deg % 360) + 360) % 360;
	return Math.abs(r - 360) < 1e-9 ? 0 : r;
}

/** Cuadrante (1–4) de un ángulo; 0 si está sobre un eje. */
export function quadrant(deg: number) {
	const a = normalize(deg);
	if (a % 90 === 0) return 0;
	return Math.floor(a / 90) + 1;
}

/** Ángulo de referencia: el ángulo agudo que forma el lado terminal con el eje X. */
export function referenceAngle(deg: number) {
	const a = normalize(deg);
	if (a <= 90) return a;
	if (a <= 180) return 180 - a;
	if (a <= 270) return a - 180;
	return 360 - a;
}

/** Ángulos relacionados con α (los que tienen las mismas razones salvo el signo). */
export function relatedAngles(deg: number) {
	return {
		suplementario: normalize(180 - deg),
		masPi: normalize(180 + deg),
		opuesto: normalize(-deg),
		complementario: 90 - deg,
	};
}

const uniqSorted = (xs: number[], eps = 1e-7) => {
	const out: number[] = [];
	for (const x of [...xs].sort((a, b) => a - b)) if (!out.length || Math.abs(x - out[out.length - 1]) > eps) out.push(x);
	return out;
};

/** Soluciones en [0°, 360°) de f(x) = k, con f = sin, cos o tan. */
export function solveBasic(f: TrigFn, k: number): number[] {
	if (f !== 'tan' && Math.abs(k) > 1 + 1e-12) return [];
	const kk = Math.max(-1, Math.min(1, k));
	if (f === 'sin') {
		const t = asinD(kk);
		return uniqSorted([normalize(t), normalize(180 - t)]);
	}
	if (f === 'cos') {
		const t = acosD(kk);
		return uniqSorted([normalize(t), normalize(360 - t)]);
	}
	const t = atanD(k);
	return uniqSorted([normalize(t), normalize(t + 180)]);
}

/**
 * Soluciones de f(b·x + c) = k con x en [desde, hasta). Primero se resuelve
 * para el ángulo u = b·x + c (que recorre un intervalo b veces mayor) y luego
 * se despeja x.
 */
export function solveCompound(f: TrigFn, k: number, b = 1, c = 0, desde = 0, hasta = 360): number[] {
	const base = solveBasic(f, k);
	const uMin = Math.min(b * desde + c, b * hasta + c);
	const uMax = Math.max(b * desde + c, b * hasta + c);
	const out: number[] = [];
	for (const u0 of base) {
		const start = Math.ceil((uMin - u0) / 360 - 1e-9);
		for (let n = start; u0 + 360 * n <= uMax + 1e-9; n++) {
			const x = (u0 + 360 * n - c) / b;
			if (x >= desde - 1e-9 && x < hasta - 1e-9) out.push(Math.abs(x) < 1e-9 ? 0 : x);
		}
	}
	return uniqSorted(out);
}

/**
 * Raíces de una función en [desde, hasta), buscadas numéricamente. Sirve en
 * los tests para comprobar que un conjunto de soluciones está COMPLETO.
 * Detecta cambios de signo y raíces dobles (tangentes al eje) y descarta las
 * asíntotas (donde la función cambia de signo pero no se anula).
 */
export function findRoots(fn: (x: number) => number, desde = 0, hasta = 360, paso = 0.01, eps = 1e-6): number[] {
	const n = Math.round((hasta - desde) / paso);
	const xs = Array.from({ length: n + 1 }, (_, i) => desde + i * paso);
	const ys = xs.map((x) => fn(x));
	const roots: number[] = [];
	const refine = (a: number, b: number) => {
		// sección áurea sobre |f|
		const g = (Math.sqrt(5) - 1) / 2;
		let lo = a,
			hi = b;
		for (let i = 0; i < 80; i++) {
			const m1 = hi - g * (hi - lo),
				m2 = lo + g * (hi - lo);
			if (Math.abs(fn(m1)) < Math.abs(fn(m2))) hi = m2;
			else lo = m1;
		}
		return (lo + hi) / 2;
	};
	const bisect = (a: number, b: number) => {
		let fa = fn(a);
		for (let i = 0; i < 100; i++) {
			const m = (a + b) / 2;
			const fm = fn(m);
			if (Math.sign(fm) === Math.sign(fa)) {
				a = m;
				fa = fm;
			} else b = m;
		}
		return (a + b) / 2;
	};
	for (let i = 0; i <= n; i++) {
		const y = ys[i];
		if (!Number.isFinite(y)) continue;
		if (Math.abs(y) < eps) roots.push(xs[i]);
		if (i < n && Number.isFinite(ys[i + 1]) && Math.sign(y) !== Math.sign(ys[i + 1])) {
			const r = bisect(xs[i], xs[i + 1]);
			if (Math.abs(fn(r)) < 1e-6) roots.push(r);
		}
		// mínimo local de |f| cerca de cero sin cambio de signo (raíz doble)
		if (i > 0 && i < n) {
			const a = Math.abs(ys[i - 1]),
				b = Math.abs(y),
				c = Math.abs(ys[i + 1]);
			if (b <= a && b <= c && b < 1e-2 && Math.sign(ys[i - 1]) === Math.sign(ys[i + 1])) {
				const r = refine(xs[i - 1], xs[i + 1]);
				if (Math.abs(fn(r)) < 1e-8) roots.push(r);
			}
		}
	}
	// Agrupa los candidatos muy próximos (una raíz doble deja muchos) y se queda con el mejor.
	const sorted = roots.filter((r) => r >= desde - 1e-9 && r < hasta - 1e-6).sort((a, b) => a - b);
	const clusters: number[][] = [];
	for (const r of sorted) {
		const last = clusters[clusters.length - 1];
		if (last && r - last[last.length - 1] < 0.2) last.push(r);
		else clusters.push([r]);
	}
	// Una raíz pegada al final del intervalo es la misma que la del principio (periodo de 360°).
	const wraps = Math.abs(fn(desde)) < eps;
	return clusters
		.map((cl) => cl.reduce((best, r) => (Math.abs(fn(r)) < Math.abs(fn(best)) ? r : best)))
		.filter((r) => !(wraps && hasta - r < 0.2))
		.map((r) => (Math.abs(r - Math.round(r)) < 1e-4 ? Math.round(r) : r));
}

// ─── Triángulos ───────────────────────────────────────────────────────────
// Notación: lados a, b, c opuestos a los ángulos A, B, C (en grados).

export interface Triangle {
	a: number;
	b: number;
	c: number;
	A: number;
	B: number;
	C: number;
}

const isTriangle = (t: Triangle) =>
	[t.a, t.b, t.c, t.A, t.B, t.C].every((v) => Number.isFinite(v) && v > 0) && Math.abs(t.A + t.B + t.C - 180) < 1e-6;

/** Tres lados (LLL): teorema del coseno para dos ángulos. */
export function solveSSS(a: number, b: number, c: number): Triangle | null {
	if (a + b <= c || a + c <= b || b + c <= a) return null;
	const A = acosD((b * b + c * c - a * a) / (2 * b * c));
	const B = acosD((a * a + c * c - b * b) / (2 * a * c));
	return { a, b, c, A, B, C: 180 - A - B };
}

/** Dos lados y el ángulo comprendido (LAL): b, c y A. */
export function solveSAS(b: number, c: number, A: number): Triangle {
	const a = Math.sqrt(b * b + c * c - 2 * b * c * cosD(A));
	return solveSSS(a, b, c)!;
}

/** Un lado y los dos ángulos (ALA o AAL): el lado a y los ángulos A y B. */
export function solveAAS(a: number, A: number, B: number): Triangle | null {
	const C = 180 - A - B;
	if (C <= 0) return null;
	const k = a / sinD(A);
	return { a, b: k * sinD(B), c: k * sinD(C), A, B, C };
}

/**
 * Dos lados y un ángulo NO comprendido (LLA): a, b y A. Es el caso ambiguo:
 * puede haber 0, 1 o 2 triángulos.
 */
export function solveSSA(a: number, b: number, A: number): Triangle[] {
	let s = (b * sinD(A)) / a;
	if (Math.abs(s - 1) < 1e-10) s = 1;
	if (s > 1) return [];
	const B1 = asinD(Math.min(1, s));
	const out: Triangle[] = [];
	for (const B of uniqSorted([B1, 180 - B1], 1e-6)) {
		const C = 180 - A - B;
		if (C <= 1e-9) continue;
		const t = { a, b, c: (a * sinD(C)) / sinD(A), A, B, C };
		if (isTriangle(t)) out.push(t);
	}
	return out;
}

/** Área con dos lados y el ángulo que forman. */
export const areaSAS = (b: number, c: number, A: number) => 0.5 * b * c * sinD(A);

/** Fórmula de Herón. */
export function heron(a: number, b: number, c: number) {
	const p = (a + b + c) / 2;
	return Math.sqrt(p * (p - a) * (p - b) * (p - c));
}

/** Coordenadas de un triángulo a escala: A = (0, 0), B = (c, 0), C arriba. */
export function triangleCoords(a: number, b: number, c: number) {
	const A = acosD((b * b + c * c - a * a) / (2 * b * c));
	return { A: [0, 0] as [number, number], B: [c, 0] as [number, number], C: [b * cosD(A), b * sinD(A)] as [number, number] };
}

/** Doble observación: altura h de un objeto visto con ángulos α (lejos) y β (cerca) separados una distancia d. */
export function doubleObservation(alpha: number, beta: number, d: number) {
	// h = x·tan β = (x + d)·tan α  →  x = d·tan α / (tan β − tan α)
	const ta = tanD(alpha),
		tb = tanD(beta);
	const x = (d * ta) / (tb - ta);
	return { x, h: x * tb };
}
