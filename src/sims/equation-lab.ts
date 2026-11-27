// Laboratorio de ecuaciones: f(n·x) = k en [0°, 360°). A la izquierda, la
// gráfica con la recta y = k y los cortes (las soluciones). A la derecha, la
// circunferencia con los ángulos básicos. Acepta ?f=sin&n=2&k=0.5.
import { cosD, sinD, solveBasic, solveCompound, trig, type TrigFn } from '../lib/math/trig';
import { fmt, fmtTrim } from '../lib/format';
import { clear, el, setOut } from './core/svg';
import { urlNumber, urlString } from './core/drag';

const GW = 460,
	GH = 280,
	pl = 38,
	pr = 12,
	pt = 14,
	pb = 30;
const CW = 300,
	CH = 300,
	R = 110,
	O = [CW / 2, CH / 2] as const;

const NOTABLE: [string, number][] = [
	['−1', -1],
	['−√3/2', -Math.sqrt(3) / 2],
	['−√2/2', -Math.SQRT1_2],
	['−1/2', -0.5],
	['0', 0],
	['1/2', 0.5],
	['√2/2', Math.SQRT1_2],
	['√3/2', Math.sqrt(3) / 2],
	['1', 1],
];
const NOTABLE_TAN: [string, number][] = [
	['−√3', -Math.sqrt(3)],
	['−1', -1],
	['−√3/3', -Math.sqrt(3) / 3],
	['0', 0],
	['√3/3', Math.sqrt(3) / 3],
	['1', 1],
	['√3', Math.sqrt(3)],
];

class EquationLab extends HTMLElement {
	private f: TrigFn = 'sin';
	private n = 1;
	private k = 0.5;
	private graph!: SVGSVGElement;
	private circle!: SVGSVGElement;
	private uid = `eq-${Math.random().toString(36).slice(2, 8)}`;

	connectedCallback() {
		if (this.dataset.ready) return;
		this.dataset.ready = '1';
		[this.graph, this.circle] = [...this.querySelectorAll('svg')] as SVGSVGElement[];
		const df = this.dataset.f;
		if (df === 'sin' || df === 'cos' || df === 'tan') this.f = df;
		if (this.dataset.n) this.n = Number(this.dataset.n);
		if (this.dataset.k) this.k = Number(this.dataset.k);
		if (this.hasAttribute('data-url')) {
			const f = urlString('f');
			if (f === 'sin' || f === 'cos' || f === 'tan') this.f = f;
			this.n = urlNumber('n', this.n, 0.5, 4);
			this.k = urlNumber('k', this.k, -3, 3);
		}
		const fSel = this.querySelector<HTMLSelectElement>('[data-k=f]')!;
		const nSel = this.querySelector<HTMLSelectElement>('[data-k=n]')!;
		const kIn = this.querySelector<HTMLInputElement>('[data-k=k]')!;
		fSel.value = this.f;
		nSel.value = String(this.n);
		kIn.value = String(this.k);
		fSel.addEventListener('change', () => {
			this.f = fSel.value as TrigFn;
			this.syncRange();
			this.render();
		});
		nSel.addEventListener('change', () => {
			this.n = Number(nSel.value);
			this.render();
		});
		kIn.addEventListener('input', () => {
			this.k = Number(kIn.value);
			this.render();
		});
		this.syncRange();
		this.render();
	}

	private syncRange() {
		const kIn = this.querySelector<HTMLInputElement>('[data-k=k]')!;
		const lim = this.f === 'tan' ? 3 : 1.5;
		kIn.min = String(-lim);
		kIn.max = String(lim);
		this.k = Math.max(-lim, Math.min(lim, this.k));
		kIn.value = String(this.k);
		const box = this.querySelector('.eq-quick')!;
		box.replaceChildren();
		for (const [t, v] of this.f === 'tan' ? NOTABLE_TAN : NOTABLE) {
			const b = document.createElement('button');
			b.type = 'button';
			b.className = 'btn btn-sm';
			b.textContent = t;
			b.addEventListener('click', () => {
				this.k = v;
				kIn.value = String(v);
				this.render();
			});
			box.appendChild(b);
		}
	}

	private render() {
		const sols = solveCompound(this.f, this.k, this.n, 0, 0, 360);
		this.drawGraph(sols);
		this.drawCircle();
		const fn = this.f;
		const out = (key: string, s: string) => setOut(this, key, s);
		const arg = this.n === 1 ? 'x' : `${fmtTrim(this.n, 1)}x`;
		out('eq', `${fn} ${arg} = ${fmt(this.k, 3)}`);
		out('k', fmt(this.k, 3));
		const base = solveBasic(fn, this.k);
		const note = this.querySelector('.eq-note')!;
		if (!base.length) {
			note.className = 'sim-note eq-note bad';
			out('steps', `No hi ha solució: ${fn === 'sin' ? 'el sinus' : 'el cosinus'} sempre és entre −1 i 1, i ${fmt(this.k, 3)} surt d’aquest interval. La recta no talla la corba.`);
		} else {
			note.className = 'sim-note eq-note';
			const u = base.map((v) => `${fmtTrim(v, 2)}°`).join(' i ');
			const period = fn === 'tan' ? 180 : 360;
			const steps =
				this.n === 1
					? `Angles d’una volta amb ${fn} = ${fmt(this.k, 3)}: ${u}. ${base.length === 1 ? 'Només n’hi ha un perquè el valor és un extrem (±1).' : ''}`
					: `Anomenem u = ${arg}. Si x recorre [0°, 360°), u recorre [0°, ${fmtTrim(360 * this.n, 1)}°): ${this.n > 1 ? 'més d’una volta' : 'mitja volta'}. Angles bàsics: u = ${u} (+ 360°·k). Després es divideix entre ${fmtTrim(this.n, 1)}.`;
			out('steps', `${steps}${fn === 'tan' ? ` La tangent es repeteix cada ${period}°.` : ''}`);
		}
		out('sols', sols.length ? sols.map((s) => `${fmtTrim(s, 2)}°`).join(' ; ') : '—');
		out('count', String(sols.length));
	}

