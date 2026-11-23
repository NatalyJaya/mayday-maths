// Arrastrar dentro de un SVG con ratón, dedo o lápiz, en las coordenadas del
// viewBox. Los eventos se escuchan en el propio <svg> (que no se redibuja),
// así el arrastre no se corta aunque el dibujo se regenere en cada
// movimiento. El SVG también acepta el foco y las flechas del teclado.

export function svgPoint(svg: SVGSVGElement, ev: PointerEvent): [number, number] {
	const m = svg.getScreenCTM();
	if (!m) return [0, 0];
	const p = new DOMPoint(ev.clientX, ev.clientY).matrixTransform(m.inverse());
	return [p.x, p.y];
}

export interface DragOptions {
	/** Al pulsar: decide si empieza el arrastre (y cuál de los puntos se arrastra). Devuelve false para ignorarlo. */
	start?: (x: number, y: number) => boolean;
	move: (x: number, y: number) => void;
	end?: () => void;
	/** Flechas del teclado: desplazamiento (±1, o ±10 con Mayús). */
	key?: (dx: number, dy: number) => void;
}

export function dragArea(svg: SVGSVGElement, o: DragOptions) {
	let active = false;
	svg.addEventListener('pointerdown', (ev) => {
		const [x, y] = svgPoint(svg, ev);
		if (o.start && !o.start(x, y)) return;
		active = true;
		svg.setPointerCapture(ev.pointerId);
		ev.preventDefault();
		o.move(x, y);
	});
	svg.addEventListener('pointermove', (ev) => {
		if (!active) return;
		const [x, y] = svgPoint(svg, ev);
		o.move(x, y);
	});
	const stop = () => {
		if (active) o.end?.();
		active = false;
	};
	svg.addEventListener('pointerup', stop);
	svg.addEventListener('pointercancel', stop);
	if (o.key) {
		svg.setAttribute('tabindex', '0');
		svg.addEventListener('keydown', (ev) => {
			const step = ev.shiftKey ? 10 : 1;
			const map: Record<string, [number, number]> = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, step], ArrowDown: [0, -step] };
			const d = map[ev.key];
			if (d) {
				ev.preventDefault();
				o.key!(d[0], d[1]);
			}
		});
	}
}

/** Lee un parámetro numérico de la URL, dentro de [min, max]. */
export function urlNumber(name: string, fallback: number, min = -Infinity, max = Infinity) {
	const raw = new URLSearchParams(location.search).get(name);
	if (raw === null) return fallback;
	const v = Number(raw.replace(',', '.'));
	return Number.isFinite(v) ? Math.min(max, Math.max(min, v)) : fallback;
}

export const urlString = (name: string) => new URLSearchParams(location.search).get(name);
