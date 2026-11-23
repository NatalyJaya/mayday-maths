// Valores exactos de las razones de los ángulos notables (múltiplos de 30° y 45°).
import { cosD, referenceAngle, sinD, tanD, type TrigFn } from './trig';

const TABLE: Record<TrigFn, Record<number, string | null>> = {
	sin: { 0: '0', 30: '1/2', 45: '√2/2', 60: '√3/2', 90: '1' },
	cos: { 0: '1', 30: '√3/2', 45: '√2/2', 60: '1/2', 90: '0' },
	tan: { 0: '0', 30: '√3/3', 45: '1', 60: '√3', 90: null },
};

/**
 * Valor exacto («−√3/2», «1/2»…) si el ángulo es notable; null si no lo es.
 * Para la tangente de 90° + 180°·k devuelve «no existe».
 */
export function exactTrig(deg: number, f: TrigFn): string | null {
	if (Math.abs(deg - Math.round(deg)) > 1e-9) return null;
	const d = Math.round(deg);
	if (d % 30 !== 0 && d % 45 !== 0) return null;
	const ref = Math.round(referenceAngle(d));
	const v = TABLE[f][ref];
	if (v === null) return 'no existe';
	if (v === undefined) return null;
	const num = f === 'sin' ? sinD(d) : f === 'cos' ? cosD(d) : tanD(d);
	return num < -1e-12 ? `−${v}` : v;
}
