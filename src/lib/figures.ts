// Figuras matemáticas generadas A ESCALA a partir de los datos (nunca
// imágenes sueltas): así el dibujo no puede contradecir al enunciado.
// Devuelven el SVG como texto; se pintan al compilar (sin JavaScript en el
// navegador). Los estilos están en src/styles/figures.css.
import type { CircleFigure, FunctionFigure, GeometryFigure, TriangleFigure } from './schemas';
import { cosD, sinD, tanD, trig } from './math/trig';
import { fmtTrim } from './format';

type P = [number, number];

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const n = (v: number) => (Math.round(v * 10) / 10).toString();
const pt = ([x, y]: P) => `${n(x)} ${n(y)}`;
const tone = (t?: string) => `t-${t ?? 'v'}`;

/** Etiqueta de texto; «?» se pinta como incógnita. */
function label(x: number, y: number, text: string | undefined, cls = '', anchor = 'middle') {
	if (!text) return '';
	const unk = text.includes('?') ? ' unk' : '';
	return `<text x="${n(x)}" y="${n(y)}" text-anchor="${anchor}" dominant-baseline="middle" class="lbl ${cls}${unk}">${esc(text)}</text>`;
}

/** Alineación del texto según hacia dónde se separa del segmento (así no lo pisa). */
const anchorFor = (n: P) => (n[0] > 0.45 ? 'start' : n[0] < -0.45 ? 'end' : 'middle');

const sub = (a: P, b: P): P => [a[0] - b[0], a[1] - b[1]];
const add = (a: P, b: P): P => [a[0] + b[0], a[1] + b[1]];
const mul = (a: P, k: number): P => [a[0] * k, a[1] * k];
const len = (a: P) => Math.hypot(a[0], a[1]);
const unit = (a: P): P => {
	const L = len(a) || 1;
	return [a[0] / L, a[1] / L];
};

/** Arco de ángulo en el vértice V entre las direcciones hacia P y hacia Q (el menor). */
function angleArc(V: P, Pp: P, Q: P, r: number, cls: string) {
	const u = unit(sub(Pp, V)),
		w = unit(sub(Q, V));
	const a1 = Math.atan2(u[1], u[0]),
		a2 = Math.atan2(w[1], w[0]);
	let d = a2 - a1;
	while (d <= -Math.PI) d += 2 * Math.PI;
	while (d > Math.PI) d -= 2 * Math.PI;
	const s = add(V, mul(u, r)),
		e = add(V, mul(w, r));
	return `<path d="M${pt(s)} A${n(r)} ${n(r)} 0 0 ${d > 0 ? 1 : 0} ${pt(e)}" class="arc ${cls}"/>`;
}

/** Marca de ángulo recto en V entre las direcciones hacia P y Q. */
function rightMark(V: P, Pp: P, Q: P, s = 11) {
	const u = mul(unit(sub(Pp, V)), s),
		w = mul(unit(sub(Q, V)), s);
	return `<path d="M${pt(add(V, u))} L${pt(add(add(V, u), w))} L${pt(add(V, w))}" class="right"/>`;
}

/** Punto donde va la etiqueta de un ángulo (sobre la bisectriz). */
function bisector(V: P, Pp: P, Q: P, r: number): P {
	const b = unit(add(unit(sub(Pp, V)), unit(sub(Q, V))));
	return add(V, mul(b, r));
}

/** Encaja puntos (coordenadas reales, y hacia arriba) en un lienzo con la MISMA escala en los dos ejes. */
function fit(points: P[], W: number, maxH: number, pad: number) {
	const xs = points.map((p) => p[0]),
		ys = points.map((p) => p[1]);
	const x0 = Math.min(...xs),
		x1 = Math.max(...xs),
		y0 = Math.min(...ys),
		y1 = Math.max(...ys);
	const s = Math.min((W - 2 * pad) / (x1 - x0 || 1), (maxH - 2 * pad) / (y1 - y0 || 1));
	const H = Math.round((y1 - y0) * s + 2 * pad);
	const ox = (W - (x1 - x0) * s) / 2;
	const map = ([x, y]: P): P => [ox + (x - x0) * s, H - pad - (y - y0) * s];
	return { s, H, map };
}

