#!/usr/bin/env node
// format-edited.mjs — Claude Code PostToolUse hook (matcher: Edit|Write|MultiEdit).
// After an edit, runs Prettier on just the edited file from the project root so the
// root .prettierrc / .prettierignore are honored. Formatting must never block an
// edit: all errors are swallowed and the script ALWAYS exits 0.
// Node 25 ESM, Windows-friendly (shell:true so npx resolves *.cmd shims).

import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const PRETTIER_EXTS = new Set([
  '.ts',
  '.tsx',
  '.js',
  '.jsx',
  '.mjs',
  '.cjs',
  '.json',
  '.jsonc',
  '.css',
  '.scss',
  '.md',
  '.mdx',
  '.html',
  '.yml',
  '.yaml',
]);

function readStdin() {
  return new Promise((resolve) => {
    let data = '';
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', (chunk) => {
      data += chunk;
    });
    process.stdin.on('end', () => resolve(data));
    process.stdin.on('error', () => resolve(data));
  });
}

async function main() {
  // Self-locate the project root: this script lives at <root>/.claude/hooks/format-edited.mjs.
  const here = path.dirname(fileURLToPath(import.meta.url));
  const projectRoot = path.resolve(here, '..', '..');

  const raw = await readStdin();

  let payload;
  try {
    payload = JSON.parse(raw);
  } catch {
    return; // No / invalid payload: nothing to format.
  }

  const file = payload?.tool_input?.file_path;
  if (!file) return;

  const ext = path.extname(file).toLowerCase();
  if (!PRETTIER_EXTS.has(ext)) return;

  if (!existsSync(file)) return;

  // shell:true so `npx` (a .cmd shim on Windows) resolves; cwd=projectRoot so
  // Prettier picks up the root .prettierrc and .prettierignore.
  spawnSync('npx prettier --write "' + file + '"', {
    cwd: projectRoot,
    shell: true,
    stdio: 'ignore',
  });
}

try {
  await main();
} catch {
  // Formatting must never block an edit — swallow everything.
}

process.exit(0);
