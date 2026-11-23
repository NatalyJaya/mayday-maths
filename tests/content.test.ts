// Comprueba el contenido educativo:
//  1. Todos los archivos cumplen el esquema y sus referencias existen.
//  2. Cada respuesta numérica coincide con lo que calcula el modelo
//     matemático (src/lib/math/trig.ts), de forma independiente al YAML.
//  3. Cada conjunto de soluciones de una ecuación es CORRECTO y COMPLETO:
//     todas las soluciones cumplen la ecuación y no falta ninguna (se buscan
//     numéricamente todas las raíces en [0°, 360°)).
//  4. Ninguna «trampa» coincide con la respuesta correcta.
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { parse } from 'yaml';
import { exerciseBaseSchema, sourceSchema, type Exercise } from '../src/lib/schemas';
import { expectedNumeric, equations } from './expected';
import { findRoots } from '../src/lib/math/trig';

const ROOT = join(import.meta.dirname, '..', 'src', 'content');
const read = (p: string) => parse(readFileSync(join(ROOT, p), 'utf8'));

const sources = read('fuentes.yaml') as { id: string; tipo: string }[];
const collections = read('colecciones.yaml') as { id: string; tema: string; principales: string[] }[];
const topics = read('temario/temas.yaml') as { id: string; estado: string }[];
const sourceIds = new Set(sources.map((s) => s.id));
const topicIds = new Set(topics.map((t) => t.id));
const collectionIds = new Set(collections.map((c) => c.id));

const exercises: { slug: string; ex: Exercise }[] = [];
const parseErrors: string[] = [];
for (const topic of readdirSync(join(ROOT, 'ejercicios'))) {
	for (const file of readdirSync(join(ROOT, 'ejercicios', topic)).filter((f) => f.endsWith('.yaml'))) {
		try {
			const res = exerciseBaseSchema.safeParse(read(join('ejercicios', topic, file)));
			if (!res.success) parseErrors.push(`${topic}/${file}: ${res.error.message}`);
			else exercises.push({ slug: `${topic}/${file.replace(/\.yaml$/, '')}`, ex: res.data });
		} catch (e) {
			parseErrors.push(`${topic}/${file}: ${(e as Error).message.split('\n')[0]}`);
		}
	}
}

describe('contenido: esquema y referencias', () => {
	it('todos los YAML se leen y cumplen el esquema', () => expect(parseErrors).toEqual([]));
	it('hay ejercicios', () => expect(exercises.length).toBeGreaterThan(10));
	it('las fuentes cumplen su esquema', () => {
		for (const s of sources) expect(sourceSchema.safeParse(s).success).toBe(true);
	});
	for (const { slug, ex } of exercises) {
		it(`${slug}: referencias válidas`, () => {
			expect(topicIds.has(ex.tema)).toBe(true);
			expect(slug.startsWith(`${ex.tema}/`)).toBe(true);
			if (ex.fuente) expect(sourceIds.has(ex.fuente)).toBe(true);
			for (const s of ex.inspirado_en) expect(sourceIds.has(s)).toBe(true);
			if (ex.coleccion) expect(collectionIds.has(ex.coleccion)).toBe(true);
			if (ex.variante_de) expect(exercises.some((e) => e.slug === `${ex.tema}/${ex.variante_de}`)).toBe(true);
			// los ejercicios de clase llevan su referencia a los apuntes
			if (ex.procedencia === 'clase') expect(ex.referencia).toBeTruthy();
		});
	}
	for (const c of collections) {
		it(`colección ${c.id}: sus ejercicios existen`, () => {
			for (const p of c.principales) expect(exercises.some((e) => e.slug === `${c.tema}/${p}`)).toBe(true);
		});
	}
});