// ─── Triángulo ────────────────────────────────────────────────────────────

export function triangleSvg(f: TriangleFigure) {
	const side = { a: f.a, b: f.b, c: f.c } as const;
	// vértices en el orden (P, Q, R): PQ es la base
	const order = { c: ['A', 'B', 'C'], a: ['B', 'C', 'A'], b: ['C', 'A', 'B'] }[f.base] as ('A' | 'B' | 'C')[];
	const [Pn, Qn, Rn] = order;
	const lo = (v: string) => side[v.toLowerCase() as 'a' | 'b' | 'c'];
	const pq = lo(Rn),
		pr = lo(Qn),
		qr = lo(Pn);
	const cosP = (pq * pq + pr * pr - qr * qr) / (2 * pq * pr);
	if (!(Math.abs(cosP) < 1)) throw new Error(`Triángulo imposible: ${f.a}, ${f.b}, ${f.c}`);
	const sinP = Math.sqrt(1 - cosP * cosP);
	const real: Record<string, P> = { [Pn]: [0, 0], [Qn]: [pq, 0], [Rn]: [pr * cosP, pr * sinP] };
	if (f.espejo) for (const k of Object.keys(real)) real[k] = [-real[k][0], real[k][1]];
	const W = 520;
	const { map, H } = fit(Object.values(real), W, 300, 46);
	const V = { A: map(real.A), B: map(real.B), C: map(real.C) };
	const G = mul(add(add(V.A, V.B), V.C), 1 / 3);
	const ang = {
		A: (Math.acos((f.b ** 2 + f.c ** 2 - f.a ** 2) / (2 * f.b * f.c)) * 180) / Math.PI,
		B: (Math.acos((f.a ** 2 + f.c ** 2 - f.b ** 2) / (2 * f.a * f.c)) * 180) / Math.PI,
	};
	const angles = { ...ang, C: 180 - ang.A - ang.B };
	const out: string[] = [];
	const opp = { a: ['B', 'C'], b: ['A', 'C'], c: ['A', 'B'] } as const;

	// altura
	if (f.altura) {
		const from = V[f.altura.desde];
		const [p1, p2] = { A: [V.B, V.C], B: [V.A, V.C], C: [V.A, V.B] }[f.altura.desde];
		const d = unit(sub(p2, p1));
		const t = (from[0] - p1[0]) * d[0] + (from[1] - p1[1]) * d[1];
		const foot = add(p1, mul(d, t));
		const L = len(sub(p2, p1));
		if (t < 0) out.push(`<line x1="${n(p1[0])}" y1="${n(p1[1])}" x2="${n(foot[0])}" y2="${n(foot[1])}" class="seg dash"/>`);
		if (t > L) out.push(`<line x1="${n(p2[0])}" y1="${n(p2[1])}" x2="${n(foot[0])}" y2="${n(foot[1])}" class="seg dash"/>`);
		out.push(`<line x1="${n(from[0])}" y1="${n(from[1])}" x2="${n(foot[0])}" y2="${n(foot[1])}" class="seg dash t-g"/>`);
		out.push(rightMark(foot, from, t > L / 2 ? p1 : p2, 9));
		const mid = mul(add(from, foot), 0.5);
		out.push(label(mid[0] + 12, mid[1], f.altura.etiqueta, 'l-g', 'start'));
	}

	// lados
	for (const s of ['a', 'b', 'c'] as const) {
		const [u, v] = opp[s];
		const p = V[u],
			q = V[v];
		out.push(`<line x1="${n(p[0])}" y1="${n(p[1])}" x2="${n(q[0])}" y2="${n(q[1])}" class="seg side ${tone(f.colores[s])}"/>`);
		const mid = mul(add(p, q), 0.5);
		// hacia fuera del triángulo, perpendicular al lado
		const d = unit(sub(q, p));
		let nrm: P = [d[1], -d[0]];
		if ((mid[0] - G[0]) * nrm[0] + (mid[1] - G[1]) * nrm[1] < 0) nrm = [-nrm[0], -nrm[1]];
		const lp = add(mid, mul(nrm, Math.abs(nrm[0]) > 0.45 ? 8 : 14));
		const text = f.etiquetas[s];
		out.push(label(lp[0], lp[1], text, `l-${f.colores[s] ?? 'v'}`, anchorFor(nrm)));
	}
	// ángulos
	for (const k of ['A', 'B', 'C'] as const) {
		const others = (['A', 'B', 'C'] as const).filter((x) => x !== k);
		const p = V[k];
		const q1 = V[others[0]],
			q2 = V[others[1]];
		const minSide = Math.min(len(sub(q1, p)), len(sub(q2, p)));
		const r = Math.min(26, minSide * 0.3);
		const text = f.etiquetas[k];
		if (Math.abs(angles[k] - 90) < 0.05) out.push(rightMark(p, q1, q2));
		else if (text) out.push(angleArc(p, q1, q2, r, ''));
		if (text) {
			const lp = bisector(p, q1, q2, r + (angles[k] < 35 ? 22 : 15));
			out.push(label(lp[0], lp[1], text, 'l-ang'));
		}
		const np = add(p, mul(unit(sub(p, G)), 15));
		out.push(label(np[0], np[1], f.nombres[k], 'vname'));
	}
	return { W, H, body: out.join('') };
}

