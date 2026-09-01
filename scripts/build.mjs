// Builds ESM and CJS with tsc alone — no bundler, no build-time dependencies
// beyond TypeScript itself.
import { execFileSync } from 'node:child_process';
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';

const tsc = process.platform === 'win32' ? 'tsc.cmd' : 'tsc';
const run = (...args) =>
  execFileSync(tsc, args, { stdio: 'inherit', shell: process.platform === 'win32' });

rmSync('dist', { recursive: true, force: true });

run('-p', 'tsconfig.esm.json');
run('-p', 'tsconfig.cjs.json');

// dist/cjs holds .js files that are CommonJS, while the root package is ESM.
// This marker tells Node how to read them.
mkdirSync('dist/cjs', { recursive: true });
writeFileSync('dist/cjs/package.json', `${JSON.stringify({ type: 'commonjs' }, null, 2)}\n`);

console.log('built dist/esm and dist/cjs');
