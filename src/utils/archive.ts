/**
 * @file Reads a single text entry out of an in-memory ZIP archive.
 */
import AdmZip from 'adm-zip';

/**
 * Reads one entry from a ZIP archive held in memory and decodes it as UTF-8 text.
 * @param buffer - The bytes of the ZIP archive.
 * @param fileName - The path of the entry inside the archive.
 * @returns The entry's contents decoded as UTF-8.
 * @throws {Error} When the archive has no entry called `fileName`.
 * @example
 * const manifest = getZipFile(zipBytes, 'manifest.json');
 */
export function getZipFile(buffer: Buffer, fileName: string): string {
  const zipEntry = new AdmZip(buffer).getEntry(fileName);
  if (zipEntry) {
    return zipEntry.getData().toString('utf8');
  } else {
    throw new Error(`${fileName} not found in the ZIP archive.`);
  }
}