// ─── Geometría general ────────────────────────────────────────────────────

const SIDE: Record<string, P> = { n: [0, -1], s: [0, 1], e: [1, 0], o: [-1, 0], ne: [0.75, -0.75], no: [-0.75, -0.75], se: [0.75, 0.75], so: [-0.75, 0.75] };

export function geometrySvg(f: GeometryFigure) {
	const real: P[] = f.puntos.map((p) => [p.x, p.y]);
	if (f.suelo) real.push([f.suelo.desde, f.suelo.y], [f.suelo.hasta, f.suelo.y]);
	const W = 560;
	const { map, H } = fit(real, W, 320, 40);
	const P: Record<string, P> = Object.fromEntries(f.puntos.map((p) => [p.id, map([p.x, p.y])]));
	const get = (id: string) => {
		const v = P[id];
		if (!v) throw new Error(`Figura geométrica: no existe el punto «${id}»`);
		return v;
	};
	const out: string[] = [];
	if (f.suelo) {
		const a = map([f.suelo.desde, f.suelo.y]),
			b = map([f.suelo.hasta, f.suelo.y]);
		out.push(`<line x1="${n(a[0])}" y1="${n(a[1])}" x2="${n(b[0])}" y2="${n(b[1])}" class="ground"/>`);
		for (let x = a[0] + 6; x < b[0]; x += 12) out.push(`<line x1="${n(x)}" y1="${n(a[1])}" x2="${n(x - 7)}" y2="${n(a[1] + 8)}" class="hatch"/>`);
	}
	for (const s of f.segmentos) {
		const p = get(s.de),
			q = get(s.a);
		out.push(`<line x1="${n(p[0])}" y1="${n(p[1])}" x2="${n(q[0])}" y2="${n(q[1])}" class="seg ${tone(s.color)}${s.discontinuo ? ' dash' : ''}"/>`);
		if (s.etiqueta) {
			const d = unit(sub(q, p));
			// normal a la izquierda del recorrido (en pantalla, con y hacia abajo)
			const nrm: P = s.lado === 'izquierda' ? [d[1], -d[0]] : [-d[1], d[0]];
			const mid = mul(add(p, q), 0.5);
			const lp = add(mid, mul(nrm, Math.abs(nrm[0]) > 0.45 ? 8 : 13));
			out.push(label(lp[0], lp[1], s.etiqueta, `l-${s.color}`, anchorFor(nrm)));
		}
	}
	for (const a of f.angulos) {
		const v = get(a.vertice),
			p = get(a.desde),
			q = get(a.hasta);
		out.push(a.recto ? rightMark(v, p, q) : angleArc(v, p, q, a.radio, tone(a.color)));
		if (a.etiqueta) {
			const lp = bisector(v, p, q, a.radio + 16);
			out.push(label(lp[0], lp[1], a.etiqueta, `l-ang l-${a.color}`));
		}
	}
	for (const p of f.puntos) {
		const v = get(p.id);
		if (p.marca) out.push(`<circle cx="${n(v[0])}" cy="${n(v[1])}" r="3.6" class="dot"/>`);
		const off = SIDE[p.lado];
		const text = p.etiqueta ?? p.id;
		out.push(label(v[0] + off[0] * 16, v[1] + off[1] * 15, text, 'vname'));
	}
	for (const t of f.textos) {
		const v = map([t.x, t.y]);
		out.push(label(v[0], v[1], t.texto, 'note'));
	}
	return { W, H, body: out.join('') };
}

