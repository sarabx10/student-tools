import fs from 'fs/promises';
import pool from '../config/db.js';
import { summarize as aiSummarize } from '../services/aiService.js';
import { extractiveSummarize } from '../utils/summarizer.js';
import { extractText } from '../utils/extractText.js';

const VALID_TYPES = ['short', 'detailed', 'exam_notes'];
const MAX_CHARS = 30000;

const countWords = (t) => (t.trim().match(/\S+/g) || []).length;

// POST /api/tools/summarize   (multipart: optional file + fields: text, summaryType)
export async function createSummary(req, res, next) {
  let uploadedPath = req.file?.path;
  try {
    const summaryType = VALID_TYPES.includes(req.body.summaryType) ? req.body.summaryType : 'short';
    let text = '';
    let fileName = null;

    if (req.file) {
      fileName = req.file.originalname;
      text = await extractText(req.file);
    } else if (req.body.text) {
      text = req.body.text;
    }

    if (!text || !text.trim()) {
      return res.status(400).json({ message: 'Please upload a file with readable text, or paste some text.' });
    }
    if (text.trim().length < 40) {
      return res.status(400).json({ message: 'The text is too short to summarize.' });
    }

    // Guard the AI/token cost + keep it responsive.
    const clipped = text.slice(0, MAX_CHARS);

    // AI first, fall back to the built-in extractive summarizer.
    let summary = null;
    let source = 'extractive';
    try {
      const ai = await aiSummarize(clipped, summaryType);
      if (ai && ai.trim()) {
        summary = ai.trim();
        source = 'ai';
      }
    } catch {
      /* fall back below */
    }
    if (!summary) summary = extractiveSummarize(clipped, summaryType);

    // Save to history.
    await pool.query(
      `INSERT INTO summaries (user_id, file_name, summary, summary_type) VALUES (?, ?, ?, ?)`,
      [req.user.id, fileName, summary, summaryType]
    );

    res.status(201).json({
      summary,
      summaryType,
      source,
      fileName,
      originalWords: countWords(text),
      summaryWords: countWords(summary),
    });
  } catch (err) {
    next(err);
  } finally {
    // Always remove the uploaded file once processed.
    if (uploadedPath) fs.unlink(uploadedPath).catch(() => {});
  }
}

// GET /api/tools/summaries
export async function getSummaries(req, res, next) {
  try {
    const [rows] = await pool.query(
      `SELECT id, file_name, summary, summary_type, created_date
       FROM summaries WHERE user_id = ? ORDER BY created_date DESC LIMIT 20`,
      [req.user.id]
    );
    res.json({ summaries: rows });
  } catch (err) {
    next(err);
  }
}
