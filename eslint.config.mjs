import mridangPlugin from '@mridang/eslint-defaults';

export default [
  {
    ignores: ['dist/**', '.wrangler/**', 'coverage/**', '.out/**'],
  },
  ...mridangPlugin.configs.recommended,
];
