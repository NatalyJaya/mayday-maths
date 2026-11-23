// Formato de ángulos para la interfaz: grados y radianes «bonitos».
import { fmtTrim } from './format';

const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : a);

/** Radianes como fracción de π cuando el ángulo es múltiplo de 15° (90° → «π/2»); si no, decimal. */
export function radText(deg: number) {
	const r = Math.round(deg * 1000) / 1000;
	if (Math.abs(r - Math.round(r)) < 1e-9 && Math.round(r) % 15 === 0) {
		const d = Math.round(r);
		if (d === 0) return '0 rad';
		const sign = d < 0 ? '−' : '';
		const a = Math.abs(d);
		const g = gcd(a, 180);
		const num = a / g,
			den = 180 / g;
		return `${sign}${num === 1 ? '' : num}π${den === 1 ? '' : `/${den}`} rad`;
	}
	return `${fmtTrim((deg * Math.PI) / 180, 3).replace('-', '−')} rad`;
}

export const degText = (deg: number, dec = 1) => `${fmtTrim(deg, dec).replace('-', '−')}°`;
