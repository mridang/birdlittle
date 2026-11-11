import AdmZip from 'adm-zip';

export function getZipFile(buffer: Buffer, fileName: string): string {
  const zipEntry = new AdmZip(buffer).getEntry(fileName);
  if (zipEntry) {
    return zipEntry.getData().toString('utf8');
  } else {
    throw new Error(`${fileName} not found in the ZIP archive.`);
  }
}
