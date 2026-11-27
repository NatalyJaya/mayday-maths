// Laboratorio de la circunferencia goniométrica: arrastra el punto P y mira
// a la vez sus coordenadas (cos, sen), la tangente y las tres gráficas con un
// cursor común. Acepta ?ang=150 en la URL.
import { cosD, normalize, quadrant, referenceAngle, sinD, tanD } from '../lib/math/trig';
import { exactTrig } from '../lib/math/exact';
import { fmt } from '../lib/format';
import { degText, radText } from '../lib/angles';
import { clear, el, polyline } from './core/svg';
import { dragArea, urlNumber } from './core/drag';

const R = 128,
	CW = 380,
	CH = 380;
const O = [CW / 2, CH / 2] as const;

const signText = (v: number) => (Math.abs(v) < 1e-12 ? '0' : v > 0 ? '+' : '−');

class UnitCircleLab extends HTMLElement {
	private ang = 30;
	private circle!: SVGSVGElement;
	private graph!: SVGSVGElement;
	private snap = true;
	private showTan = false;
	private uid = `uc-${Math.random().toString(36).slice(2, 8)}`;

	connectedCallback() {
		if (this.dataset.ready) return;
		this.dataset.ready = '1';
		[this.circle, this.graph] = [...this.querySelectorAll('svg')] as SVGSVGElement[];
		this.ang = Number(this.dataset.angle ?? this.ang);
		if (this.hasAttribute('data-url')) this.ang = urlNumber('ang', this.ang, -720, 720);
		this.showTan = this.hasAttribute('data-tan');
		const num = this.querySelector<HTMLInputElement>('input[type=number]')!;
		const range = this.querySelector<HTMLInputElement>('input[type=range]')!;
		num.addEventListener('input', () => {
			const v = Number(num.value);
			if (Number.isFinite(v)) this.set(v, 'num');
		});
		range.addEventListener('input', () => this.set(Number(range.value), 'range'));
		this.querySelector<HTMLInputElement>('[data-k=snap]')?.addEventListener('change', (e) => {
			this.snap = (e.target as HTMLInputElement).checked;
		});
		const tanBox = this.querySelector<HTMLInputElement>('[data-k=tan]');
		if (tanBox) {
			tanBox.checked = this.showTan;
			tanBox.addEventListener('change', () => {
				this.showTan = tanBox.checked;
				this.render();
			});
		}
		this.querySelectorAll<HTMLButtonElement>('[data-go]').forEach((b) => b.addEventListener('click', () => this.set(Number(b.dataset.go), 'btn')));
		dragArea(this.circle, {
			move: (x, y) => {
				let d = (Math.atan2(O[1] - y, x - O[0]) * 180) / Math.PI;
				if (d < 0) d += 360;
				if (this.snap) {
					const notable = [0, 30, 45, 60, 90, 120, 135, 150, 180, 210, 225, 240, 270, 300, 315, 330, 360];
					const near = notable.find((n) => Math.abs(n - d) < 3);
					d = near !== undefined ? near % 360 : Math.round(d);
				}
				this.set(d, 'drag');
			},
			key: (dx, dy) => this.set(normalize(this.ang + (dx || dy)), 'key'),
		});
		this.set(this.ang, 'init');
	}

	private set(v: number, from: string) {
		this.ang = v;
		const num = this.querySelector<HTMLInputElement>('input[type=number]')!;
		const range = this.querySelector<HTMLInputElement>('input[type=range]')!;
		if (from !== 'num') num.value = String(Math.round(v * 10) / 10);
		if (from !== 'range') range.value = String(normalize(v));
		this.render();
	}

	private render() {
		this.drawCircle();
		this.drawGraph();
		this.readout();
	}