describe('contenido: respuestas numéricas verificadas con el modelo', () => {
	const numeric = exercises.filter(({ ex }) => ex.apartados.some((p) => p.respuesta.tipo === 'numerica'));
	for (const { slug, ex } of numeric) {
		it(`${slug}`, () => {
			const fields = ex.apartados.flatMap((p) => (p.respuesta.tipo === 'numerica' ? p.respuesta.campos : []));
			const exp = expectedNumeric[slug];
			expect(exp, `Falta la entrada de ${slug} en tests/expected.ts`).toBeDefined();
			expect(fields.length).toBe(exp.length);
			fields.forEach((f, i) => {
				const tol = Math.max(f.tolerancia * Math.abs(exp[i]) * 0.25, f.tolerancia_abs);
				expect(Math.abs(f.valor - exp[i]), `${f.etiqueta}: YAML ${f.valor}, modelo ${exp[i]}`).toBeLessThanOrEqual(tol);
			});
		});
	}
});

describe('contenido: conjuntos de soluciones correctos y completos', () => {
	const sets = exercises.flatMap(({ slug, ex }) =>
		ex.apartados.filter((p) => p.respuesta.tipo === 'conjunto').map((p) => ({ slug, part: p.id, r: p.respuesta as Extract<typeof p.respuesta, { tipo: 'conjunto' }> })),
	);
	for (const { slug, part, r } of sets) {
		it(`${slug} (${part})`, () => {
			const eq = equations[`${slug}#${part}`] ?? equations[slug];
			expect(eq, `Falta la ecuación de ${slug} en tests/expected.ts`).toBeDefined();
			const roots = findRoots(eq.f, eq.desde ?? 0, eq.hasta ?? 360);
			const fmt = (xs: number[]) => xs.map((x) => x.toFixed(2)).join(', ');
			expect(roots.length, `raíces del modelo: ${fmt(roots)} · YAML: ${fmt(r.valores)}`).toBe(r.valores.length);
			for (const v of r.valores) expect(roots.some((x) => Math.abs(x - v) <= Math.min(r.tolerancia, 0.01) + 1e-9), `${v} no es raíz (raíces: ${fmt(roots)})`).toBe(true);
		});
	}
});

describe('contenido: las trampas no tapan la respuesta correcta', () => {
	for (const { slug, ex } of exercises) {
		for (const p of ex.apartados) {
			const r = p.respuesta;
			if (r.tipo === 'numerica')
				for (const f of r.campos)
					for (const t of f.trampas)
						it(`${slug} · ${f.etiqueta} · trampa ${t.valor}`, () => {
							const tol = Math.max(f.tolerancia * Math.abs(f.valor), f.tolerancia_abs);
							expect(Math.abs(t.valor - f.valor)).toBeGreaterThan(tol);
						});
			if (r.tipo === 'conjunto')
				for (const t of r.trampas)
					it(`${slug} · trampa {${t.valores.join('; ')}}`, () => {
						const same = t.valores.length === r.valores.length && t.valores.every((v) => r.valores.some((w) => Math.abs(v - w) <= r.tolerancia));
						expect(same).toBe(false);
					});
		}
	}
});

describe('lecciones: los ejemplos guiados existen y son de su tema', () => {
	for (const topic of readdirSync(join(ROOT, 'lecciones'))) {
		for (const file of readdirSync(join(ROOT, 'lecciones', topic))) {
			const src = readFileSync(join(ROOT, 'lecciones', topic, file), 'utf8');
			for (const m of src.matchAll(/<GuidedExample[^>]*id="([^"]+)"/g)) {
				it(`${topic}/${file} → ${m[1]}`, () => {
					const e = exercises.find((x) => x.slug === m[1]);
					expect(e, `No existe el ejercicio ${m[1]}`).toBeDefined();
					expect(e!.ex.rol).toBe('ejemplo');
				});
			}
		}
	}
	it('cada tema disponible tiene sus cinco lecciones', () => {
		for (const t of topics.filter((x) => x.estado === 'disponible')) {
			const files = readdirSync(join(ROOT, 'lecciones', t.id)).sort();
			expect(files).toEqual(['ejemplos.mdx', 'idea.mdx', 'laboratorio.mdx', 'objetos.mdx', 'propiedades.mdx']);
		}
	});
});
