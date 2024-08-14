import { expect } from '@jest/globals';
import AdmZip from 'adm-zip';
import { getZipFile } from '../../src/utils/archive';

describe('getZipFile', () => {
  test('extracts and returns the content of a file from a ZIP buffer', () => {
    const zip = new AdmZip();

    const fileName = 'test.txt';
    const fileContent = 'Hello, world!';
    zip.addFile(fileName, Buffer.from(fileContent, 'utf8'));

    const buffer = zip.toBuffer();

    expect(getZipFile(buffer, fileName)).toBe(fileContent);
  });

  test('throws an error if the file does not exist in the ZIP archive', () => {
    const zip = new AdmZip();
    const buffer = zip.toBuffer();
    const nonExistentFileName = 'nonexistent.txt';

    expect(() => getZipFile(buffer, nonExistentFileName)).toThrow(
      `${nonExistentFileName} not found in the ZIP archive.`,
    );
  });
});