	private drawCircle() {
		const svg = this.circle;
		clear(svg);
		const a = this.ang;
		const P = [O[0] + R * cosD(a), O[1] - R * sinD(a)];
		// cuadrante sombreado
		const q = quadrant(a);
		if (q) {
			const s = (q - 1) * 90;
			const p1 = [O[0] + R * cosD(s), O[1] - R * sinD(s)],
				p2 = [O[0] + R * cosD(s + 90), O[1] - R * sinD(s + 90)];
			el('path', { d: `M${O[0]} ${O[1]}L${p1[0]} ${p1[1]}A${R} ${R} 0 0 0 ${p2[0]} ${p2[1]}Z`, class: 'fill-soft' }, svg);
		}
		el('line', { x1: 14, y1: O[1], x2: CW - 14, y2: O[1], class: 'axis' }, svg);
		el('line', { x1: O[0], y1: CH - 14, x2: O[0], y2: 14, class: 'axis' }, svg);
		el('circle', { cx: O[0], cy: O[1], r: R, class: 'ucircle' }, svg);
		const lbl = (x: number, y: number, t: string, cls = '', anchor = 'middle') => {
			const e = el('text', { x, y, class: `lbl ${cls}`, 'text-anchor': anchor, 'dominant-baseline': 'middle' }, svg);
			e.textContent = t;
			return e;
		};
		lbl(O[0] + R + 8, O[1] + 13, '1', 'tick', 'start');
		lbl(O[0] - R - 8, O[1] + 13, '−1', 'tick', 'end');
		lbl(O[0] - 7, O[1] - R - 9, '1', 'tick', 'end');
		lbl(O[0] - 7, O[1] + R + 11, '−1', 'tick', 'end');
		for (const [qx, qy, t] of [
			[1, -1, 'I'],
			[-1, -1, 'II'],
			[-1, 1, 'III'],
			[1, 1, 'IV'],
		] as const)
			lbl(O[0] + qx * R * 1.08, O[1] + qy * R * 1.08, t, 'quad');
		// tangente
		if (this.showTan && Math.abs(cosD(a)) > 0.02) {
			const t = tanD(a);
			const ty = O[1] - R * Math.max(-1.35, Math.min(1.35, t));
			el('line', { x1: O[0] + R, y1: 10, x2: O[0] + R, y2: CH - 10, class: 'seg tline' }, svg);
			el('line', { x1: O[0], y1: O[1], x2: O[0] + R, y2: O[1] - R * t, class: 'seg dash t-v2' }, svg);
			el('line', { x1: O[0] + R, y1: O[1], x2: O[0] + R, y2: ty, class: 'seg thick t-g' }, svg);
			lbl(O[0] + R + 9, (O[1] + ty) / 2, 'tan', 'l-g', 'start');
		}
		// proyecciones
		el('line', { x1: O[0], y1: P[1], x2: P[0], y2: P[1], class: 'seg dash t-v2' }, svg);
		el('line', { x1: P[0], y1: O[1], x2: P[0], y2: P[1], class: 'seg thick t-y' }, svg);
		el('line', { x1: O[0], y1: O[1], x2: P[0], y2: O[1], class: 'seg thick t-x' }, svg);
		el('line', { x1: O[0], y1: O[1], x2: P[0], y2: P[1], class: 'seg radius' }, svg);
		lbl((O[0] + P[0]) / 2, O[1] + (sinD(a) >= 0 ? 15 : -14), 'cos', 'l-x');
		lbl(P[0] + (cosD(a) >= 0 ? -8 : 8), (O[1] + P[1]) / 2, 'sin', 'l-y', cosD(a) >= 0 ? 'end' : 'start');
		// arco del ángulo (se puede dar más de una vuelta)
		const steps = Math.max(8, Math.ceil(Math.abs(a) / 5));
		const pts: [number, number][] = [];
		for (let i = 0; i <= steps; i++) {
			const t = (a * i) / steps;
			const r = 24 + (Math.abs(t) / 360) * 7;
			pts.push([O[0] + r * cosD(t), O[1] - r * sinD(t)]);
		}
		if (Math.abs(a) > 0.5) el('path', { d: polyline(pts), class: 'arc t-g' }, svg);
		const mid = a / 2;
		lbl(O[0] + 46 * cosD(mid), O[1] - 46 * sinD(mid), degText(a, 1), 'l-ang small');
		// punto arrastrable
		el('circle', { cx: P[0], cy: P[1], r: 16, class: 'handle-ring' }, svg);
		el('circle', { cx: P[0], cy: P[1], r: 9, class: 'handle' }, svg);
		lbl(P[0] + 18 * cosD(a), P[1] - 18 * sinD(a) - 4, 'P', 'vname', cosD(a) >= 0 ? 'start' : 'end');
		svg.setAttribute('aria-valuetext', `Angle ${degText(a)}`);
	}

