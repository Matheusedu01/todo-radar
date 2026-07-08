import { test } from 'node:test';
import assert from 'node:assert/strict';
import { formatAsTable, formatAsMarkdown, formatAsJson } from '../src/formatters.js';

const sample = [
  { file: 'a.js', line: 2, tag: 'TODO', text: 'fazer algo' },
  { file: 'b.py', line: 5, tag: 'FIXME', text: 'corrigir bug' },
];

test('formatAsTable agrupa por tag e mostra total', () => {
  const output = formatAsTable(sample);
  assert.match(output, /TODO \(1\)/);
  assert.match(output, /FIXME \(1\)/);
  assert.match(output, /Total: 2/);
});

test('formatAsTable trata lista vazia', () => {
  const output = formatAsTable([]);
  assert.match(output, /Nenhum comentário encontrado/);
});

test('formatAsMarkdown gera cabeçalhos por tag e itens', () => {
  const output = formatAsMarkdown(sample);
  assert.match(output, /## TODO \(1\)/);
  assert.match(output, /a\.js:2/);
});

test('formatAsJson produz JSON válido com os mesmos dados', () => {
  const output = formatAsJson(sample);
  const parsed = JSON.parse(output);
  assert.deepEqual(parsed, sample);
});
