/**
 * @file Fake for the Workers tracing module used by the observability tests.
 */
// eslint-disable-next-line n/no-unpublished-import -- devDependency used only by the test suite, never shipped
import { jest } from '@jest/globals';

/** What a fake span was told. */
export interface FakeTracing {
  /** The attributes set on the active span. */
  readonly attributes: Record<string, unknown>;
  /** The exceptions recorded on the active span. */
  readonly exceptions: { name: string; message: string }[];
  /** Whether there is an active span (there is none outside a request). */
  active: boolean;
  /** Make the fake span throw from every call. */
  throwing: boolean;
}

/**
 * Stands in for `cloudflare:workers`, which exists only in the Workers runtime.
 * Call it before importing the code under test; the returned object shows what
 * that code put on the active span.
 * @returns The fake state that records the attributes and exceptions set on the span.
 * @example
 * const fake = installFakeTracing();
 * expect(fake.attributes).toEqual({});
 */
export function installFakeTracing(): FakeTracing {
  const fake: FakeTracing = {
    attributes: {},
    exceptions: [],
    active: true,
    throwing: false,
  };
  const span = {
    setAttribute(key: string, value: unknown) {
      if (fake.throwing) {
        throw new Error('span failed');
      }
      fake.attributes[key] = value;
    },
    recordException(exception: { name: string; message: string }) {
      if (fake.throwing) {
        throw new Error('span failed');
      }
      fake.exceptions.push(exception);
    },
  };
  jest.unstable_mockModule(
    'cloudflare:workers',
    () => ({
      tracing: { getActiveSpan: () => (fake.active ? span : undefined) },
    }),
    { virtual: true },
  );
  return fake;
}