// ─── Circunferencia goniométrica ──────────────────────────────────────────

export function circleSvg(f: CircleFigure) {
	const R = 112,
		W = 380,
		H = 330;
	const O: P = [W / 2, H / 2];
	const at = (deg: number, r = R): P => [O[0] + r * cosD(deg), O[1] - r * sinD(deg)];
	const out: string[] = [];
	// ejes y circunferencia
	out.push(`<line x1="${O[0] - R - 30}" y1="${O[1]}" x2="${O[0] + R + 30}" y2="${O[1]}" class="axis"/>`);
	out.push(`<line x1="${O[0]}" y1="${O[1] + R + 30}" x2="${O[0]}" y2="${O[1] - R - 30}" class="axis"/>`);
	out.push(label(O[0] + R + 34, O[1] + 1, 'x', 'axname', 'start'));
	out.push(label(O[0] + 8, O[1] - R - 32, 'y', 'axname', 'start'));
	out.push(`<circle cx="${O[0]}" cy="${O[1]}" r="${R}" class="ucircle"/>`);
	for (const [x, y, t, anc] of [
		[O[0] + R + 4, O[1] + 14, '1', 'start'],
		[O[0] - R - 4, O[1] + 14, '−1', 'end'],
		[O[0] - 6, O[1] - R - 8, '1', 'end'],
		[O[0] - 6, O[1] + R + 12, '−1', 'end'],
	] as const)
		out.push(label(x, y, t, 'tick', anc));
	if (f.cuadrantes) {
		const q = R * 0.98;
		out.push(label(O[0] + q, O[1] - q, 'I', 'quad'), label(O[0] - q, O[1] - q, 'II', 'quad'), label(O[0] - q, O[1] + q, 'III', 'quad'), label(O[0] + q, O[1] + q, 'IV', 'quad'));
	}
	if (f.recta) {
		const k = f.recta.valor;
		if (f.recta.tipo === 'seno') {
			const y = O[1] - k * R;
			out.push(`<line x1="${O[0] - R - 24}" y1="${n(y)}" x2="${O[0] + R + 24}" y2="${n(y)}" class="seg dash t-y"/>`);
			out.push(label(O[0] + R + 26, y - 10, `y = ${fmtTrim(k, 3)}`, 'l-y', 'start'));
		} else {
			const x = O[0] + k * R;
			out.push(`<line x1="${n(x)}" y1="${O[1] - R - 24}" x2="${n(x)}" y2="${O[1] + R + 24}" class="seg dash t-x"/>`);
			out.push(label(x + 6, O[1] - R - 22, `x = ${fmtTrim(k, 3)}`, 'l-x', 'start'));
		}
	}
	const main = f.angulos.find((a) => a.destacado) ?? f.angulos[0];
	for (const a of f.angulos) {
		if (a === main) continue;
		const p = at(a.grados);
		out.push(`<line x1="${O[0]}" y1="${O[1]}" x2="${n(p[0])}" y2="${n(p[1])}" class="seg ghost"/>`);
		out.push(`<circle cx="${n(p[0])}" cy="${n(p[1])}" r="4.5" class="dot ghost-dot"/>`);
		const lp = at(a.grados, R + 22);
		out.push(label(lp[0], lp[1], a.etiqueta ?? `${fmtTrim(a.grados, 2)}°`, 'l-ghost'));
	}
	const g = main.grados;
	const P0 = at(g);
	const cx = O[0] + R * cosD(g);
	if (f.tangente && Math.abs(cosD(g)) > 0.05) {
		const t = tanD(g);
		const T: P = [O[0] + R, O[1] - R * Math.max(-2.4, Math.min(2.4, t))];
		out.push(`<line x1="${O[0] + R}" y1="${O[1] - R * 2.5}" x2="${O[0] + R}" y2="${O[1] + R * 2.5}" class="seg tline"/>`);
		out.push(`<line x1="${O[0]}" y1="${O[1]}" x2="${n(T[0])}" y2="${n(T[1])}" class="seg dash"/>`);
		out.push(`<line x1="${O[0] + R}" y1="${O[1]}" x2="${n(T[0])}" y2="${n(T[1])}" class="seg thick t-g"/>`);
		out.push(label(T[0] + 8, (O[1] + T[1]) / 2, 'tan', 'l-g', 'start'));
	}
	if (f.proyecciones) {
		out.push(`<line x1="${n(cx)}" y1="${O[1]}" x2="${n(P0[0])}" y2="${n(P0[1])}" class="seg thick t-y"/>`);
		out.push(`<line x1="${O[0]}" y1="${O[1]}" x2="${n(cx)}" y2="${O[1]}" class="seg thick t-x"/>`);
		out.push(label(cx + (cosD(g) >= 0 ? -8 : 8), (O[1] + P0[1]) / 2, 'sin', 'l-y', cosD(g) >= 0 ? 'end' : 'start'));
		out.push(label((O[0] + cx) / 2, O[1] + (sinD(g) >= 0 ? 15 : -13), 'cos', 'l-x'));
	}
	out.push(`<line x1="${O[0]}" y1="${O[1]}" x2="${n(P0[0])}" y2="${n(P0[1])}" class="seg radius"/>`);
	if (f.arco && Math.abs(g) > 0.5) {
		const r = 26;
		const steps = Math.max(6, Math.ceil(Math.abs(g) / 6));
		const pts = Array.from({ length: steps + 1 }, (_, i) => at((g * i) / steps, r));
		out.push(`<path d="M${pts.map(pt).join('L')}" class="arc"/>`);
		const lp = at(g / 2, r + 16);
		out.push(label(lp[0], lp[1], main.etiqueta ?? `${fmtTrim(g, 2)}°`, 'l-ang'));
	}
	out.push(`<circle cx="${n(P0[0])}" cy="${n(P0[1])}" r="5.5" class="dot main-dot"/>`);
	return { W, H, body: out.join('') };
}

