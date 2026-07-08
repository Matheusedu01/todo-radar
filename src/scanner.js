import { globby } from 'globby';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

const COMMENT_MARKERS_BY_EXT = {
  js: ['//', '/*'],
  jsx: ['//', '/*'],
  ts: ['//', '/*'],
  tsx: ['//', '/*'],
  mjs: ['//', '/*'],
  cjs: ['//', '/*'],
  java: ['//', '/*'],
  c: ['//', '/*'],
  cpp: ['//', '/*'],
  h: ['//', '/*'],
  hpp: ['//', '/*'],
  cs: ['//', '/*'],
  go: ['//', '/*'],
  rs: ['//', '/*'],
  swift: ['//', '/*'],
  kt: ['//', '/*'],
  php: ['//', '/*'],
  scss: ['//', '/*'],
  css: ['/*'],
  py: ['#'],
  rb: ['#'],
  sh: ['#'],
  yml: ['#'],
  yaml: ['#'],
  html: ['<!--'],
  vue: ['<!--', '//'],
  svelte: ['<!--', '//'],
};

const DEFAULT_MARKERS = ['//', '#'];
export const DEFAULT_TAGS = ['TODO', 'FIXME', 'HACK', 'NOTE'];
export const DEFAULT_EXTENSIONS = Object.keys(COMMENT_MARKERS_BY_EXT);

function buildTagPattern(tags) {
  const alternation = tags.map((tag) => tag.toUpperCase()).join('|');
  return new RegExp(`\\b(${alternation})\\b:?\\s*(.*)`, 'i');
}

// "//" logo após ":" costuma ser uma URL (https://...), não um comentário real.
function indexOfMarker(line, marker) {
  let searchFrom = 0;
  while (true) {
    const index = line.indexOf(marker, searchFrom);
    if (index === -1) return -1;
    if (marker === '//' && line[index - 1] === ':') {
      searchFrom = index + marker.length;
      continue;
    }
    return index;
  }
}

// Retorna o texto da linha a partir do primeiro marcador de comentário
// encontrado (o marcador mais à esquerda), ou null se não houver comentário.
function findCommentInLine(line, extension) {
  const markers = COMMENT_MARKERS_BY_EXT[extension] ?? DEFAULT_MARKERS;
  let bestIndex = -1;
  let matchedMarker = null;

  for (const marker of markers) {
    const index = indexOfMarker(line, marker);
    if (index !== -1 && (bestIndex === -1 || index < bestIndex)) {
      bestIndex = index;
      matchedMarker = marker;
    }
  }

  if (bestIndex === -1) return null;
  return line.slice(bestIndex + matchedMarker.length);
}

export async function scanDirectory({
  cwd = process.cwd(),
  tags = DEFAULT_TAGS,
  extensions = DEFAULT_EXTENSIONS,
  extraIgnore = [],
} = {}) {
  const patterns = extensions.map((ext) => `**/*.${ext}`);
  const files = await globby(patterns, {
    cwd,
    gitignore: true,
    ignore: ['**/node_modules/**', '**/.git/**', ...extraIgnore],
    absolute: false,
  });

  const tagPattern = buildTagPattern(tags);
  const findings = [];

  for (const relativeFile of files) {
    const absoluteFile = path.join(cwd, relativeFile);
    const extension = path.extname(relativeFile).slice(1);
    const content = await readFile(absoluteFile, 'utf8');
    const lines = content.split('\n');

    lines.forEach((line, index) => {
      const commentBody = findCommentInLine(line, extension);
      if (!commentBody) return;

      const match = commentBody.match(tagPattern);
      if (!match) return;

      findings.push({
        file: relativeFile,
        line: index + 1,
        tag: match[1].toUpperCase(),
        text: (match[2] || '').trim(),
      });
    });
  }

  return findings;
}
