// De la circunferencia a la gráfica: un punto gira por la circunferencia
// goniométrica y su ALTURA (el seno) se va dibujando a la derecha. Con
// data-fn="cos" se dibuja la abscisa (el coseno).
import { cosD, sinD } from '../lib/math/trig';
import { fmt } from '../lib/format';
import { Clock, clear, el, polyline, prefersReducedMotion } from './core/svg';

const H = 250,
	O = [112, 125] as const,
	R = 86,
	GX0 = 240,
	GX1 = 584;

class CircleWave extends HTMLElement {
	private ang = 0;
	private svg!: SVGSVGElement;
	private clock = new Clock((dt) => this.tick(dt));
	private fn: 'sin' | 'cos' = 'sin';

	connectedCallback() {
		if (this.dataset.ready) return;
		this.dataset.ready = '1';
		this.svg = this.querySelector('svg')!;
		this.fn = this.dataset.fn === 'cos' ? 'cos' : 'sin';
		const range = this.querySelector<HTMLInputElement>('input[type=range]')!;
		const btn = this.querySelector<HTMLButtonElement>('.play-btn')!;
		range.addEventListener('input', () => {
			this.clock.pause();
			btn.dataset.state = 'paused';
			this.ang = Number(range.value);
			this.render();
		});
		btn.addEventListener('click', () => {
			if (this.clock.playing) {
				this.clock.pause();
				btn.dataset.state = 'paused';
			} else {
				if (this.ang >= 360) this.ang = 0;
				this.clock.play();
				btn.dataset.state = 'playing';
			}
		});
		if (prefersReducedMotion()) {
			this.ang = 120;
			btn.dataset.state = 'paused';
		} else {
			// solo se anima cuando está a la vista
			const io = new IntersectionObserver((es) => {
				for (const e of es) {
					if (e.isIntersecting && btn.dataset.state !== 'paused') {
						this.clock.play();
						btn.dataset.state = 'playing';
					} else if (!e.isIntersecting) this.clock.pause();
				}
			});
			io.observe(this);
		}
		this.render();
	}

	private tick(dt: number) {
		this.ang += dt * 60;
		if (this.ang > 360 + 40) this.ang = 0;
		const range = this.querySelector<HTMLInputElement>('input[type=range]')!;
		range.value = String(Math.min(360, this.ang));
		this.render();
	}

	private render() {
		const svg = this.svg;
		clear(svg);
		const a = Math.min(360, this.ang);
		const f = this.fn === 'sin' ? sinD : cosD;
		const X = (d: number) => GX0 + (d / 360) * (GX1 - GX0);
		const Y = (v: number) => O[1] - v * R;
		// ejes
		el('line', { x1: O[0] - R - 16, y1: O[1], x2: O[0] + R + 16, y2: O[1], class: 'axis' }, svg);
		el('line', { x1: O[0], y1: O[1] - R - 16, x2: O[0], y2: O[1] + R + 16, class: 'axis' }, svg);
		el('circle', { cx: O[0], cy: O[1], r: R, class: 'ucircle' }, svg);
		el('line', { x1: GX0, y1: O[1], x2: GX1, y2: O[1], class: 'axis' }, svg);
		for (const d of [90, 180, 270, 360]) {
			el('line', { x1: X(d), y1: Y(1) - 4, x2: X(d), y2: Y(-1) + 4, class: 'grid' }, svg);
			const t = el('text', { x: X(d), y: Y(-1) + 22, class: 'tick', 'text-anchor': 'middle' }, svg);
			t.textContent = `${d}°`;
		}
		for (const v of [1, -1]) {
			el('line', { x1: GX0, y1: Y(v), x2: GX1, y2: Y(v), class: 'grid' }, svg);
			const t = el('text', { x: GX0 - 6, y: Y(v) + 4, class: 'tick', 'text-anchor': 'end' }, svg);
			t.textContent = v === 1 ? '1' : '−1';
		}
		// curva completa en gris y la parte recorrida en color
		const full: [number, number][] = [];
		const done: [number, number][] = [];
		for (let d = 0; d <= 360; d += 2) {
			full.push([X(d), Y(f(d))]);
			if (d <= a) done.push([X(d), Y(f(d))]);
		}
		done.push([X(a), Y(f(a))]);
		el('path', { d: polyline(full), class: 'curve', style: 'stroke:var(--grid);stroke-width:2' }, svg);
		el('path', { d: polyline(done), class: `curve ${this.fn === 'sin' ? 't-y' : 't-x'}` }, svg);
		// punto en la circunferencia y su proyección
		const P = [O[0] + R * cosD(a), O[1] - R * sinD(a)];
		const steps = Math.max(4, Math.ceil(a / 6));
		const arc: [number, number][] = [];
		for (let i = 0; i <= steps; i++) arc.push([O[0] + 22 * cosD((a * i) / steps), O[1] - 22 * sinD((a * i) / steps)]);
		if (a > 1) el('path', { d: polyline(arc), class: 'arc t-g' }, svg);
		el('line', { x1: O[0], y1: O[1], x2: P[0], y2: P[1], class: 'seg radius' }, svg);
		if (this.fn === 'sin') {
			el('line', { x1: P[0], y1: O[1], x2: P[0], y2: P[1], class: 'seg thick t-y' }, svg);
			el('line', { x1: P[0], y1: P[1], x2: X(a), y2: P[1], class: 'seg dash t-v2' }, svg);
			el('line', { x1: X(a), y1: O[1], x2: X(a), y2: P[1], class: 'seg thick t-y' }, svg);
		} else {
			el('line', { x1: O[0], y1: O[1], x2: P[0], y2: O[1], class: 'seg thick t-x' }, svg);
			el('line', { x1: X(a), y1: O[1], x2: X(a), y2: Y(cosD(a)), class: 'seg thick t-x' }, svg);
		}
		el('circle', { cx: P[0], cy: P[1], r: 6, class: 'dot main-dot' }, svg);
		el('circle', { cx: X(a), cy: Y(f(a)), r: 6, class: 'dot main-dot' }, svg);
		const lbl = el('text', { x: O[0], y: H - 8, class: 'lbl small', 'text-anchor': 'middle' }, svg);
		lbl.textContent = `${Math.round(a)}°  →  ${this.fn === 'sin' ? 'sin' : 'cos'} = ${fmt(f(a), 2)}`;
	}
}

customElements.define('circle-wave', CircleWave);
