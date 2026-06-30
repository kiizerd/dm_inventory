#!/usr/bin/env node
// block-env.mjs — Claude Code PreToolUse hook (matcher: Edit|Write|MultiEdit).
// Blocks edits/writes to real .env files (they hold secrets and are gitignored),
// while allowing safe template files (.env.example, .env.sample, etc.).
// Reads the hook payload from stdin, inspects tool_input.file_path, and on a
// disallowed target writes a reason to stderr and exits 2 (PreToolUse exit code 2
// blocks the tool call and feeds stderr back to Claude). Fail-safe by design:
// any unexpected internal error blocks rather than letting a secret slip through.
// Runs on Node 25 (ESM), Windows/macOS/Linux.

import path from 'node:path';

// Templates that are safe to edit even though they match the .env* pattern.
const ALLOWLIST = new Set([
  '.env.example',
  '.env.sample',
  '.env.template',
  '.env.local.example',
  '.env.defaults',
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

function isBlockedEnvFile(basename) {
  if (ALLOWLIST.has(basename)) return false;
  return basename === '.env' || basename.startsWith('.env.');
}

async function main() {
  const raw = await readStdin();

  let payload;
  try {
    payload = JSON.parse(raw);
  } catch {
    // Could not parse the hook payload. Fail-safe: block rather than risk
    // silently allowing an edit to a secrets file we failed to inspect.
    process.stderr.write('block-env: could not parse hook payload; blocking to be safe.\n');
    process.exit(2);
  }

  const filePath = payload?.tool_input?.file_path;
  if (!filePath || typeof filePath !== 'string') {
    // No file path to evaluate (e.g. a tool shape without file_path). Allow.
    process.exit(0);
  }

  const basename = path.basename(filePath);
  if (isBlockedEnvFile(basename)) {
    process.stderr.write(
      `Blocked edit to ${basename}: .env files hold secrets and are gitignored. ` +
        'Edit a .env.example template instead, or ask the user to change it manually.\n',
    );
    process.exit(2);
  }

  process.exit(0);
}

main().catch(() => {
  // Unexpected internal error: fail-safe and block.
  process.stderr.write('block-env: internal error; blocking to be safe.\n');
  process.exit(2);
});
