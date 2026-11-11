/**
 * @file Checks that the compiled stylesheet keeps the pointer cursor on clickable controls.
 */
import { readFile } from 'node:fs/promises';
import path from 'node:path';

// eslint-disable-next-line n/no-unpublished-import -- devDependency used only by the test suite, never shipped
import { beforeAll, describe, expect, it } from '@jest/globals';

describe('app.css', () => {
  let css = '';

  beforeAll(async () => {
    css = await readFile(
      path.join(process.cwd(), 'src', 'styles', 'app.css'),
      'utf8',
    );
  });

  describe('cursor', () => {
    const cursorRule = (): string | undefined =>
      /(button:not\(:disabled\),[^{]*)\{\s*cursor: pointer;/.exec(css)?.[1];

    it('is the pointer for anything clickable, since Tailwind 4 no longer gives buttons one', () => {
      const rule = cursorRule();
      ['button:not(:disabled)', 'summary', 'select:not(:disabled)'].forEach(
        (selector) => expect(rule).toContain(selector),
      );
      expect(rule).toContain("[role='button']");
    });

    it('is left alone for disabled controls', () => {
      const rule = cursorRule();
      expect(rule).not.toMatch(/(^|,)\s*button,/);
      expect(rule).toContain(':not(:disabled)');
    });
  });
});
