// Soluciones calculadas con el modelo matemático, de forma independiente a
// los YAML. tests/content.test.ts las compara con lo que dice cada ejercicio.
//
//  · expectedNumeric: para cada ejercicio con respuestas numéricas, los
//    valores de todos sus campos en orden (apartado por apartado).
//  · equations: para cada respuesta de tipo «conjunto», la ecuación escrita
//    como f(x) = 0 (x en grados). El test busca TODAS sus raíces en
//    [0°, 360°) y comprueba que coinciden con las del YAML. Donde la ecuación
//    no está definida (un denominador nulo, la tangente en 90°…), f devuelve
//    NaN o ±Infinity y esos puntos no cuentan como raíces.
import { areaSAS, cosD, doubleObservation, sinD, solveAAS, solveSAS, solveSSA, solveSSS, tanD } from '../src/lib/math/trig';

const s = sinD,
	c = cosD,
	t = tanD;
const d = Math.PI / 180;

const rt = 'razones-trigonometricas';
const tr = 'resolucion-triangulos';
const ie = 'identidades-ecuaciones';
const deg = (r: number) => r / d;

export const expectedNumeric: Record<string, number[]> = {
	// ─── Ángulos y razones trigonométricas ───
	[`${rt}/ejemplo-una-razon`]: (() => {
		const cos = -Math.sqrt(1 - 0.36);
		return [cos, 0.6 / cos];
	})(),
	[`${rt}/ejemplo-reduccion`]: [s(240), c(315), t(870)],
	[`${rt}/ejemplo-altura-edificio`]: [40 * t(32) + 1.6],
	[`${rt}/grados-radianes`]: [135 * d, (5 * Math.PI) / 6 / d, deg(2)],
	[`${rt}/triangulo-8-15-17`]: [8 / 17, 15 / 17, 8 / 15, deg(Math.atan(8 / 15))],
	[`${rt}/rampa-pendiente`]: [12, deg(Math.atan(0.12))],
	[`${rt}/grados-minutos`]: [47, Math.floor(0.36 * 60), Math.round(((0.36 * 60) % 1) * 60)],
	[`${rt}/una-razon-tangente`]: (() => {
		const a = Math.atan(-2); // cuarto cuadrante
		return [Math.cos(a), Math.sin(a)];
	})(),
	[`${rt}/reduccion-tres`]: [s(330), c(-120), t(225)],
	[`${rt}/escalera`]: [6 * s(70), 6 * c(70)],
	[`${rt}/rueda-arco`]: [2.5 * 30, deg(2.5)],
	[`${rt}/sombra-sol`]: (() => {
		const a = deg(Math.atan(5 / 7.2));
		return [a, 7.2 - 5 / t(a + 10)];
	})(),
	[`${rt}/tangente-signo-suma`]: (() => {
		const a = 180 + deg(Math.atan(3 / 4)); // tercer cuadrante
		return [s(a) + c(a)];
	})(),
	[`${rt}/examen-complementarios`]: [s(155), c(65), c(115), s(205)],
	[`${rt}/examen-noria`]: [20 + 18 * s(210)],
	// ─── Resolución de triángulos ───
	[`${tr}/ejemplo-doble-observacion`]: [doubleObservation(30, 45, 50).h],
	[`${tr}/ejemplo-faros`]: (() => {
		const t = solveAAS(10, 57, 71)!; // lado AB = 10 frente a S = 57°
		return [t.b, (10 * s(52)) / s(57)];
	})(),
	[`${tr}/ejemplo-tunel`]: (() => {
		// lados que forman el ángulo de 68°: CB = 450 y CA = 380. El ángulo en A
		// (extremo del túnel) es el opuesto a CB = 450, que aquí es el «b» de solveSAS.
		const x = solveSAS(450, 380, 68);
		return [x.a, x.B];
	})(),
	[`${tr}/rectangulo-hipotenusa`]: [55, 12 * s(35), 12 * c(35)],
	[`${tr}/rectangulo-catetos`]: (() => {
		const t = solveSSS(7, 24, 25)!;
		return [25, t.A, t.B];
	})(),
	[`${tr}/faro-depresion`]: [45 / t(12)],
	[`${tr}/seno-aal`]: (() => {
		const x = solveAAS(10, 40, 65)!;
		return [x.C, x.b, x.c];
	})(),
	[`${tr}/coseno-lal`]: [solveSAS(8, 5, 60).a],
	[`${tr}/coseno-lll`]: (() => {
		const x = solveSSS(4, 5, 6)!;
		return [x.A, x.B, x.C];
	})(),
	[`${tr}/area-parcela`]: [areaSAS(40, 55, 72), solveSAS(40, 55, 72).a],
	[`${tr}/ambiguo-dos`]: (() => {
		const sols = solveSSA(7, 10, 30).sort((p, q) => p.B - q.B);
		return [sols[0].c, sols[1].c];
	})(),
	[`${tr}/anchura-rio`]: (() => {
		const at = (60 * s(70)) / s(60);
		return [at, at * s(50)];
	})(),
	[`${tr}/doble-observacion-montana`]: [doubleObservation(25, 38, 800).h],
	[`${tr}/paralelogramo`]: [solveSAS(6, 9, 50).a, solveSAS(6, 9, 130).a],
	[`${tr}/examen-dos-barcos`]: (() => {
		const x = solveSAS(36, 48, 75); // b = PA, c = PB, ángulo en P
		return [x.a, x.C]; // ángulo en A: opuesto a PB (= c)
	})(),
	[`${tr}/examen-terreno`]: (() => {
		const ac = solveSAS(50, 40, 110).a;
		return [ac, areaSAS(50, 40, 110) + areaSAS(ac, 45, 35), solveSAS(ac, 45, 35).a];
	})(),
	// ─── Identidades y ecuaciones ───
	[`${ie}/ejemplo-valor-exacto`]: [c(45 - 30), t(15)],
	[`${ie}/exacto-75`]: [c(45) * c(30) - s(45) * s(30), (t(45) + t(30)) / (1 - t(45) * t(30))],
	[`${ie}/doble-con-datos`]: (() => {
		const a = deg(Math.asin(0.8));
		return [s(2 * a), c(2 * a), t(2 * a)];
	})(),
	[`${ie}/angulo-mitad`]: (() => {
		const a = 180 + deg(Math.acos(7 / 25)); // tercer cuadrante con cos = −7/25
		return [s(a / 2), c(a / 2)];
	})(),
	[`${ie}/suma-con-datos`]: (() => {
		const a = 180 - deg(Math.asin(3 / 5)); // II cuadrante
		const b = 360 - deg(Math.acos(5 / 13)); // IV cuadrante
		return [s(a + b), c(a - b)];
	})(),
	[`${ie}/examen-tangente-suma`]: [t(deg(Math.atan(1 / 2)) + deg(Math.atan(1 / 3))), deg(Math.atan(1 / 2)) + deg(Math.atan(1 / 3))],
	'resolucion-triangulos/clase-problema-31': (() => {
		const PA = 1000 / s(10),
			PB = 1000 / s(20);
		return [PA, PB, Math.sqrt(PA ** 2 + PB ** 2 - 2 * PA * PB * c(26))];
	})(),
};

