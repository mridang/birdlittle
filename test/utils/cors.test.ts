/**
 * @file Tests that CORS headers are removed from responses.
 */

import { expect } from '@jest/globals';
import { withoutCors } from '../../src/utils/cors.js';

describe('withoutCors', () => {
  const response = new Response('ok', {
    status: 201,
    headers: {
      'Access-Control-Allow-Origin': 'https://evil.example',
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Expose-Headers': 'X-Thing',
      'Content-Type': 'text/plain',
    },
  });

  test('removes every Access-Control header', () => {
    const cleaned = withoutCors(response);
    expect([...cleaned.headers.keys()]).toEqual(['content-type']);
  });

  test('keeps the status and body', async () => {
    const cleaned = withoutCors(response);
    expect(cleaned.status).toBe(201);
    expect(await cleaned.text()).toBe('ok');
  });
});
