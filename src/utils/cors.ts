/**
 * @packageDocumentation
 *
 * The app is a server-rendered page plus a server-to-server webhook, so no
 * other website needs to call it from a browser. The shared defaults enable
 * CORS with credentials, which echoes any requesting origin back with
 * `Access-Control-Allow-Credentials: true`. That lets any site make credentialed
 * requests, so every `Access-Control-*` header is removed from responses and
 * browsers fall back to the same-origin policy.
 */

/** Returns the response without any `Access-Control-*` headers. */
export function withoutCors(response: Response): Response {
  const headers = new Headers(response.headers);
  for (const name of headers.keys()) {
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
