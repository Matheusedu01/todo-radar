import { Command } from 'commander';
import { writeFile } from 'node:fs/promises';
import { scanDirectory, DEFAULT_TAGS } from './scanner.js';
import { formatAsTable, formatAsMarkdown, formatAsJson } from './formatters.js';

const FORMATTERS = {
  table: formatAsTable,
  markdown: formatAsMarkdown,
  json: formatAsJson,
};

export async function run(argv) {
  const program = new Command();

  program
    .name('todo-radar')
    .description('Escaneia seu código em busca de comentários TODO/FIXME/HACK/NOTE')
    .version('0.1.0')
    .argument('[path]', 'diretório para escanear', '.')
    .option('-t, --tags <tags>', 'tags a procurar, separadas por vírgula', DEFAULT_TAGS.join(','))
    .option('-f, --format <format>', 'formato de saída: table, markdown ou json', 'table')
    .option('-o, --output <file>', 'salva o resultado em um arquivo em vez de imprimir no terminal')
    .action(async (targetPath, options) => {
      const formatter = FORMATTERS[options.format];
      if (!formatter) {
        console.error(`Formato desconhecido: "${options.format}". Use table, markdown ou json.`);
        process.exitCode = 1;
        return;
      }

      const tags = options.tags
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean);

      const findings = await scanDirectory({ cwd: targetPath, tags });
      const output = formatter(findings);

      if (options.output) {
        await writeFile(options.output, output, 'utf8');
        console.log(`Relatório salvo em ${options.output}`);
      } else {
        console.log(output);
      }
    });

  await program.parseAsync(argv);
}
