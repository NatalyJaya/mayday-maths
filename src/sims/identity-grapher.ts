// ¿Es una identidad? Dibuja los dos miembros como funciones: si las curvas
// coinciden en TODOS los puntos, es una identidad; si se separan aunque sea
// en un punto, no lo es (y ese punto es un contraejemplo).
import { cosD, sinD, tanD } from '../lib/math/trig';
import { fmt } from '../lib/format';
import { clear, el, setOut } from './core/svg';

interface Pair {
	l: string;
	r: string;
	f: (x: number) => number;
	g: (x: number) => number;
	dom: [number, number];
	note: string;
}

const PAIRS: Pair[] = [
	{ l: 'sin 2x', r: '2·sin x', f: (x) => sinD(2 * x), g: (x) => 2 * sinD(x), dom: [0, 360], note: 'El 2 no «sale fuera» del seno. Lo correcto es sin 2x = 2·sin x·cos x.' },
	{ l: 'sin 2x', r: '2·sin x·cos x', f: (x) => sinD(2 * x), g: (x) => 2 * sinD(x) * cosD(x), dom: [0, 360], note: 'Fórmula del ángulo doble.' },
	{ l: 'cos 2x', r: 'cos²x − sin²x', f: (x) => cosD(2 * x), g: (x) => cosD(x) ** 2 - sinD(x) ** 2, dom: [0, 360], note: 'Fórmula del ángulo doble. Con sin²x + cos²x = 1 también vale 1 − 2·sin²x y 2·cos²x − 1.' },
	{ l: 'sin(x + 30°)', r: 'sin x + sin 30°', f: (x) => sinD(x + 30), g: (x) => sinD(x) + 0.5, dom: [0, 360], note: 'El seno no se reparte en una suma.' },
	{ l: 'sin(x + 30°)', r: 'sin x·cos 30° + cos x·sin 30°', f: (x) => sinD(x + 30), g: (x) => sinD(x) * cosD(30) + cosD(x) * 0.5, dom: [0, 360], note: 'Fórmula del seno de la suma.' },
	{ l: 'sin²x + cos²x', r: '1', f: (x) => sinD(x) ** 2 + cosD(x) ** 2, g: () => 1, dom: [0, 360], note: 'Identidad fundamental: es el teorema de Pitágoras en la circunferencia de radio 1.' },
	{ l: '1 + tan²x', r: '1 / cos²x', f: (x) => 1 + tanD(x) ** 2, g: (x) => 1 / cosD(x) ** 2, dom: [0, 360], note: 'Se obtiene dividiendo la identidad fundamental entre cos²x. Fuera de 90° y 270°, donde ninguno de los dos lados existe.' },
	{ l: 'cos(x/2)', r: '√((1 + cos x)/2)', f: (x) => cosD(x / 2), g: (x) => Math.sqrt((1 + cosD(x)) / 2), dom: [0, 720], note: 'Solo coinciden cuando cos(x/2) ≥ 0. Por eso la fórmula del ángulo mitad lleva ±: el signo depende del cuadrante de x/2.' },
	{ l: 'sin x / (1 + cos x)', r: 'tan(x/2)', f: (x) => sinD(x) / (1 + cosD(x)), g: (x) => tanD(x / 2), dom: [0, 360], note: 'Es la identidad «per demà» de clase. Coinciden en todo su dominio (x ≠ 180°).' },
];

const W = 560,
	H = 280,
	pl = 40,
	pr = 14,
	pt = 14,
	pb = 30;

class IdentityGrapher extends HTMLElement {
	private i = 0;
	private x = 60;
	private svg!: SVGSVGElement;
	private uid = `ig-${Math.random().toString(36).slice(2, 8)}`;

	connectedCallback() {
		if (this.dataset.ready) return;
		this.dataset.ready = '1';
		this.svg = this.querySelector('svg')!;
		const sel = this.querySelector('select')!;
		PAIRS.forEach((p, i) => {
			const o = document.createElement('option');
			o.value = String(i);
			o.textContent = `${p.l}  =?  ${p.r}`;
			sel.appendChild(o);
		});
		this.i = Number(this.dataset.pair ?? 0);
		sel.value = String(this.i);
		sel.addEventListener('change', () => {
			this.i = Number(sel.value);
			this.render();
		});
		this.querySelector<HTMLInputElement>('input[type=range]')!.addEventListener('input', (e) => {
			this.x = Number((e.target as HTMLInputElement).value);
			this.render();
		});
		this.render();
	}

