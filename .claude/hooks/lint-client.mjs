#!/usr/bin/env node
// PostToolUse hook (Edit|Write|MultiEdit): lint edited client TypeScript files.
// Self-locates the project root, runs `npx eslint` from client/ (where eslint.config.js
// lives) on the edited .ts/.tsx file. Fails open if eslint cannot run (missing deps);
// on lint failures, writes the report to stderr and exits 2 so Claude sees the errors
// and can fix them. The edit has already happened (PostToolUse cannot block retroactively).
// Node 25 ESM, Windows-friendly (shell:true so npx resolves).

import { fileURLToPath } from 'node:url';
import path from 'node:path';
import fs from 'node:fs';
import { spawnSync } from 'node:child_process';

try {
  // Read the full hook payload from stdin.
  const raw = fs.readFileSync(0, 'utf8');
  const payload = raw ? JSON.parse(raw) : {};

  const filePath = payload?.tool_input?.file_path;
  if (!filePath) {
    process.exit(0);
  }

  // Resolve project root from this script's location: <root>/.claude/hooks/lint-client.mjs
  const scriptDir = path.dirname(fileURLToPath(import.meta.url));
  const projectRoot = path.resolve(scriptDir, '..', '..');
  const clientDir = path.join(projectRoot, 'client');

  // Normalize separators for portable segment checks.
  const normalized = filePath.replace(/\\/g, '/');
  const clientPrefix = clientDir.replace(/\\/g, '/') + '/';

  const isClientFile = normalized.startsWith(clientPrefix);
  const isTsFile = /\.tsx?$/.test(normalized);
  const isExcluded = /\/(?:dist|node_modules)\//.test(normalized);

  if (!isClientFile || !isTsFile || isExcluded) {
    process.exit(0);
  }

  // Run eslint from clientDir (where eslint.config.js lives). shell:true lets npx
  // resolve on Windows.
  const r = spawnSync('npx eslint "' + filePath + '"', {
    cwd: clientDir,
    shell: true,
    encoding: 'utf8',
  });

  // eslint could not run (e.g. deps missing) -> fail open, never block on tooling.
  if (r.error) {
    process.exit(0);
  }

  // Lint failures -> feed the report back to Claude via stderr and exit 2.
  if (r.status && r.status !== 0) {
    const report = ((r.stdout || '') + (r.stderr || '')).trim();
    process.stderr.write(report || 'ESLint reported errors in ' + filePath + '.');
    process.exit(2);
  }

  process.exit(0);
} catch {
  // Unexpected internal error: fail open so the hook never crashes the tool flow.
  process.exit(0);
}
