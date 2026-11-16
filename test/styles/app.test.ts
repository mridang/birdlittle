/**
 * @file Checks that the compiled stylesheet keeps the pointer cursor on clickable controls.
 */
import { readFile } from 'node:fs/promises';
import path from 'node:path';

import { beforeAll, describe, expect, it } from '@jest/globals';

/** The rule that gives every clickable control a pointer cursor. */
const CURSOR_RULE_PATTERN =
  /(button:not\(:disabled\),[^{]*)\{\s*cursor: pointer;/;

/** A button rule that is not left alone when its control is disabled. */
const UNDISABLED_BUTTON_PATTERN = /(^|,)\s*button,/;

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
      CURSOR_RULE_PATTERN.exec(css)?.[1];

    it('is the pointer for anything clickable, since Tailwind 4 no longer gives buttons one', () => {
      const rule = cursorRule();
      for (const selector of [
        'button:not(:disabled)',
        'summary',
        'select:not(:disabled)',
      ]) {
        expect(rule).toContain(selector);
      }
      expect(rule).toContain("[role='button']");
    });

    it('is left alone for disabled controls', () => {
      const rule = cursorRule();
      expect(rule).not.toMatch(UNDISABLED_BUTTON_PATTERN);
      expect(rule).toContain(':not(:disabled)');
    });
  });
});
