import { config } from 'dotenv';

// Provide sensible defaults for env vars consumed at module load time so that
// unit/integration tests can boot the Nest application without real GitHub App
// credentials being present in the environment (e.g. in CI).
process.env.GITHUB_APP_ID ||= '1';
process.env.GITHUB_PRIVATE_KEY ||= '';
process.env.GITHUB_WEBHOOK_SECRET ||= 'test-webhook-secret';
process.env.GITHUB_CLIENT_ID ||= 'test-client-id';
process.env.GITHUB_CLIENT_SECRET ||= 'test-client-secret';

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
