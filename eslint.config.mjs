import mridangPlugin from '@mridang/eslint-defaults';
import { createTypeScriptImportResolver } from 'eslint-import-resolver-typescript';

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
    // @mridang/eslint-defaults wires the legacy `import/resolver: { typescript }`
    // interface, which eslint-import-resolver-typescript v4 replaced. Use v4's
    // resolver through the new `import/resolver-next` API so import resolution
    // works instead of erroring with "invalid interface loaded as resolver".
    settings: {
      'import/resolver-next': [createTypeScriptImportResolver()],
    },
  },
];