// ─── Gráficas de funciones trigonométricas ────────────────────────────────

/** 90 → «π/2», 270 → «3π/2», 360 → «2π». */
export function piLabel(deg: number) {
	if (deg === 0) return '0';
	const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : a);
	const sign = deg < 0 ? '−' : '';
	const d = Math.abs(Math.round(deg));
	const g = gcd(d, 180);
	const num = d / g,
		den = 180 / g;
	return `${sign}${num === 1 ? '' : num}π${den === 1 ? '' : `/${den}`}`;
}

export function functionSvg(f: FunctionFigure) {
	const W = 560,
		H = 270,
		pl = 44,
		pr = 18,
		pt0 = 16,
		pb = 32;
	const [x0, x1] = f.dominio,
		[y0, y1] = f.rango;
	const X = (x: number) => pl + ((x - x0) / (x1 - x0)) * (W - pl - pr);
	const Y = (y: number) => H - pb - ((y - y0) / (y1 - y0)) * (H - pt0 - pb);
	const out: string[] = [];
	const clip = `clip-${Math.random().toString(36).slice(2, 8)}`;
	out.push(`<defs><clipPath id="${clip}"><rect x="${pl}" y="${pt0}" width="${W - pl - pr}" height="${H - pt0 - pb}"/></clipPath></defs>`);
	// rejilla
	for (let x = Math.ceil(x0 / f.paso) * f.paso; x <= x1 + 1e-9; x += f.paso) {
		out.push(`<line x1="${n(X(x))}" y1="${pt0}" x2="${n(X(x))}" y2="${H - pb}" class="grid"/>`);
		out.push(label(X(x), H - pb + 14, f.radianes ? piLabel(x) : `${fmtTrim(x, 1)}°`, 'tick'));
	}
	const ystep = y1 - y0 > 4 ? 1 : 0.5;
	for (let y = Math.ceil(y0 / ystep) * ystep; y <= y1 + 1e-9; y += ystep) {
		if (Math.abs(y) < 1e-9) continue;
		out.push(`<line x1="${pl}" y1="${n(Y(y))}" x2="${W - pr}" y2="${n(Y(y))}" class="grid"/>`);
		if (Math.abs(y - Math.round(y)) < 1e-9 || ystep === 0.5) out.push(label(pl - 7, Y(y), fmtTrim(y, 1).replace('-', '−'), 'tick', 'end'));
	}
	if (y0 < 0 && y1 > 0) out.push(`<line x1="${pl}" y1="${n(Y(0))}" x2="${W - pr}" y2="${n(Y(0))}" class="axis"/>`);
	if (x0 <= 0 && x1 >= 0) out.push(`<line x1="${n(X(0))}" y1="${pt0}" x2="${n(X(0))}" y2="${H - pb}" class="axis"/>`);
	out.push(label(pl - 7, Y(0), '0', 'tick', 'end'));
	// niveles y = k
	for (const lv of f.niveles) {
		out.push(`<line x1="${pl}" y1="${n(Y(lv.y))}" x2="${W - pr}" y2="${n(Y(lv.y))}" class="seg dash t-g"/>`);
		if (lv.etiqueta) out.push(label(W - pr - 4, Y(lv.y) - 11, lv.etiqueta, 'l-g', 'end'));
	}
	// curvas
	const curves: string[] = [];
	f.curvas.forEach((c) => {
		const fn = (x: number) => c.a * trig[c.f](c.b * x + c.c) + c.d;
		const step = (x1 - x0) / 720;
		let d = '';
		let prev: number | null = null;
		for (let i = 0; i <= 720; i++) {
			const x = x0 + i * step;
			const y = fn(x);
			const bad = !Number.isFinite(y) || Math.abs(y) > 50;
			if (bad || (prev !== null && Math.abs(y - prev) > (y1 - y0) * 2)) {
				prev = bad ? null : y;
				if (!bad) d += `M${n(X(x))} ${n(Y(y))}`;
				continue;
			}
			d += `${prev === null ? 'M' : 'L'}${n(X(x))} ${n(Y(y))}`;
			prev = y;
		}
		curves.push(`<path d="${d}" class="curve ${tone(c.color)}${c.discontinua ? ' dash' : ''}"/>`);
		// asíntotas de la tangente
		if (c.f === 'tan') {
			for (let k = -20; k <= 20; k++) {
				const xa = (90 + 180 * k - c.c) / c.b;
				if (xa > x0 && xa < x1) curves.push(`<line x1="${n(X(xa))}" y1="${pt0}" x2="${n(X(xa))}" y2="${H - pb}" class="asym"/>`);
			}
		}
	});
	out.push(`<g clip-path="url(#${clip})">${curves.join('')}</g>`);
	// puntos
	const first = f.curvas[0];
	f.puntos.forEach((p, i) => {
		const y = p.y ?? first.a * trig[first.f](first.b * p.x + first.c) + first.d;
		out.push(`<circle cx="${n(X(p.x))}" cy="${n(Y(y))}" r="5" class="dot main-dot"/>`);
		if (p.etiqueta) out.push(label(X(p.x), Y(y) + (i % 2 ? 18 : -14), p.etiqueta, 'l-pt'));
	});
	return { W, H, body: out.join('') };
}

/** Leyenda de las curvas de una gráfica. */
export const functionLegend = (f: FunctionFigure) => f.curvas.map((c) => ({ etiqueta: c.etiqueta, color: c.color, discontinua: c.discontinua }));

