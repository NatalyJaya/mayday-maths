// Laboratorio de triángulos: arrastra los vértices y comprueba en vivo el
// teorema del seno (los tres cocientes valen lo mismo, 2R) y el del coseno.
// Cada lado tiene el color de su ángulo opuesto. Acepta ?a=7&b=5&c=8.
import { acosD, cosD, sinD, triangleCoords } from '../lib/math/trig';
import { fmt } from '../lib/format';
import { clear, el, setOut } from './core/svg';
import { dragArea, urlNumber } from './core/drag';

type V = 'A' | 'B' | 'C';
const W = 560,
	H = 380,
	PAD = 26;

class TriangleLab extends HTMLElement {
	private P: Record<V, [number, number]> = { A: [1.5, 1], B: [12, 1], C: [4.5, 7.5] };
	private u = 34; // píxeles por unidad
	private sel: V = 'C';
	private snap = true;
	private circ = false;
	private svg!: SVGSVGElement;

	connectedCallback() {
		if (this.dataset.ready) return;
		this.dataset.ready = '1';
		this.svg = this.querySelector('svg')!;
		const a = urlNumber('a', NaN, 0.1, 1000),
			b = urlNumber('b', NaN, 0.1, 1000),
			c = urlNumber('c', NaN, 0.1, 1000);
		if (this.hasAttribute('data-url') && [a, b, c].every(Number.isFinite) && a + b > c && a + c > b && b + c > a) {
			const t = triangleCoords(a, b, c);
			const xs = [t.A[0], t.B[0], t.C[0]];
			const minX = Math.min(...xs);
			const span = Math.max(Math.max(...xs) - minX, t.C[1]);
			this.u = Math.min(40, (H - 2 * PAD - 20) / span, (W - 2 * PAD - 20) / (Math.max(...xs) - minX));
			const off = 1 - minX;
			this.P = { A: [t.A[0] + off, 0.8], B: [t.B[0] + off, 0.8], C: [t.C[0] + off, t.C[1] + 0.8] };
			this.snap = false;
			const box = this.querySelector<HTMLInputElement>('[data-k=snap]');
			if (box) box.checked = false;
		}
		this.querySelector<HTMLInputElement>('[data-k=snap]')?.addEventListener('change', (e) => (this.snap = (e.target as HTMLInputElement).checked));
		this.querySelector<HTMLInputElement>('[data-k=circ]')?.addEventListener('change', (e) => {
			this.circ = (e.target as HTMLInputElement).checked;
			this.render();
		});
		this.querySelectorAll<HTMLButtonElement>('[data-preset]').forEach((btn) =>
			btn.addEventListener('click', () => {
				const p = JSON.parse(btn.dataset.preset!);
				this.u = 34;
				this.P = p;
				this.render();
			}),
		);
		const toU = (x: number, y: number): [number, number] => [(x - PAD) / this.u, (H - PAD - y) / this.u];
		dragArea(this.svg, {
			start: (x, y) => {
				const [ux, uy] = toU(x, y);
				let best: V | null = null,
					bd = 30 / this.u;
				for (const k of ['A', 'B', 'C'] as V[]) {
					const d = Math.hypot(this.P[k][0] - ux, this.P[k][1] - uy);
					if (d < bd) {
						bd = d;
						best = k;
					}
				}
				if (!best) return false;
				this.sel = best;
				return true;
			},
			move: (x, y) => {
				let [ux, uy] = toU(x, y);
				const maxX = (W - 2 * PAD) / this.u,
					maxY = (H - 2 * PAD) / this.u;
				ux = Math.max(0, Math.min(maxX, ux));
				uy = Math.max(0, Math.min(maxY, uy));
				if (this.snap) {
					ux = Math.round(ux * 2) / 2;
					uy = Math.round(uy * 2) / 2;
				}
				this.P[this.sel] = [ux, uy];
				this.render();
			},
			key: (dx, dy) => {
				const p = this.P[this.sel];
				this.P[this.sel] = [p[0] + dx * 0.5, p[1] + dy * 0.5];
				this.render();
			},
		});
		this.querySelectorAll<HTMLButtonElement>('[data-sel]').forEach((b) =>
			b.addEventListener('click', () => {
				this.sel = b.dataset.sel as V;
				this.render();
				this.svg.focus();
			}),
		);
		this.render();
	}

