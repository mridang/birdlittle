import { config } from 'dotenv';

config();

// Disable Sentry in tests: when SENTRY_DSN is set, the `nestjs-defaults`
// reporter dynamically imports `@sentry/node`, which is not installed in this
// Cloudflare Workers app. Clearing the DSN forces the Noop reporter.
delete process.env.SENTRY_DSN;

// noinspection JSUnusedGlobalSymbols
export default async function setup(): Promise<void> {
  // No external services are required for the test suite. Configuration is
  // loaded from `.env` above; the application reads all secrets from the
  // environment, so the tests run entirely in-process.
  delete process.env.SENTRY_DSN;
}