	private drawGraph() {
		const svg = this.graph;
		clear(svg);
		const W = 440,
			H = 300,
			pl = 36,
			pr = 12,
			pt = 14,
			pb = 28;
		const yr = this.showTan ? 2.2 : 1.3;
		const X = (x: number) => pl + (x / 360) * (W - pl - pr);
		const Y = (y: number) => pt + ((yr - y) / (2 * yr)) * (H - pt - pb);
		for (let x = 0; x <= 360; x += 90) {
			el('line', { x1: X(x), y1: pt, x2: X(x), y2: H - pb, class: 'grid' }, svg);
			const t = el('text', { x: X(x), y: H - 9, class: 'tick', 'text-anchor': 'middle' }, svg);
			t.textContent = `${x}°`;
		}
		for (const y of this.showTan ? [-2, -1, 1, 2] : [-1, 1]) {
			el('line', { x1: pl, y1: Y(y), x2: W - pr, y2: Y(y), class: 'grid' }, svg);
			const t = el('text', { x: pl - 6, y: Y(y) + 4, class: 'tick', 'text-anchor': 'end' }, svg);
			t.textContent = String(y).replace('-', '−');
		}
		el('line', { x1: pl, y1: Y(0), x2: W - pr, y2: Y(0), class: 'axis' }, svg);
		const clip = el('clipPath', { id: `${this.uid}-clip` }, svg);
		el('rect', { x: pl, y: pt, width: W - pl - pr, height: H - pt - pb }, clip);
		const g = el('g', { 'clip-path': `url(#${this.uid}-clip)` }, svg);
		const curve = (f: (d: number) => number, cls: string) => {
			let d = '';
			let pen = false;
			for (let x = 0; x <= 360; x += 1) {
				const y = f(x);
				if (!Number.isFinite(y) || Math.abs(y) > yr * 1.5) {
					pen = false;
					continue;
				}
				d += `${pen ? 'L' : 'M'}${X(x).toFixed(1)} ${Y(y).toFixed(1)}`;
				pen = true;
			}
			el('path', { d, class: `curve ${cls}` }, g);
		};
		curve(cosD, 't-x');
		curve(sinD, 't-y');
		if (this.showTan) {
			curve(tanD, 't-g');
			for (const xa of [90, 270]) el('line', { x1: X(xa), y1: pt, x2: X(xa), y2: H - pb, class: 'asym' }, g);
		}
		const a = normalize(this.ang);
		el('line', { x1: X(a), y1: pt, x2: X(a), y2: H - pb, class: 'cursor' }, svg);
		el('circle', { cx: X(a), cy: Y(cosD(a)), r: 5, class: 'dot', style: 'fill:var(--q-x)' }, svg);
		el('circle', { cx: X(a), cy: Y(sinD(a)), r: 5, class: 'dot', style: 'fill:var(--q-y)' }, svg);
		if (this.showTan && Math.abs(cosD(a)) > 0.02 && Math.abs(tanD(a)) < yr) el('circle', { cx: X(a), cy: Y(tanD(a)), r: 5, class: 'dot', style: 'fill:var(--q-g)' }, svg);
	}

	private readout() {
		const a = this.ang;
		const out = (k: string, s: string) => {
			const e = this.querySelector(`[data-out="${k}"]`);
			if (e) e.textContent = s;
		};
		const val = (f: 'sin' | 'cos' | 'tan') => {
			const ex = exactTrig(a, f);
			const v = f === 'sin' ? sinD(a) : f === 'cos' ? cosD(a) : tanD(a);
			if (ex === 'no existeix') return 'no existeix';
			const num = fmt(v, 4);
			return ex && ex !== num.replace(/,?0+$/, '') ? `${ex} ≈ ${num}` : num;
		};
		const q = quadrant(a);
		out('ang', degText(a, 1));
		out('rad', radText(a));
		out('quad', q ? `quadrant ${['I', 'II', 'III', 'IV'][q - 1]}` : 'sobre un eix');
		out('ref', degText(referenceAngle(a), 1));
		out('cos', val('cos'));
		out('sin', val('sin'));
		out('tan', val('tan'));
		out('signs', `cos ${signText(cosD(a))} · sin ${signText(sinD(a))} · tan ${Math.abs(cosD(a)) < 1e-12 ? '∄' : signText(tanD(a))}`);
		out('check', fmt(sinD(a) ** 2 + cosD(a) ** 2, 4));
	}
}

customElements.define('unit-circle-lab', UnitCircleLab);
