import { expect } from '@jest/globals';
import {
  PERMISSIONS_POLICY,
  withPermissionsPolicy,
} from '../../src/utils/permissions-policy.js';

describe('withPermissionsPolicy', () => {
  test('replaces a weaker policy', () => {
    const response = withPermissionsPolicy(
      new Response('ok', { headers: { 'Permissions-Policy': 'camera=()' } }),
    );
    expect(response.headers.get('Permissions-Policy')).toBe(PERMISSIONS_POLICY);
  });

  test('switches off every feature', () => {
    const entries = PERMISSIONS_POLICY.split(', ');
    expect(entries).toHaveLength(29);
    expect(entries.every((entry) => entry.endsWith('=()'))).toBe(true);
  });
});
