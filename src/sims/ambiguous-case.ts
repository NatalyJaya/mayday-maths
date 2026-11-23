// El caso ambiguo (LLA): con el ángulo A, el lado b y el lado a (opuesto a A)
// puede haber 0, 1 o 2 triángulos. Se ve con la construcción con compás:
// circunferencia de centro C y radio a cortando la recta de la base.
import { cosD, sinD, solveSSA } from '../lib/math/trig';
import { fmt } from '../lib/format';
import { clear, el, setOut } from './core/svg';

const W = 560,
	U = 30, // píxeles por unidad
	A0 = [70, 270] as const;

class AmbiguousCase extends HTMLElement {
	private A = 35;
	private b = 7;
	private a = 5;
	private svg!: SVGSVGElement;

	connectedCallback() {
		if (this.dataset.ready) return;
		this.dataset.ready = '1';
		this.svg = this.querySelector('svg')!;
		this.querySelectorAll<HTMLInputElement>('input[type=range]').forEach((r) =>
			r.addEventListener('input', () => {
				(this as unknown as Record<string, number>)[r.dataset.k!] = Number(r.value);
				this.render();
			}),
		);
		this.render();
	}

	private render() {
		const svg = this.svg;
		clear(svg);
		const C = [this.b * cosD(this.A), this.b * sinD(this.A)];
		// si A es obtuso, C queda a la izquierda de A: se desplaza el origen
		const ox = Math.max(A0[0], 40 - C[0] * U);
		const X = (x: number) => ox + x * U,
			Y = (y: number) => A0[1] - y * U;
		const h = C[1];
		const sols = solveSSA(this.a, this.b, this.A);
		// recta de la base (donde tiene que estar B)
		el('line', { x1: 20, y1: A0[1], x2: W - 10, y2: A0[1], class: 'ground' }, svg);
		// triángulos
		const Bx = sols.map((t) => t.c).sort((p, q) => p - q);
		Bx.forEach((x, i) => {
			el('path', { d: `M${X(0)} ${Y(0)}L${X(x)} ${Y(0)}L${X(C[0])} ${Y(C[1])}Z`, class: i === 0 && Bx.length === 2 ? 'fill-y' : 'fill-x', style: 'opacity:.75' }, svg);
		});
		// circunferencia de centro C y radio a
		el('circle', { cx: X(C[0]), cy: Y(C[1]), r: this.a * U, class: 'seg dash t-x' }, svg);
		// altura h
		el('line', { x1: X(C[0]), y1: Y(C[1]), x2: X(C[0]), y2: Y(0), class: 'seg dash t-v2' }, svg);
		const t = (x: number, y: number, s: string, cls: string, anchor = 'middle') => {
			const e = el('text', { x, y, class: `lbl ${cls}`, 'text-anchor': anchor, 'dominant-baseline': 'middle' }, svg);
			e.textContent = s;
		};
		t(X(C[0]) + 6, Y(h / 2), `h = b·sin A = ${fmt(h, 2)}`, 'small', 'start');
		// lado b y ángulo A
		el('line', { x1: X(0), y1: Y(0), x2: X(C[0]), y2: Y(C[1]), class: 'seg side' }, svg);
		t(X(C[0] / 2) - 14, Y(C[1] / 2) - 6, `b = ${fmt(this.b, 1)}`, '', 'end');
		el('path', { d: `M${X(1.1)} ${Y(0)}A${1.1 * U} ${1.1 * U} 0 0 0 ${X(1.1 * cosD(this.A))} ${Y(1.1 * sinD(this.A))}`, class: 'arc t-g' }, svg);
		t(X(1.75 * cosD(this.A / 2)), Y(1.75 * sinD(this.A / 2)), `${this.A}°`, 'l-ang small');
		// lados a
		Bx.forEach((x) => {
			el('line', { x1: X(C[0]), y1: Y(C[1]), x2: X(x), y2: Y(0), class: 'seg side t-x' }, svg);
			el('circle', { cx: X(x), cy: Y(0), r: 6, class: 'dot main-dot' }, svg);
		});
		Bx.forEach((x, i) => t(X(x), Y(0) + 18, Bx.length === 2 ? `B${i + 1}` : 'B', 'vname'));
		el('circle', { cx: X(0), cy: Y(0), r: 4, class: 'dot' }, svg);
		el('circle', { cx: X(C[0]), cy: Y(C[1]), r: 4, class: 'dot' }, svg);
		t(X(0) - 12, Y(0) + 4, 'A', 'vname', 'end');
		t(X(C[0]), Y(C[1]) - 16, 'C', 'vname');
		// lecturas
		const out = (k: string, s: string) => setOut(this, k, s);
		out('A', `${this.A}°`);
		out('a', fmt(this.a, 1));
		out('b', fmt(this.b, 1));
		out('h', fmt(h, 2));
		let why: string;
		if (this.A >= 90) why = this.a > this.b ? 'A es obtuso y a > b: un único triángulo.' : 'A no es agudo y a ≤ b: el lado a no llega. Ningún triángulo.';
		else if (this.a < h - 1e-9) why = 'a < h: el lado a es demasiado corto, la circunferencia no toca la base. Ningún triángulo.';
		else if (Math.abs(this.a - h) < 0.05) why = 'a = h: la circunferencia toca la base en un punto. Un triángulo, rectángulo en B.';
		else if (this.a < this.b) why = 'h < a < b: la circunferencia corta la base en dos puntos a la derecha de A. DOS triángulos.';
		else why = 'a ≥ b: el segundo corte queda a la izquierda de A (o en A). Un único triángulo.';
		out('why', why);
		out('n', String(sols.length));
		out(
			'sols',
			sols.length
				? sols.map((s, i) => `${sols.length === 2 ? `Triángulo ${i + 1}: ` : ''}B = ${fmt(s.B, 2)}°, C = ${fmt(s.C, 2)}°, c = ${fmt(s.c, 2)}`).join(' · ')
				: 'sin solución',
		);
	}
}

customElements.define('ambiguous-case', AmbiguousCase);
