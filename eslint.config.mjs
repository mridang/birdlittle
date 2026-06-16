import { includeIgnoreFile } from '@eslint/compat';
import { fileURLToPath } from 'node:url';
import mridangPlugin from '@mridang/eslint-defaults';

export default [
  includeIgnoreFile(fileURLToPath(new URL('.gitignore', import.meta.url))),
  {
    ignores: ['public/**'],
  },
  ...mridangPlugin.configs.recommended,
  {
    // cloudflare:workers is a runtime-provided virtual module the import
    // resolver cannot see; treat it as a core module.
    settings: { 'import/core-modules': ['cloudflare:workers'] },
  },
  {
    // The worker entry imports the compiled dist, which is absent at lint time.
    files: ['worker.mjs'],
    rules: { 'import/no-unresolved': 'off' },
  },
  {
    // Ambient declaration files legitimately use triple-slash references.
    files: ['**/*.d.ts'],
    rules: { '@typescript-eslint/triple-slash-reference': 'off' },
  },
];