type Eq = { f: (x: number) => number; desde?: number; hasta?: number };

export const equations: Record<string, Eq> = {
	[`${rt}/examen-noria#b`]: { f: (x) => 20 + 18 * s(x) - 29 },
	// caso ambiguo: sin B = b·sin A / a con B entre 0° y 180° − A
	[`${tr}/ambiguo-dos#a`]: { f: (x) => s(x) - (10 * s(30)) / 7, hasta: 150 },
	// ─── Práctica adicional y ejemplos ───
	[`${ie}/ejemplo-ecuacion`]: { f: (x) => c(2 * x) + 5 * c(x) + 3 },
	[`${ie}/cos-directa`]: { f: (x) => 2 * c(x) + Math.sqrt(3) },
	[`${ie}/tan-2x`]: { f: (x) => t(2 * x) - Math.sqrt(3) },
	[`${ie}/seno-cuadrado`]: { f: (x) => 4 * s(x) ** 2 - 3 },
	[`${ie}/sin2x-cos`]: { f: (x) => s(2 * x) - c(x) },
	[`${ie}/raiz3-sin-cos`]: { f: (x) => Math.sqrt(3) * s(x) + c(x) - 1 },
	[`${ie}/cos2x-cosx`]: { f: (x) => c(2 * x) + c(x) },
	// el primer miembro solo existe si sin 2x ≠ 0
	[`${ie}/examen-identidad-ecuacion#b`]: { f: (x) => (s(2 * x) === 0 ? NaN : (1 - c(2 * x)) / s(2 * x) - Math.sqrt(3)) },
	[`${ie}/examen-mitad-doble`]: { f: (x) => 2 * s(x / 2) ** 2 + c(2 * x) },
	// ─── Serie A (clase) ───
	[`${ie}/clase-a1`]: { f: (x) => 2 * s(x) ** 2 + 3 * c(x) - 3 },
	[`${ie}/clase-a2`]: { f: (x) => c(2 * x) - 1 - 4 * s(x) },
	[`${ie}/clase-a3`]: { f: (x) => t(x) ** 2 - 3 * t(x) + 2 },
	[`${ie}/clase-a4`]: { f: (x) => c(2 * x) - s(x) },
	[`${ie}/clase-a5`]: { f: (x) => s(x) - t(x) },
	[`${ie}/clase-a6`]: { f: (x) => 6 * c(x / 2) ** 2 + c(x) - 1 },
	[`${ie}/clase-a7`]: { f: (x) => c(x) - s(x) - c(2 * x) },
	[`${ie}/clase-a8`]: { f: (x) => 2 * c(x) ** 2 + c(2 * x) * c(x) },
	// ─── Serie B (clase) ───
	[`${ie}/clase-b-a`]: { f: (x) => 1 / (c(x) + s(x)) - 2 * (c(x) - s(x)) },
	[`${ie}/clase-b-b`]: { f: (x) => s(x) * (s(x) - 1) - 5 * c(x) ** 2 + 4 },
	[`${ie}/clase-b-c`]: { f: (x) => 2 * s(x) - 1 },
	[`${ie}/clase-b-d`]: { f: (x) => 3 * t(x) ** 2 - 1 },
	[`${ie}/clase-b-e`]: { f: (x) => s(2 * x) - c(60) },
	[`${ie}/clase-b-f`]: { f: (x) => s(x) + Math.SQRT2 + s(x) },
	[`${ie}/clase-b-g`]: { f: (x) => c(x) ** 2 - c(x) },
	[`${ie}/clase-b-h`]: { f: (x) => 2 * s(x) ** 2 - s(x) - 1 },
};
