// Angles relacionats: α y el ángulo simétrico (180° − α, 180° + α, −α o
// 90° − α) tienen las mismas razones salvo el signo (o intercambiadas).
import { cosD, normalize, sinD } from '../lib/math/trig';
import { fmt } from '../lib/format';
import { clear, el, setOut } from './core/svg';

const W = 380,
	H = 360,
	O = [W / 2, H / 2] as const,
	R = 130;

type Rel = 'sup' | 'pi' | 'neg' | 'comp';
const RELS: Record<Rel, { ang: (a: number) => number; name: string; axis: string; rule: string }> = {
	sup: { ang: (a) => 180 - a, name: '180° − α', axis: 'Simetria respecte de l’eix Y', rule: 'sin(180° − α) = sin α · cos(180° − α) = −cos α · tan(180° − α) = −tan α' },
	pi: { ang: (a) => 180 + a, name: '180° + α', axis: 'Simetria respecte de l’origen', rule: 'sin(180° + α) = −sin α · cos(180° + α) = −cos α · tan(180° + α) = tan α' },
	neg: { ang: (a) => 360 - a, name: '360° − α (= −α)', axis: 'Simetria respecte de l’eix X', rule: 'sin(−α) = −sin α · cos(−α) = cos α · tan(−α) = −tan α' },
	comp: { ang: (a) => 90 - a, name: '90° − α', axis: 'Simetria respecte de la recta y = x', rule: 'sin(90° − α) = cos α · cos(90° − α) = sin α: s’intercanvien' },
};

class SymmetryExplorer extends HTMLElement {
	private a = 30;
	private rel: Rel = 'sup';
	private svg!: SVGSVGElement;

	connectedCallback() {
		if (this.dataset.ready) return;
		this.dataset.ready = '1';
		this.svg = this.querySelector('svg')!;
		this.rel = (this.dataset.rel as Rel) ?? 'sup';
		this.querySelector<HTMLInputElement>('input[type=range]')!.addEventListener('input', (e) => {
			this.a = Number((e.target as HTMLInputElement).value);
			this.render();
		});
		this.querySelectorAll<HTMLInputElement>('input[type=radio]').forEach((r) => {
			r.checked = r.value === this.rel;
			r.addEventListener('change', () => {
				this.rel = r.value as Rel;
				this.render();
			});
		});
		this.render();
	}

	private point(deg: number, main: boolean) {
		const svg = this.svg;
		const P = [O[0] + R * cosD(deg), O[1] - R * sinD(deg)];
		el('line', { x1: P[0], y1: O[1], x2: P[0], y2: P[1], class: `seg ${main ? 'thick' : ''} t-y` }, svg);
		el('line', { x1: O[0], y1: O[1], x2: P[0], y2: O[1], class: `seg ${main ? 'thick' : ''} t-x` }, svg);
		el('line', { x1: O[0], y1: O[1], x2: P[0], y2: P[1], class: main ? 'seg radius' : 'seg radius dash' }, svg);
		el('circle', { cx: P[0], cy: P[1], r: 6, class: main ? 'dot main-dot' : 'dot', style: main ? '' : 'fill:var(--q-g)' }, svg);
		const t = el('text', { x: O[0] + (R + 22) * cosD(deg), y: O[1] - (R + 22) * sinD(deg), class: `lbl ${main ? 'l-ang' : 'l-g'}`, 'text-anchor': 'middle', 'dominant-baseline': 'middle' }, svg);
		t.textContent = main ? 'α' : RELS[this.rel].name.split(' (')[0];
	}

	private render() {
		const svg = this.svg;
		clear(svg);
		const rel = RELS[this.rel];
		const b = rel.ang(this.a);
		el('line', { x1: 12, y1: O[1], x2: W - 12, y2: O[1], class: 'axis' }, svg);
		el('line', { x1: O[0], y1: H - 12, x2: O[0], y2: 12, class: 'axis' }, svg);
		el('circle', { cx: O[0], cy: O[1], r: R, class: 'ucircle' }, svg);
		// eje de simetría
		const ax = { sup: [O[0], 10, O[0], H - 10], pi: null, neg: [10, O[1], W - 10, O[1]], comp: [O[0] - R - 10, O[1] + R + 10, O[0] + R + 10, O[1] - R - 10] }[this.rel];
		if (ax) el('line', { x1: ax[0], y1: ax[1], x2: ax[2], y2: ax[3], class: 'seg dash t-g' }, svg);
		else el('circle', { cx: O[0], cy: O[1], r: 7, class: 'dot', style: 'fill:var(--q-g)' }, svg);
		this.point(b, false);
		this.point(this.a, true);
		const out = (k: string, s: string) => setOut(this, k, s);
		out('a', `${this.a}°`);
		out('b', `${fmt(normalize(b), 0)}°`);
		out('name', rel.name);
		out('axis', rel.axis);
		out('rule', rel.rule);
		out('ca', fmt(cosD(this.a), 4));
		out('sa', fmt(sinD(this.a), 4));
		out('cb', fmt(cosD(b), 4));
		out('sb', fmt(sinD(b), 4));
	}
}

customElements.define('symmetry-explorer', SymmetryExplorer);
