/**
 * @file Sends responses without CORS headers, so no other site gets credentialed access.
 *
 * The app is a server-rendered page plus a server-to-server webhook, so no
 * other website needs to call it from a browser. The shared defaults enable
 * CORS with credentials, which echoes any requesting origin back with
 * `Access-Control-Allow-Credentials: true`. That lets any site make credentialed
 * requests, so every `Access-Control-*` header is removed from responses and
 * browsers fall back to the same-origin policy.
 */

/**
 * Returns a copy of the response with every `Access-Control-*` header removed.
 * @param response - The response to strip CORS headers from.
 * @returns A new response with the same status, status text and body, but no CORS headers.
 * @example
 * return withoutCors(await fetch(request));
 */
export function withoutCors(response: Response): Response {
  const headers = new Headers(response.headers);
  const names = [...headers.keys()];
  for (const name of names) {
    if (name.startsWith('access-control-')) {
      headers.delete(name);
    }
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}
