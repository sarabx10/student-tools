// ============================================================
//  Extract plain text from an uploaded file.
//  Supports: PDF, Word .docx, and .txt
// ============================================================
import fs from 'fs/promises';
import { PDFParse } from 'pdf-parse';
import mammoth from 'mammoth';

export async function extractText(file) {
  const { mimetype, path } = file;

  if (mimetype === 'application/pdf') {
    const buffer = await fs.readFile(path);
    const parser = new PDFParse({ data: new Uint8Array(buffer) });
    try {
      const result = await parser.getText();
      // Strip pdf-parse's "-- N of M --" page separators.
      return (result.text || '').replace(/--\s*\d+\s*of\s*\d+\s*--/g, '\n').trim();
    } finally {
      await parser.destroy();
    }
  }

  if (mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    const { value } = await mammoth.extractRawText({ path });
    return value;
  }

  if (mimetype === 'text/plain') {
    return await fs.readFile(path, 'utf8');
  }

  if (mimetype === 'application/msword') {
    const err = new Error('Old .doc files are not supported. Please upload a PDF, .docx, or .txt file.');
    err.status = 400;
    throw err;
  }

  const err = new Error('Unsupported file type.');
  err.status = 400;
  throw err;
}
