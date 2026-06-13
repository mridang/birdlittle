import mridangPlugin from '@mridang/eslint-defaults';

export default [
  {
    ignores: [
      'dist/**',
      '.wrangler/**',
      'coverage/**',
      '.out/**',
      'preview/**',
    ],
  },
  ...mridangPlugin.configs.recommended,
  {
    // The worker entry imports the compiled app from `dist/`, which does not
    // exist at lint time (lint runs before build).
    files: ['worker.mjs'],
    rules: { 'import/no-unresolved': 'off' },
  },
];
