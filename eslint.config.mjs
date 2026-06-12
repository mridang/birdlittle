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
];
