/**
 * @file Types for the part of the `cloudflare:workers` runtime module that the
 * context helper uses; the module exists only inside the Workers runtime.
 */
declare module 'cloudflare:workers' {
  export const tracing: {
    getActiveSpan():
      | {
          setAttribute(key: string, value: string | number | boolean): void;
          recordException(exception: { name: string; message: string }): void;
        }
      | undefined;
  };
}
