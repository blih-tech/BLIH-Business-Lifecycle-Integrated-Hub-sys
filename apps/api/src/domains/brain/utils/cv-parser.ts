const pdf = require('pdf-parse');

export async function parseCv(buffer: Buffer): Promise<string> {
  try {
    
    const data = await pdf(buffer);
    return data.text;
  } catch (error) {
    throw new Error(`Failed to parse PDF: ${error.message}`);
  }
}