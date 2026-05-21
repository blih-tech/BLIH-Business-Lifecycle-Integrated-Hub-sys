// This version uses ES module import for modern Node.js compatibility
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore -- no types available for pdf-parse-debugging-disabled
import pdf from 'pdf-parse-debugging-disabled';

export async function parseCv(buffer: Buffer): Promise<string> {
  try {
    // Standard library call now works without the 'gr' error
    const data = await pdf(buffer);

    if (!data || !data.text) {
      throw new Error('PDF was parsed but no text was found.');
    }

    return data.text;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('PDF PARSER ERROR:', message);
    throw new Error(`Failed to parse PDF: ${message}`);
  }
}
