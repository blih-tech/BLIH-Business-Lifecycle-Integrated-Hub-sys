// This version is patched to work with modern Node.js class constructors
const pdf = require('pdf-parse-debugging-disabled');

export async function parseCv(buffer: Buffer): Promise<string> {
  try {
    // Standard library call now works without the 'gr' error
    const data = await pdf(buffer);
    
    if (!data || !data.text) {
      throw new Error("PDF was parsed but no text was found.");
    }

    return data.text;
  } catch (error) {
    console.error("PDF PARSER ERROR:", error.message);
    throw new Error(`Failed to parse PDF: ${error.message}`);
  }
}