	private drawGraph(sols: number[]) {
		const svg = this.graph;
		clear(svg);
		const yr = this.f === 'tan' ? 3.5 : 1.6;
		const X = (x: number) => pl + (x / 360) * (GW - pl - pr);
		const Y = (y: number) => pt + ((yr - y) / (2 * yr)) * (GH - pt - pb);
		for (let x = 0; x <= 360; x += 45) {
			el('line', { x1: X(x), y1: pt, x2: X(x), y2: GH - pb, class: 'grid' }, svg);
			if (x % 90 === 0) {
				const t = el('text', { x: X(x), y: GH - 10, class: 'tick', 'text-anchor': 'middle' }, svg);
				t.textContent = `${x}°`;
			}
		}
		for (const y of this.f === 'tan' ? [-3, -2, -1, 1, 2, 3] : [-1, 1]) {
			el('line', { x1: pl, y1: Y(y), x2: GW - pr, y2: Y(y), class: 'grid' }, svg);
			const t = el('text', { x: pl - 6, y: Y(y) + 4, class: 'tick', 'text-anchor': 'end' }, svg);
			t.textContent = String(y).replace('-', '−');
		}
		el('line', { x1: pl, y1: Y(0), x2: GW - pr, y2: Y(0), class: 'axis' }, svg);
		const clip = el('clipPath', { id: this.uid }, svg);
		el('rect', { x: pl, y: pt, width: GW - pl - pr, height: GH - pt - pb }, clip);
		const g = el('g', { 'clip-path': `url(#${this.uid})` }, svg);
		let d = '';
		let pen = false;
		let prev = 0;
		const fn = trig[this.f];
		for (let x = 0; x <= 360; x += 0.5) {
			const y = fn(this.n * x);
			if (!Number.isFinite(y) || (pen && Math.abs(y - prev) > yr)) {
				pen = false;
				prev = y;
				continue;
			}
			d += `${pen ? 'L' : 'M'}${X(x).toFixed(1)} ${Y(Math.max(-yr * 3, Math.min(yr * 3, y))).toFixed(1)}`;
			pen = true;
			prev = y;
		}
		el('path', { d, class: `curve ${this.f === 'sin' ? 't-y' : this.f === 'cos' ? 't-x' : 't-g'}` }, g);
		el('line', { x1: pl, y1: Y(this.k), x2: GW - pr, y2: Y(this.k), class: 'seg dash' }, g);
		sols.forEach((s, i) => {
			el('circle', { cx: X(s), cy: Y(this.k), r: 5.5, class: 'dot main-dot' }, svg);
			const t = el('text', { x: X(s), y: Y(this.k) + (i % 2 ? 20 : -13), class: 'lbl small l-pt', 'text-anchor': 'middle' }, svg);
			t.textContent = `${fmtTrim(s, 1)}°`;
		});
	}

	private drawCircle() {
		const svg = this.circle;
		clear(svg);
		el('line', { x1: 10, y1: O[1], x2: CW - 10, y2: O[1], class: 'axis' }, svg);
		el('line', { x1: O[0], y1: CH - 10, x2: O[0], y2: 10, class: 'axis' }, svg);
		el('circle', { cx: O[0], cy: O[1], r: R, class: 'ucircle' }, svg);
		const k = this.k;
		if (this.f === 'sin') el('line', { x1: 10, y1: O[1] - k * R, x2: CW - 10, y2: O[1] - k * R, class: 'seg dash t-y' }, svg);
		else if (this.f === 'cos') el('line', { x1: O[0] + k * R, y1: 10, x2: O[0] + k * R, y2: CH - 10, class: 'seg dash t-x' }, svg);
		else {
			el('line', { x1: O[0] + R, y1: 6, x2: O[0] + R, y2: CH - 6, class: 'seg tline' }, svg);
			el('circle', { cx: O[0] + R, cy: O[1] - k * R, r: 4, class: 'dot', style: 'fill:var(--q-g)' }, svg);
			el('line', { x1: O[0] - 2 * R, y1: O[1] + 2 * k * R, x2: O[0] + 2 * R, y2: O[1] - 2 * k * R, class: 'seg dash t-g' }, svg);
		}
		for (const u of solveBasic(this.f, k)) {
			const P = [O[0] + R * cosD(u), O[1] - R * sinD(u)];
			el('line', { x1: O[0], y1: O[1], x2: P[0], y2: P[1], class: 'seg radius' }, svg);
			el('circle', { cx: P[0], cy: P[1], r: 6, class: 'dot main-dot' }, svg);
			const t = el('text', { x: O[0] + (R + 22) * cosD(u), y: O[1] - (R + 22) * sinD(u), class: 'lbl small', 'text-anchor': 'middle', 'dominant-baseline': 'middle' }, svg);
			t.textContent = `${fmtTrim(u, 1)}°`;
		}
	}
}

customElements.define('equation-lab', EquationLab);
