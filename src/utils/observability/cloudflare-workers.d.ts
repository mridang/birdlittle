/**
 * @file Types for the part of the `cloudflare:workers` runtime module that the
 * context helper uses; the module exists only inside the Workers runtime.
 */
declare module 'cloudflare:workers' {
  export const tracing: {
    getActiveSpan(): unknown;
  };
}
