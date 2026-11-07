/**
 * @packageDocumentation
 *
 * The Permissions-Policy header: every browser feature the OWASP Secure
 * Headers Project lists is switched off with an empty allowlist. The app uses
 * none of them. The same value is repeated in `public/_headers` for static
 * files, which bypass the Worker.
 */

/** The Permissions-Policy header value. */
export const PERMISSIONS_POLICY =
  'accelerometer=(), autoplay=(), camera=(), clipboard-read=(), clipboard-write=(), cross-origin-isolated=(), display-capture=(), encrypted-media=(), fullscreen=(), gamepad=(), geolocation=(), gyroscope=(), hid=(), idle-detection=(), interest-cohort=(), keyboard-map=(), magnetometer=(), microphone=(), midi=(), payment=(), picture-in-picture=(), publickey-credentials-get=(), screen-wake-lock=(), serial=(), sync-xhr=(), unload=(), usb=(), web-share=(), xr-spatial-tracking=()';

/** Returns the response with the full Permissions-Policy header. */
export function withPermissionsPolicy(response: Response): Response {
  const headers = new Headers(response.headers);
  headers.set('Permissions-Policy', PERMISSIONS_POLICY);
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}