	private render() {
		const p = PAIRS[this.i];
		const svg = this.svg;
		clear(svg);
		const [x0, x1] = p.dom;
		const range = this.querySelector<HTMLInputElement>('input[type=range]')!;
		range.max = String(x1);
		if (this.x > x1) this.x = x1;
		const vals: number[] = [];
		for (let x = x0; x <= x1; x += 1) for (const v of [p.f(x), p.g(x)]) if (Number.isFinite(v) && Math.abs(v) < 6) vals.push(v);
		const ymin = Math.min(-1.2, ...vals) - 0.1,
			ymax = Math.max(1.2, ...vals) + 0.1;
		const X = (x: number) => pl + ((x - x0) / (x1 - x0)) * (W - pl - pr);
		const Y = (y: number) => pt + ((ymax - y) / (ymax - ymin)) * (H - pt - pb);
		for (let x = x0; x <= x1; x += 90) {
			el('line', { x1: X(x), y1: pt, x2: X(x), y2: H - pb, class: 'grid' }, svg);
			const t = el('text', { x: X(x), y: H - 10, class: 'tick', 'text-anchor': 'middle' }, svg);
			t.textContent = `${x}°`;
		}
		for (let y = Math.ceil(ymin); y <= ymax; y++) {
			el('line', { x1: pl, y1: Y(y), x2: W - pr, y2: Y(y), class: y === 0 ? 'axis' : 'grid' }, svg);
			const t = el('text', { x: pl - 6, y: Y(y) + 4, class: 'tick', 'text-anchor': 'end' }, svg);
			t.textContent = String(y).replace('-', '−');
		}
		const clip = el('clipPath', { id: this.uid }, svg);
		el('rect', { x: pl, y: pt, width: W - pl - pr, height: H - pt - pb }, clip);
		const g = el('g', { 'clip-path': `url(#${this.uid})` }, svg);
		const path = (fn: (x: number) => number, cls: string) => {
			let d = '';
			let pen = false;
			let prev = 0;
			for (let x = x0; x <= x1; x += 0.5) {
				const y = fn(x);
				if (!Number.isFinite(y) || Math.abs(y) > 20 || (pen && Math.abs(y - prev) > 4)) {
					pen = false;
					prev = y;
					continue;
				}
				d += `${pen ? 'L' : 'M'}${X(x).toFixed(1)} ${Y(y).toFixed(1)}`;
				pen = true;
				prev = y;
			}
			el('path', { d, class: `curve ${cls}` }, g);
		};
		path(p.f, 't-x');
		path(p.g, 't-g dash');
		// ¿coinciden?
		let worst = 0,
			wx = NaN;
		const nice = [];
		for (let x = x0; x <= x1; x += 15) nice.push(x);
		for (const x of nice) {
			const a = p.f(x),
				b = p.g(x);
			if (!Number.isFinite(a) || !Number.isFinite(b)) continue;
			const d = Math.abs(a - b) / Math.max(1, Math.abs(a));
			if (d > worst + 1e-9) {
				worst = d;
				wx = x;
			}
		}
		for (let x = x0; x <= x1; x += 0.25) {
			const a = p.f(x),
				b = p.g(x);
			const d = Math.abs(a - b) / Math.max(1, Math.abs(a));
			if (Number.isFinite(a) && Number.isFinite(b) && d > worst + 1e-6) {
				worst = d;
				if (!Number.isFinite(wx)) wx = x;
			}
		}
		const same = worst < 1e-9;
		const cx = this.x;
		el('line', { x1: X(cx), y1: pt, x2: X(cx), y2: H - pb, class: 'cursor' }, svg);
		for (const [fn, col] of [
			[p.f, 'var(--q-x)'],
			[p.g, 'var(--q-g)'],
		] as const) {
			const y = fn(cx);
			if (Number.isFinite(y) && y > ymin && y < ymax) el('circle', { cx: X(cx), cy: Y(y), r: 5, class: 'dot', style: `fill:${col}` }, svg);
		}
		const out = (k: string, s: string) => setOut(this, k, s);
		out('l', p.l);
		out('r', p.r);
		out('x', `${cx}°`);
		const show = (v: number) => (Number.isFinite(v) && Math.abs(v) < 1e6 ? fmt(v, 4) : 'no existe');
		out('fx', show(p.f(cx)));
		out('gx', show(p.g(cx)));
		const verdict = this.querySelector('.ig-verdict')!;
		verdict.className = `sim-note ig-verdict ${same ? 'ok' : 'bad'}`;
		out(
			'verdict',
			same
				? 'Las dos curvas coinciden en todos los puntos: es una identidad.'
				: `No es una identidad: por ejemplo, en x = ${fmt(wx, 0)}° el lado izquierdo vale ${show(p.f(wx))} y el derecho ${show(p.g(wx))}.`,
		);
		out('note', p.note);
	}
}

customElements.define('identity-grapher', IdentityGrapher);
