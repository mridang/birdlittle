/**
 * @file Tests that the Birdlittle module wires its providers.
 */

import { afterAll, beforeAll, expect } from '@jest/globals';
import ProbotHandler from '../../../src/services/birdlittle/probot.handler.js';
import { End2EndModule } from '../../end-to-end.module.js';
import { AppModule } from '../../../src/app.module.js';

const testModule = new End2EndModule({
  imports: [
    {
      module: AppModule,
      providers: [],
    },
  ],
});

describe('birdlittle.module tests', () => {
  beforeAll(async () => {
    await testModule.beforeAll();
  });

  afterAll(async () => {
    await testModule.afterAll();
  });

  test('that the webhook hander is registered', async () => {
    expect(testModule.app.get(ProbotHandler)).toBeDefined();
  });
});
