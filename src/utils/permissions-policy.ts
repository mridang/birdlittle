/**
 * @file Sets the Permissions-Policy header that switches off unused browser features.
 *
 * The Permissions-Policy header: every browser feature the OWASP Secure
 * Headers Project lists is switched off with an empty allowlist. The app uses
 * none of them. The same value is repeated in `public/_headers` for static
 * files, which bypass the Worker.
 */

/** The Permissions-Policy header value. */
export const PERMISSIONS_POLICY =
  'accelerometer=(), autoplay=(), camera=(), clipboard-read=(), clipboard-write=(), cross-origin-isolated=(), display-capture=(), encrypted-media=(), fullscreen=(), gamepad=(), geolocation=(), gyroscope=(), hid=(), idle-detection=(), interest-cohort=(), keyboard-map=(), magnetometer=(), microphone=(), midi=(), payment=(), picture-in-picture=(), publickey-credentials-get=(), screen-wake-lock=(), serial=(), sync-xhr=(), unload=(), usb=(), web-share=(), xr-spatial-tracking=()';

/**
 * Returns a copy of the response that carries the full Permissions-Policy header.
 * @param response - The response to add the header to.
 * @returns A new response with the same status, status text and body, and the Permissions-Policy header set.
 * @example
 * return withPermissionsPolicy(new Response('ok'));
 */
export function withPermissionsPolicy(response: Response): Response {
  const headers = new Headers(response.headers);
  headers.set('Permissions-Policy', PERMISSIONS_POLICY);
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}
