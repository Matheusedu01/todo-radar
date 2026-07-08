import pc from 'picocolors';

const TAG_COLORS = {
  TODO: pc.yellow,
  FIXME: pc.red,
  HACK: pc.magenta,
  NOTE: pc.cyan,
};

function colorForTag(tag) {
  return TAG_COLORS[tag] ?? pc.white;
}

function groupByTag(findings) {
  const groups = {};
  for (const finding of findings) {
    if (!groups[finding.tag]) groups[finding.tag] = [];
    groups[finding.tag].push(finding);
  }
  return groups;
}

export function formatAsTable(findings) {
  if (findings.length === 0) {
    return pc.green('Nenhum comentário encontrado. Código limpo!');
  }

  const grouped = groupByTag(findings);
  const lines = [];

  for (const [tag, items] of Object.entries(grouped)) {
    const color = colorForTag(tag);
    lines.push('');
    lines.push(color(pc.bold(`${tag} (${items.length})`)));
    for (const item of items) {
      const location = pc.dim(`${item.file}:${item.line}`);
      lines.push(`  ${location}  ${item.text}`);
    }
  }

  lines.push('');
  lines.push(pc.bold(`Total: ${findings.length} comentário(s) encontrado(s)`));
  return lines.join('\n');
}

export function formatAsMarkdown(findings) {
  if (findings.length === 0) {
    return '# todo-radar report\n\nNenhum comentário encontrado.\n';
  }

  const grouped = groupByTag(findings);
  const lines = ['# todo-radar report', ''];

  for (const [tag, items] of Object.entries(grouped)) {
    lines.push(`## ${tag} (${items.length})`, '');
    for (const item of items) {
      lines.push(`- \`${item.file}:${item.line}\` — ${item.text || '_sem descrição_'}`);
    }
    lines.push('');
  }

  return lines.join('\n');
}

export function formatAsJson(findings) {
  return JSON.stringify(findings, null, 2);
}
