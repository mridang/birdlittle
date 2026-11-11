/**
 * @file Attaches plain request facts to the Workers root span so errors show them.
 *
 * Application context for Workers Issues. Cloudflare shows the attributes set
 * on the invocation's root span next to an error, so an error can say what it
 * was about. Everything here is best effort: where there is no Workers runtime
 * (plain Node, tests) or no active span, it does nothing, and it never throws.
 *
 * Only plain facts go in: an event name, a delivery id, numeric ids. Never a
 * payload, a signature, a token, an address, a name or any text from a request.
 */

/** What a span attribute may hold. */
type ContextValue = string | number | boolean;

/** Attributes to set; those left undefined are dropped. */
export type ContextAttributes = Readonly<
  Record<string, ContextValue | undefined>
>;

/** The part of a Workers span this file uses. */
interface ContextSpan {
  setAttribute(key: string, value: ContextValue): unknown;
  recordException(exception: { name: string; message: string }): unknown;
}

/** The part of `tracing` from `cloudflare:workers` this file uses. */
interface ContextTracing {
  getActiveSpan(): ContextSpan | undefined;
}

/** Longest text kept in one attribute; the rest is cut off. */
const MAX_TEXT = 256;

/** The tracing API once loaded; `null` where there is none. */
let loaded: ContextTracing | null | undefined;

/**
 * Load `cloudflare:workers`. Only the loaded module is remembered, never the
 * promise: a promise started in one request must not be waited on in another,
 * which the Workers runtime may never settle. The module is lazy because it
 * exists only in the Workers runtime, and a failure is remembered.
 * @returns The tracing API when the runtime provides it, otherwise `null`.
 * @example
 * const tracing = await load();
 */
async function load(): Promise<ContextTracing | null> {
  try {
    const workers = await import('cloudflare:workers');
    loaded = workers.tracing as ContextTracing;
  } catch {
    loaded = null;
  }
  return loaded ?? null;
}

/**
 * Run `apply` on the invocation's root span, if there is one. Once the runtime
 * module has loaded this happens at once, before the call returns, so that
 * context set in a handler that does not wait is still on the span when the
 * invocation ends. Never rejects.
 * @param apply - The callback that writes to the span it is given.
 * @returns A promise that resolves once `apply` has run, or straight away when there is no span.
 * @example
 * await withActiveSpan((span) => span.setAttribute('event', 'push'));
 */
function withActiveSpan(apply: (span: ContextSpan) => void): Promise<void> {
  const run = (tracing: ContextTracing | null): void => {
    try {
      const span = tracing?.getActiveSpan();
      if (span) {
        apply(span);
      }
    } catch {
      // Context is a convenience: it must never fail a request.
    }
  };
  if (loaded !== undefined) {
    run(loaded);
    return Promise.resolve();
  }
  return load()
    .then(run)
    .catch(() => undefined);
}

/**
 * Keeps the attributes worth recording: a string, a finite number or a boolean.
 * Strings are cut to the maximum length, and other values are dropped.
 * @param attributes - The attributes as the caller gave them.
 * @returns The `[key, value]` pairs that can be set on a span.
 * @example
 * accepted({ event: 'push', count: 3, missing: undefined }); // [['event', 'push'], ['count', 3]]
 */
function accepted(attributes: ContextAttributes): [string, ContextValue][] {
  const kept: [string, ContextValue][] = [];
  for (const [key, value] of Object.entries(attributes)) {
    if (typeof value === 'string') {
      kept.push([key, value.slice(0, MAX_TEXT)]);
    }
    if (typeof value === 'boolean') {
      kept.push([key, value]);
    }
    if (typeof value === 'number' && Number.isFinite(value)) {
      kept.push([key, value]);
    }
  }
  return kept;
}

/**
 * Attach attributes to the current invocation so an error in it shows them.
 * Safe to call anywhere, any number of times (a later call for the same key
 * replaces the earlier value). The first call has to load the runtime module,
 * so where the caller is async it should wait for the result; the returned
 * promise never rejects.
 * @param attributes - The attributes to set on the root span; undefined values are skipped.
 * @returns A promise that resolves once the attributes are set, or at once when there is nothing to set.
 * @example
 * await setErrorContext({ event: 'push', deliveryId: 'abc-123' });
 */
export function setErrorContext(attributes: ContextAttributes): Promise<void> {
  try {
    const kept = accepted(attributes);
    if (kept.length === 0) {
      return Promise.resolve();
    }
    return withActiveSpan((span) => {
      for (const [key, value] of kept) {
        span.setAttribute(key, value);
      }
    });
  } catch {
    return Promise.resolve();
  }
}

/**
 * Record an error on the current invocation's span so Issues groups it by
 * `name`. Send only fixed words, never text that came from a request.
 * @param name - A fixed word that names the kind of error, used to group it.
 * @param message - A fixed description of the error, cut to the maximum length.
 * @returns A promise that resolves once the error is recorded, or at once when there is no span.
 * @example
 * await recordErrorOnSpan('WebhookSignatureError', 'Signature did not match.');
 */
export function recordErrorOnSpan(
  name: string,
  message: string,
): Promise<void> {
  return withActiveSpan((span) =>
    span.recordException({
      name: name.slice(0, MAX_TEXT),
      message: message.slice(0, MAX_TEXT),
    }),
  );
}
