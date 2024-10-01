import crypto from 'crypto';

/**
 * Computes the MD5 hash of a given input.
 * @param input - The input string to hash.
 * @returns The MD5 hash as a hexadecimal string.
 */
export function hashMd5(input: string): string {
  return crypto.createHash('md5').update(input, 'utf8').digest('hex');
}

/**
 * Computes HMAC SHA256 signature of a given input using a secret key.
 * @param key - The secret key for HMAC.
 * @param input - The input string to sign.
 * @returns The HMAC SHA256 signature as a hexadecimal string.
 */
export function hmacSha256(key: string, input: string): string {
  return crypto.createHmac('sha256', key).update(input).digest('hex');
}
