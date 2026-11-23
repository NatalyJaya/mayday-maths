import { describe, expect, it } from 'vitest';
import {
	areaSAS,
	cosD,
	doubleObservation,
	findRoots,
	heron,
	normalize,
	quadrant,
	referenceAngle,
	sinD,
	solveAAS,
	solveBasic,
	solveCompound,
	solveSAS,
	solveSSA,
	solveSSS,
	tanD,
} from './trig';

const close = (a: number[], b: number[], d = 6) => {
	expect(a.length).toBe(b.length);
	a.forEach((x, i) => expect(x).toBeCloseTo(b[i], d));
};

describe('razones en grados', () => {
	it('valores notables', () => {
		expect(sinD(30)).toBeCloseTo(0.5, 12);
		expect(cosD(60)).toBeCloseTo(0.5, 12);
		expect(tanD(45)).toBeCloseTo(1, 12);
		expect(cosD(90)).toBe(0);
		expect(sinD(180)).toBe(0);
		expect(Number.isNaN(tanD(90))).toBe(true);
	});
	it('identidad fundamental para cualquier ángulo', () => {
		for (const a of [-200, -30, 0, 17, 90, 123.4, 271, 359.9]) expect(sinD(a) ** 2 + cosD(a) ** 2).toBeCloseTo(1, 12);
	});
	it('normaliza, cuadrantes y ángulo de referencia', () => {
		expect(normalize(-30)).toBe(330);
		expect(normalize(750)).toBe(30);
		expect(quadrant(135)).toBe(2);
		expect(quadrant(200)).toBe(3);
		expect(quadrant(-10)).toBe(4);
		expect(quadrant(180)).toBe(0);
		expect(referenceAngle(150)).toBe(30);
		expect(referenceAngle(225)).toBe(45);
		expect(referenceAngle(300)).toBe(60);
	});
});

describe('ecuaciones', () => {
	it('sen x = k', () => {
		close(solveBasic('sin', 0.5), [30, 150]);
		close(solveBasic('sin', -1), [270]);
		close(solveBasic('sin', 0), [0, 180]);
		expect(solveBasic('sin', 2)).toEqual([]);
	});
	it('cos x = k y tg x = k', () => {
		close(solveBasic('cos', -0.5), [120, 240]);
		close(solveBasic('cos', 1), [0]);
		close(solveBasic('tan', 1), [45, 225]);
		close(solveBasic('tan', -Math.sqrt(3) / 3), [150, 330]);
	});
	it('ángulo compuesto: sen 2x = 1/2 tiene cuatro soluciones', () => {
		close(solveCompound('sin', 0.5, 2), [15, 75, 195, 255]);
		close(solveCompound('cos', 0.5, 2), [30, 150, 210, 330]);
	});
	it('findRoots encuentra raíces simples y dobles y descarta asíntotas', () => {
		close(findRoots((x) => sinD(x) - 0.5), [30, 150], 4);
		close(findRoots((x) => sinD(x) + 1), [270], 3);
		close(findRoots((x) => tanD(x)), [0, 180], 4);
		close(findRoots((x) => sinD(x) - tanD(x)), [0, 180], 3);
	});
});

describe('triángulos', () => {
	it('LLL: triángulo 3-4-5 es rectángulo', () => {
		const t = solveSSS(3, 4, 5)!;
		expect(t.C).toBeCloseTo(90, 9);
		expect(solveSSS(1, 2, 3)).toBeNull();
	});
	it('LAL y AAL coinciden con LLL', () => {
		const t = solveSAS(7, 5, 60);
		expect(t.a).toBeCloseTo(Math.sqrt(39), 9);
		const u = solveAAS(10, 40, 60)!;
		expect(u.C).toBe(80);
		expect(u.b / sinD(u.B)).toBeCloseTo(10 / sinD(40), 9);
	});
	it('LLA: caso ambiguo', () => {
		expect(solveSSA(4, 10, 30).length).toBe(0); // a < b·sen A
		expect(solveSSA(5, 10, 30).length).toBe(1); // a = b·sen A: rectángulo
		expect(solveSSA(7, 10, 30).length).toBe(2); // b·sen A < a < b
		expect(solveSSA(12, 10, 30).length).toBe(1); // a ≥ b
	});
	it('áreas', () => {
		expect(heron(3, 4, 5)).toBeCloseTo(6, 12);
		expect(areaSAS(4, 3, 90)).toBeCloseTo(6, 12);
	});
	it('doble observación', () => {
		const { h, x } = doubleObservation(30, 60, 100);
		expect(x).toBeCloseTo(50, 9);
		expect(h).toBeCloseTo(50 * Math.sqrt(3), 9);
	});
});

import { exactTrig } from './exact';
describe('valores exactos', () => {
	it('signo según el cuadrante', () => {
		expect(exactTrig(150, 'sin')).toBe('1/2');
		expect(exactTrig(150, 'cos')).toBe('−√3/2');
		expect(exactTrig(225, 'tan')).toBe('1');
		expect(exactTrig(300, 'sin')).toBe('−√3/2');
		expect(exactTrig(270, 'tan')).toBe('no existe');
		expect(exactTrig(180, 'cos')).toBe('−1');
		expect(exactTrig(20, 'sin')).toBeNull();
	});
});