	private render() {
		const svg = this.svg;
		clear(svg);
		const X = (x: number) => PAD + x * this.u,
			Y = (y: number) => H - PAD - y * this.u;
		// cuadrícula: cada unidad
		for (let x = 0; X(x) <= W - PAD + 0.1; x++) el('line', { x1: X(x), y1: PAD, x2: X(x), y2: H - PAD, class: 'grid' }, svg);
		for (let y = 0; Y(y) >= PAD - 0.1; y++) el('line', { x1: PAD, y1: Y(y), x2: W - PAD, y2: Y(y), class: 'grid' }, svg);
		const { A, B, C } = this.P;
		const d = (p: number[], q: number[]) => Math.hypot(p[0] - q[0], p[1] - q[1]);
		const a = d(B, C),
			b = d(A, C),
			c = d(A, B);
		const area2 = (B[0] - A[0]) * (C[1] - A[1]) - (C[0] - A[0]) * (B[1] - A[1]);
		const deg = Math.abs(area2) < 1e-6 || a < 1e-6 || b < 1e-6 || c < 1e-6;
		const Ang = deg ? { A: NaN, B: NaN, C: NaN } : { A: acosD((b * b + c * c - a * a) / (2 * b * c)), B: acosD((a * a + c * c - b * b) / (2 * a * c)), C: 0 };
		Ang.C = 180 - Ang.A - Ang.B;
		const px = (p: number[]) => [X(p[0]), Y(p[1])];
		const [pA, pB, pC] = [px(A), px(B), px(C)];
		const G = [(pA[0] + pB[0] + pC[0]) / 3, (pA[1] + pB[1] + pC[1]) / 3];
		el('path', { d: `M${pA[0]} ${pA[1]}L${pB[0]} ${pB[1]}L${pC[0]} ${pC[1]}Z`, class: 'fill-soft' }, svg);
		if (this.circ && !deg) {
			const R = a / (2 * sinD(Ang.A));
			// circuncentro
			const D = 2 * (A[0] * (B[1] - C[1]) + B[0] * (C[1] - A[1]) + C[0] * (A[1] - B[1]));
			const sq = (p: number[]) => p[0] * p[0] + p[1] * p[1];
			const ux = (sq(A) * (B[1] - C[1]) + sq(B) * (C[1] - A[1]) + sq(C) * (A[1] - B[1])) / D;
			const uy = (sq(A) * (C[0] - B[0]) + sq(B) * (A[0] - C[0]) + sq(C) * (B[0] - A[0])) / D;
			el('circle', { cx: X(ux), cy: Y(uy), r: R * this.u, class: 'seg dash t-v2' }, svg);
			el('circle', { cx: X(ux), cy: Y(uy), r: 3, class: 'dot' }, svg);
		}
		const sides: [string, number[], number[], number, string][] = [
			['a', pB, pC, a, 't-x'],
			['b', pA, pC, b, 't-y'],
			['c', pA, pB, c, 't-g'],
		];
		const txt = (x: number, y: number, s: string, cls: string) => {
			const e = el('text', { x, y, class: `lbl ${cls}`, 'text-anchor': 'middle', 'dominant-baseline': 'middle' }, svg);
			e.textContent = s;
		};
		for (const [n, p, q, L, cls] of sides) {
			el('line', { x1: p[0], y1: p[1], x2: q[0], y2: q[1], class: `seg side ${cls}` }, svg);
			const m = [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2];
			const dx = m[0] - G[0],
				dy = m[1] - G[1],
				dl = Math.hypot(dx, dy) || 1;
			txt(m[0] + (dx / dl) * 18, m[1] + (dy / dl) * 18, `${n} = ${fmt(L, 2)}`, `small l-${cls.slice(2)}`);
		}
		const verts: [V, number[], string][] = [
			['A', pA, 'l-x'],
			['B', pB, 'l-y'],
			['C', pC, 'l-g'],
		];
		for (const [k, p, cls] of verts) {
			const dx = p[0] - G[0],
				dy = p[1] - G[1],
				dl = Math.hypot(dx, dy) || 1;
			if (!deg) {
				// etiqueta del ángulo, hacia dentro
				txt(p[0] - (dx / dl) * 30, p[1] - (dy / dl) * 30, `${fmt(Ang[k], 1)}°`, `small ${cls}`);
			}
			el('circle', { cx: p[0], cy: p[1], r: k === this.sel ? 10 : 8, class: 'handle' }, svg);
			txt(p[0] + (dx / dl) * 20, p[1] + (dy / dl) * 20, k, 'vname');
		}
		svg.setAttribute('aria-valuetext', `Vértice seleccionado ${this.sel}`);
		// lecturas
		const out = (k: string, s: string) => setOut(this, k, s);
		this.querySelector('.tl-bad')!.toggleAttribute('hidden', !deg);
		if (deg) return;
		out('ra', fmt(a / sinD(Ang.A), 3));
		out('rb', fmt(b / sinD(Ang.B), 3));
		out('rc', fmt(c / sinD(Ang.C), 3));
		out('2r', fmt(a / sinD(Ang.A), 3));
		out('a2', fmt(a * a, 2));
		out('cos', `${fmt(b * b, 2)} + ${fmt(c * c, 2)} − 2·${fmt(b, 2)}·${fmt(c, 2)}·cos ${fmt(Ang.A, 1)}° = ${fmt(b * b + c * c - 2 * b * c * cosD(Ang.A), 2)}`);
		out('area', fmt(0.5 * b * c * sinD(Ang.A), 2));
		const p = (a + b + c) / 2;
		out('heron', fmt(Math.sqrt(p * (p - a) * (p - b) * (p - c)), 2));
		const kind = Math.abs(Ang.A - 90) < 0.05 || Math.abs(Ang.B - 90) < 0.05 || Math.abs(Ang.C - 90) < 0.05 ? 'rectángulo' : Math.max(Ang.A, Ang.B, Ang.C) > 90 ? 'obtusángulo' : 'acutángulo';
		out('kind', kind);
		out('sum', `${fmt(Ang.A + Ang.B + Ang.C, 1)}°`);
	}
}

customElements.define('triangle-lab', TriangleLab);
