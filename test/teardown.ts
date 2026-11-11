/**
 * @file Jest global teardown; the suite starts no external services to stop.
 */

/**
 * Runs once after the suite. The suite starts no external services, so there
 * is nothing to tear down.
 * @returns A promise that resolves once the teardown has finished.
 * @example
 * // Jest calls this automatically through the globalSetup option.
 */
export default async function teardown(): Promise<void> {
  // Nothing to tear down.
}
