import { NestFactory } from '@nestjs/core';
import { AppModule } from './dist/app.module.js';
import { configure } from '@mridang/nestjs-defaults';
import { CloudflareAdapter } from '@mridang/nestjs-platform-cloudflare';

// The Cloudflare adapter runs NestJS natively over the Fetch API — no Express,
// no node:http shim, no port. Workers invoke the `fetch` export directly, so
// there is no `app.listen()`.
//
// Boot order matters: NestFactory.create({ logger: false }) keeps Nest silent,
// and app.init() (which logs route resolution via Nest's own logger) runs while
// still silent. configure() — which swaps in the winston BetterLogger and wires
// up the express-shaped middleware through the adapter's compat layer — runs
// only AFTER init, so winston never performs async I/O in the forbidden global
// scope. The adapter applies its middleware/filters/pipes per request, so
// registering them post-init is fine.
const adapter = new CloudflareAdapter();
const app = await NestFactory.create(AppModule, adapter, {
  rawBody: true,
  logger: false,
});
await app.init();
configure(app);

export default {
  fetch: (request) => adapter.handle(request),
};
