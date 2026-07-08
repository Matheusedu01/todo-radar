import { test } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { scanDirectory } from '../src/scanner.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const fixturesDir = path.join(__dirname, '..', 'fixtures');

test('encontra TODO e FIXME em arquivos JS e Python', async () => {
  const findings = await scanDirectory({ cwd: fixturesDir });

  const todo = findings.find((f) => f.tag === 'TODO' && f.file === 'sample.js');
  assert.ok(todo, 'deveria encontrar um TODO em sample.js');
  assert.equal(todo.text, 'primeiro item');

  const fixme = findings.find((f) => f.tag === 'FIXME');
  assert.ok(fixme, 'deveria encontrar um FIXME');

  const pythonTodo = findings.find((f) => f.file === 'sample.py');
  assert.ok(pythonTodo, 'deveria encontrar TODO em arquivo Python usando #');
});

test('filtra por tags customizadas', async () => {
  const findings = await scanDirectory({ cwd: fixturesDir, tags: ['FIXME'] });
  assert.ok(findings.length > 0);
  assert.ok(findings.every((f) => f.tag === 'FIXME'));
});

test('não confunde texto dentro de string com comentário real', async () => {
  const findings = await scanDirectory({ cwd: fixturesDir });
  const falsePositive = findings.find((f) => f.file === 'negative-case.js');
  assert.equal(falsePositive, undefined);
});

test('retorna array vazio quando nenhuma extensão bate', async () => {
  const findings = await scanDirectory({ cwd: fixturesDir, extensions: ['nonexistent'] });
  assert.deepEqual(findings, []);
});
