// ¿Qué es un radián? El ángulo cuyo arco mide lo mismo que el radio. El arco
// recorrido se «estira» sobre una regla graduada en radios, a la misma escala.
import { cosD, sinD } from '../lib/math/trig';
import { fmt } from '../lib/format';
import { radText } from '../lib/angles';
import { clear, el, polyline } from './core/svg';

const W = 540,
	r = 68,
	O = [W / 2, 104] as const,
	RY = 240,
	RX = 40;

class RadianDemo extends HTMLElement {
	private ang = 57.3;
	private svg!: SVGSVGElement;

	connectedCallback() {
		if (this.dataset.ready) return;
		this.dataset.ready = '1';
		this.svg = this.querySelector('svg')!;
		const range = this.querySelector<HTMLInputElement>('input[type=range]')!;
		range.addEventListener('input', () => {
			this.ang = Number(range.value);
			this.render();
		});
		this.querySelectorAll<HTMLButtonElement>('[data-go]').forEach((b) =>
			b.addEventListener('click', () => {
				this.ang = Number(b.dataset.go);
				range.value = b.dataset.go!;
				this.render();
			}),
		);
		this.render();
	}

	private render() {
		const svg = this.svg;
		clear(svg);
		const a = this.ang;
		const rad = (a * Math.PI) / 180;
		const t = (x: number, y: number, s: string, cls: string, anchor = 'middle') => {
			const e = el('text', { x, y, class: `lbl ${cls}`, 'text-anchor': anchor, 'dominant-baseline': 'middle' }, svg);
			e.textContent = s;
		};
		el('circle', { cx: O[0], cy: O[1], r, class: 'ucircle' }, svg);
		// marcas de 1, 2, 3… radianes sobre la circunferencia
		for (let k = 1; k <= 6; k++) {
			const d = (k * 180) / Math.PI;
			el('line', { x1: O[0] + (r - 5) * cosD(d), y1: O[1] - (r - 5) * sinD(d), x2: O[0] + (r + 5) * cosD(d), y2: O[1] - (r + 5) * sinD(d), class: 'seg' }, svg);
			t(O[0] + (r + 15) * cosD(d), O[1] - (r + 15) * sinD(d), String(k), 'tick');
		}
		const pts: [number, number][] = [];
		for (let i = 0; i <= 90; i++) pts.push([O[0] + r * cosD((a * i) / 90), O[1] - r * sinD((a * i) / 90)]);
		if (a > 0) el('path', { d: polyline(pts), class: 'seg thick t-y' }, svg);
		el('line', { x1: O[0], y1: O[1], x2: O[0] + r, y2: O[1], class: 'seg radius' }, svg);
		el('line', { x1: O[0], y1: O[1], x2: O[0] + r * cosD(a), y2: O[1] - r * sinD(a), class: 'seg radius' }, svg);
		t(O[0] + r / 2, O[1] + 12, 'r', 'small');
		const pa: [number, number][] = [];
		for (let i = 0; i <= 30; i++) pa.push([O[0] + 18 * cosD((a * i) / 30), O[1] - 18 * sinD((a * i) / 30)]);
		if (a > 0) el('path', { d: polyline(pa), class: 'arc t-g' }, svg);
		// regla: el arco estirado, a la misma escala que el radio
		el('line', { x1: RX, y1: RY, x2: RX + 2 * Math.PI * r, y2: RY, class: 'axis' }, svg);
		for (let k = 0; k <= 6; k++) {
			el('line', { x1: RX + k * r, y1: RY - 7, x2: RX + k * r, y2: RY + 7, class: 'seg' }, svg);
			t(RX + k * r, RY + 20, `${k}r`, 'tick');
		}
		for (const [m, s] of [
			[Math.PI, 'π·r'],
			[2 * Math.PI, '2π·r'],
		] as const) {
			el('line', { x1: RX + m * r, y1: RY - 16, x2: RX + m * r, y2: RY + 4, class: 'seg t-g' }, svg);
			t(RX + m * r, RY - 24, s, 'l-g small');
		}
		el('line', { x1: RX, y1: RY, x2: RX + rad * r, y2: RY, class: 'seg thick t-y' }, svg);
		t(RX, RY - 40, `Arco = ${fmt(rad, 2)} radios`, 'l-y', 'start');
		const out = (k: string, s: string) => (this.querySelector(`[data-out="${k}"]`)!.textContent = s);
		out('deg', `${fmt(a, 1)}°`);
		out('rad', radText(a));
		out('dec', `${fmt(rad, 3)} rad`);
	}
}

customElements.define('radian-demo', RadianDemo);
