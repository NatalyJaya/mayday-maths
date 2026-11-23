// Triángulos semejantes: cambia el tamaño y el ángulo de un triángulo
// rectángulo y observa que los cocientes entre sus lados solo dependen del
// ángulo. Es la idea de la que nacen el seno, el coseno y la tangente.
import { cosD, sinD } from '../lib/math/trig';
import { fmt } from '../lib/format';
import { clear, el } from './core/svg';

const W = 560,
	A = [40, 306] as const,
	CM = 26; // píxeles por centímetro

class RightTriangleExplorer extends HTMLElement {
	private ang = 35;
	private hyp = 9;
	private ghosts = true;
	private svg!: SVGSVGElement;

	connectedCallback() {
		if (this.dataset.ready) return;
		this.dataset.ready = '1';
		this.svg = this.querySelector('svg')!;
		this.querySelectorAll<HTMLInputElement>('input[type=range]').forEach((r) =>
			r.addEventListener('input', () => {
				if (r.dataset.k === 'a') this.ang = Number(r.value);
				else this.hyp = Number(r.value);
				this.render();
			}),
		);
		this.querySelector<HTMLInputElement>('[data-k=ghost]')?.addEventListener('change', (e) => {
			this.ghosts = (e.target as HTMLInputElement).checked;
			this.render();
		});
		this.render();
	}

	private tri(h: number, cls: string, labels: boolean) {
		const svg = this.svg;
		const adj = h * cosD(this.ang) * CM,
			opp = h * sinD(this.ang) * CM;
		const C = [A[0] + adj, A[1]],
			B = [A[0] + adj, A[1] - opp];
		if (!labels) {
			el('path', { d: `M${A[0]} ${A[1]}L${C[0]} ${C[1]}L${B[0]} ${B[1]}Z`, class: `seg ${cls}` }, svg);
			return;
		}
		el('path', { d: `M${A[0]} ${A[1]}L${C[0]} ${C[1]}L${B[0]} ${B[1]}Z`, class: 'fill-soft' }, svg);
		el('line', { x1: A[0], y1: A[1], x2: C[0], y2: C[1], class: 'seg side t-x' }, svg);
		el('line', { x1: C[0], y1: C[1], x2: B[0], y2: B[1], class: 'seg side t-y' }, svg);
		el('line', { x1: A[0], y1: A[1], x2: B[0], y2: B[1], class: 'seg side' }, svg);
		el('path', { d: `M${C[0] - 12} ${C[1]}V${C[1] - 12}H${C[0]}`, class: 'right' }, svg);
		const arcR = 34;
		el('path', { d: `M${A[0] + arcR} ${A[1]}A${arcR} ${arcR} 0 0 0 ${A[0] + arcR * cosD(this.ang)} ${A[1] - arcR * sinD(this.ang)}`, class: 'arc t-g' }, svg);
		const t = (x: number, y: number, s: string, cls: string, anchor = 'middle') => {
			const e = el('text', { x, y, class: `lbl ${cls}`, 'text-anchor': anchor, 'dominant-baseline': 'middle' }, svg);
			e.textContent = s;
		};
		t(A[0] + 50 * cosD(this.ang / 2), A[1] - 50 * sinD(this.ang / 2), 'α', 'l-ang');
		t((A[0] + C[0]) / 2, A[1] + 15, `contiguo = ${fmt(this.hyp * cosD(this.ang), 2)} cm`, 'l-x small');
		t(C[0] + 8, (C[1] + B[1]) / 2, `opuesto = ${fmt(this.hyp * sinD(this.ang), 2)} cm`, 'l-y small', 'start');
		const mx = (A[0] + B[0]) / 2,
			my = (A[1] + B[1]) / 2;
		t(mx - 12 * sinD(this.ang), my - 12 * cosD(this.ang) - 4, `hipotenusa = ${fmt(this.hyp, 2)} cm`, 'small', 'end');
	}

	private render() {
		clear(this.svg);
		el('line', { x1: 20, y1: A[1], x2: W - 10, y2: A[1], class: 'grid' }, this.svg);
		if (this.ghosts) for (const h of [3, 5, 7, 11]) if (Math.abs(h - this.hyp) > 0.6) this.tri(h, 'ghost', false);
		this.tri(this.hyp, '', true);
		const out = (k: string, s: string) => (this.querySelector(`[data-out="${k}"]`)!.textContent = s);
		out('a', `${this.ang}°`);
		out('h', `${fmt(this.hyp, 1)} cm`);
		out('sin', fmt(sinD(this.ang), 3));
		out('cos', fmt(cosD(this.ang), 3));
		out('tan', fmt(sinD(this.ang) / cosD(this.ang), 3));
	}
}

customElements.define('right-triangle-explorer', RightTriangleExplorer);
