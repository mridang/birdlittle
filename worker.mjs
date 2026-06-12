import { NestFactory } from '@nestjs/core';
import { AppModule } from './dist/app.module.js';
import { configure } from '@mridang/nestjs-defaults';
import { CloudflareAdapter } from '@mridang/nestjs-platform-cloudflare';
import * as Sentry from '@sentry/cloudflare';

// The Cloudflare adapter runs NestJS natively over the Fetch API — no Express,
// no node:http shim, no port. Workers invoke the `fetch` export directly, so
// there is no `app.listen()`.
//
// Boot order matters: NestFactory.create({ logger: false }) keeps Nest silent,
// and app.init() (which logs route resolution via Nest's own logger) runs while
// still silent. configure() — which swaps in the structured BetterLogger and
// wires up the express-shaped middleware through the adapter's compat layer —
// runs only AFTER init, so the logger never performs async I/O in the forbidden
// global scope. The adapter applies its middleware/filters/pipes per request,
// so registering them post-init is fine.
const adapter = new CloudflareAdapter();
const app = await NestFactory.create(AppModule, adapter, {
  rawBody: true,
  logger: false,
});
await app.init();
configure(app);

// Wrap the worker entry with Sentry so every invocation runs inside a request
// scope: unhandled errors are captured automatically, exceptions reported by
// the app (via nestjs-defaults' reporter) carry request context, and traces are
// linked. Sentry self-disables when SENTRY_DSN is unset, so this is inert until
// the secret is configured (`wrangler secret put SENTRY_DSN`).
export default Sentry.withSentry(
  (env) => ({
    dsn: env.SENTRY_DSN,
    environment: env.NODE_ENV,
    release: env.SERVICE_VERSION,
    enabled: Boolean(env.SENTRY_DSN),
    tracesSampleRate: 1.0,
  }),
  {
    fetch: (request) => adapter.handle(request),
  },
);
