/**
 * @file Jest global setup that fills in hermetic defaults before the suite runs.
 */

import { config } from 'dotenv';
import { generateKeyPairSync } from 'node:crypto';

// Load any local .env first so real values take precedence over the defaults.
config();

// Hermetic defaults so the app boots in tests (and in CI, which has no .env)
// without real credentials. The private key is generated at runtime, so no key
// material is committed to the repository.
// eslint-disable-next-line n/no-sync -- globalSetup is loaded natively by Node, which cannot resolve a .js import to a shared .ts helper, and tsconfig forbids .ts import paths, so generateKeyPair cannot be promisified through a shared module here
const { privateKey } = generateKeyPairSync('rsa', {
  modulusLength: 2048,
  publicKeyEncoding: { type: 'spki', format: 'pem' },
  privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
});

process.env.GITHUB_APP_ID ||= '1';
process.env.GITHUB_WEBHOOK_SECRET ||= 'test-webhook-secret';
process.env.GITHUB_PRIVATE_KEY ||= privateKey;

// Disable Sentry in tests: with a DSN set, the nestjs-defaults reporter
// dynamically imports a runtime SDK that is not installed here. Blanking the
// DSN forces the no-op reporter.
process.env.SENTRY_DSN = '';

/**
 * Runs once before the suite. No external services are required, because
 * configuration is read from the environment and the tests run in-process.
 * @returns A promise that resolves once the setup has finished.
 * @example
 * // Jest calls this automatically through the globalSetup option.
 */
export default async function setup(): Promise<void> {
  // Nothing to start.
}
