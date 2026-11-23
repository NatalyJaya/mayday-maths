// Demostración geométrica de sin(α + β) y cos(α + β). Se construye el
// ángulo α + β con radio 1 y se descompone en dos triángulos rectángulos.
//   O = origen, P = (cos(α+β), sin(α+β)), Q = pie de la perpendicular desde P
//   sobre el lado de α (OQ = cos β, QP = sin β), R y S = proyecciones de Q y P
//   sobre el eje X, T = (P.x, Q.y). El ángulo TPQ vale α.
import { cosD, sinD } from '../lib/math/trig';
import { fmt } from '../lib/format';
import { clear, el, setOut } from './core/svg';

const W = 520,
	H = 430,
	U = 360,
	O = [60, 400] as const;

class SumFormula extends HTMLElement {
	private a = 30;
	private b = 25;
	private mode: 'sin' | 'cos' = 'sin';
	private svg!: SVGSVGElement;

	connectedCallback() {
		if (this.dataset.ready) return;
		this.dataset.ready = '1';
		this.svg = this.querySelector('svg')!;
		this.querySelectorAll<HTMLInputElement>('input[type=range]').forEach((r) =>
			r.addEventListener('input', () => {
				if (r.dataset.k === 'a') this.a = Number(r.value);
				else this.b = Number(r.value);
				if (this.a + this.b > 85) {
					this.b = 85 - this.a;
					this.querySelector<HTMLInputElement>('[data-k=b]')!.value = String(this.b);
				}
				this.render();
			}),
		);
		this.querySelectorAll<HTMLInputElement>('input[type=radio]').forEach((r) =>
			r.addEventListener('change', () => {
				this.mode = r.value as 'sin' | 'cos';
				this.render();
			}),
		);
		this.render();
	}

