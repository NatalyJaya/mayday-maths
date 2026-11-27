import { describe, expect, it } from 'vitest';
import { checkNumeric, checkSet, parseList } from './answers';

const spec = (valor: number, trampas: { valor: number; html: string }[] = []) => ({
	valor,
	tolerancia: 0.02,
	tolerancia_abs: 0.01,
	trampas,
});

describe('checkNumeric', () => {
	it('acepta redondeos razonables y coma decimal', () => {
		expect(checkNumeric('2,02', spec(2.0203)).status).toBe('correct');
		expect(checkNumeric('2', spec(2.0203)).status).toBe('correct');
		expect(checkNumeric('30', spec(30.3)).status).toBe('correct');
	});
	it('detecta un signo cambiado', () => {
		expect(checkNumeric('19,8', spec(-19.8)).status).toBe('sign');
	});
	it('las trampas tienen prioridad y devuelven su explicación', () => {
		const r = checkNumeric('-5,67', spec(6.51, [{ valor: -5.67, html: 'radianes' }]));
		expect(r).toEqual({ status: 'trap', html: 'radianes' });
	});
	it('distingue «cerca» de «mal»', () => {
		expect(checkNumeric('7,0', spec(7.26)).status).toBe('close');
		expect(checkNumeric('3', spec(7.26)).status).toBe('wrong');
	});
	it('usa la tolerancia absoluta cuando el valor correcto es 0', () => {
		expect(checkNumeric('0', spec(0)).status).toBe('correct');
		expect(checkNumeric('0,005', spec(0)).status).toBe('correct');
	});
	it('entrada vacía o no numérica', () => {
		expect(checkNumeric('', spec(1)).status).toBe('empty');
		expect(checkNumeric('2 m/s', spec(2)).status).toBe('invalid');
	});
});

describe('conjuntos de soluciones', () => {
	const spec = { valores: [30, 150], tolerancia: 0.1, unidad: '°', trampas: [] as { valores: number[]; html: string }[] };
	it('lee listas con punto y coma, coma + espacio o espacios', () => {
		expect(parseList('30; 150')).toEqual([30, 150]);
		expect(parseList('x = 30°, 150°')).toEqual([30, 150]);
		expect(parseList('63,43; 243,43')).toEqual([63.43, 243.43]);
		expect(parseList('30 150')).toEqual([30, 150]);
		expect(parseList('30 y 150')).toEqual([30, 150]);
		expect(parseList('treinta')).toBeNull();
	});
	it('acepta cualquier orden', () => {
		expect(checkSet('150; 30', spec).status).toBe('correct');
	});
	it('detecta soluciones que faltan y que sobran', () => {
		expect(checkSet('30', spec)).toMatchObject({ status: 'missing', missing: 1 });
		expect(checkSet('30; 150; 210', spec)).toMatchObject({ status: 'extra', extra: [210] });
		expect(checkSet('30; 210', spec)).toMatchObject({ status: 'mixed', missing: 1 });
		expect(checkSet('30; 30,05', spec).status).toBe('repeated');
	});
	it('detecta la calculadora en radianes y las trampas', () => {
		expect(checkSet('0,52; 2,62', spec).status).toBe('radians');
		const withTrap = { ...spec, trampas: [{ valores: [30, 330], html: 'cos' }] };
		expect(checkSet('30; 330', withTrap)).toMatchObject({ status: 'trap', html: 'cos' });
	});
});

describe('llistes en català', () => {
	it('accepta «i» com a separador', () => {
		expect(parseList('30 i 150')).toEqual([30, 150]);
	});
});