	private render() {
		const svg = this.svg;
		clear(svg);
		const { a, b } = this;
		const X = (x: number) => O[0] + x * U,
			Y = (y: number) => O[1] - y * U;
		const P = [cosD(a + b), sinD(a + b)];
		const Q = [cosD(b) * cosD(a), cosD(b) * sinD(a)];
		const R = [Q[0], 0],
			S = [P[0], 0],
			T = [P[0], Q[1]];
		const line = (p: number[], q: number[], cls: string) => el('line', { x1: X(p[0]), y1: Y(p[1]), x2: X(q[0]), y2: Y(q[1]), class: `seg ${cls}` }, svg);
		const txt = (x: number, y: number, s: string, cls: string, anchor = 'middle') => {
			const e = el('text', { x, y, class: `lbl ${cls}`, 'text-anchor': anchor, 'dominant-baseline': 'middle' }, svg);
			e.textContent = s;
		};
		const right = (v: number[], p: number[], q: number[]) => {
			const u = [p[0] - v[0], p[1] - v[1]],
				w = [q[0] - v[0], q[1] - v[1]];
			const lu = Math.hypot(u[0], u[1]),
				lw = Math.hypot(w[0], w[1]);
			const k = 0.03;
			const a1 = [v[0] + (u[0] / lu) * k, v[1] + (u[1] / lu) * k],
				a2 = [a1[0] + (w[0] / lw) * k, a1[1] + (w[1] / lw) * k],
				a3 = [v[0] + (w[0] / lw) * k, v[1] + (w[1] / lw) * k];
			el('path', { d: `M${X(a1[0])} ${Y(a1[1])}L${X(a2[0])} ${Y(a2[1])}L${X(a3[0])} ${Y(a3[1])}`, class: 'right' }, svg);
		};
		const arc = (v: number[], from: number, to: number, r: number, cls: string) => {
			const p1 = [v[0] + r * cosD(from), v[1] + r * sinD(from)],
				p2 = [v[0] + r * cosD(to), v[1] + r * sinD(to)];
			el('path', { d: `M${X(p1[0])} ${Y(p1[1])}A${r * U} ${r * U} 0 0 0 ${X(p2[0])} ${Y(p2[1])}`, class: `arc ${cls}` }, svg);
		};
		el('line', { x1: 20, y1: O[1], x2: W - 10, y2: O[1], class: 'axis' }, svg);
		el('line', { x1: O[0], y1: H - 10, x2: O[0], y2: 10, class: 'axis' }, svg);
		// rectángulo de fondo y triángulos
		el('path', { d: `M${X(0)} ${Y(0)}L${X(Q[0])} ${Y(Q[1])}L${X(P[0])} ${Y(P[1])}Z`, class: 'fill-soft' }, svg);
		const sinMode = this.mode === 'sin';
		line([0, 0], P, 'radius');
		line([0, 0], Q, 'side t-x');
		line(Q, P, 'side t-y');
		line(Q, R, sinMode ? 'thick t-y' : 'dash t-v2');
		line([0, 0], R, sinMode ? 'dash t-v2' : 'thick t-x');
		line(P, T, sinMode ? 'thick t-g' : 'dash t-v2');
		line(T, Q, sinMode ? 'dash t-v2' : 'thick t-g');
		line(T, S, sinMode ? 'dash t-v2' : 'dash t-v2');
		line(S, [0, 0], sinMode ? 'dash t-v2' : 'seg');
		right(Q, [0, 0], P);
		right(R, [0, 0], Q);
		right(S, [0, 0], P);
		arc([0, 0], 0, a, 0.13, 't-g');
		arc([0, 0], a, a + b, 0.2, '');
		arc(P, 270, 270 + a, 0.1, 't-g');
		txt(X(0.2 * cosD(a / 2)), Y(0.2 * sinD(a / 2)), 'α', 'l-g');
		txt(X(0.27 * cosD(a + b / 2)), Y(0.27 * sinD(a + b / 2)), 'β', 'l-ang');
		txt(X(P[0] + 0.15 * cosD(270 + a / 2)), Y(P[1] + 0.15 * sinD(270 + a / 2)), 'α', 'l-g');
		txt(X(P[0] / 2) - 10, Y(P[1] / 2) - 8, '1', 'big', 'end');
		txt(X(Q[0] / 2) + 6, Y(Q[1] / 2) + 16, 'cos β', 'l-x', 'start');
		txt(X((Q[0] + P[0]) / 2) + 10, Y((Q[1] + P[1]) / 2), 'sin β', 'l-y', 'start');
		for (const [p, n, dx, dy] of [
			[[0, 0], 'O', -12, 14],
			[P, 'P', -6, -14],
			[Q, 'Q', 14, 0],
			[R, 'R', 0, 16],
			[S, 'S', 0, 16],
			[T, 'T', -12, 0],
		] as const)
			txt(X(p[0]) + dx, Y(p[1]) + dy, n, 'vname small');
		if (sinMode) {
			txt(X(Q[0]) + 8, Y(Q[1] / 2), 'sin α · cos β', 'l-y small', 'start');
			txt(X(P[0]) - 8, Y((P[1] + T[1]) / 2), 'cos α · sin β', 'l-g small', 'end');
		} else {
			txt(X(R[0] / 2), Y(0) + 30, 'cos α · cos β', 'l-x small');
			txt(X((T[0] + Q[0]) / 2), Y(Q[1]) - 12, 'sin α · sin β', 'l-g small');
		}
		const out = (k: string, s: string) => setOut(this, k, s);
		out('a', `${a}°`);
		out('b', `${b}°`);
		out('lhs', fmt(sinMode ? sinD(a + b) : cosD(a + b), 4));
		out('t1', fmt(sinMode ? sinD(a) * cosD(b) : cosD(a) * cosD(b), 4));
		out('t2', fmt(sinMode ? cosD(a) * sinD(b) : sinD(a) * sinD(b), 4));
		out('op', sinMode ? '+' : '−');
		out('f', sinMode ? 'sin' : 'cos');
		out('naive', fmt(sinMode ? sinD(a) + sinD(b) : cosD(a) + cosD(b), 4));
	}
}

customElements.define('sum-formula', SumFormula);
