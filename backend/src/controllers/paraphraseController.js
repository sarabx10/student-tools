import pool from '../config/db.js';
import { paraphrase as aiParaphrase } from '../services/aiService.js';

const VALID_STYLES = ['simple', 'academic', 'professional', 'short'];
const MAX_LEN = 5000;

// POST /api/tools/paraphrase   { text, style }
export async function createParaphrase(req, res, next) {
  try {
    const { text, style } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ message: 'Please enter some text to rewrite.' });
    }
    if (text.length > MAX_LEN) {
      return res.status(400).json({ message: `Text is too long (max ${MAX_LEN} characters).` });
    }
    const chosenStyle = VALID_STYLES.includes(style) ? style : 'academic';

    const rewritten = await aiParaphrase(text, chosenStyle);

    // Save to history.
    const [result] = await pool.query(
      `INSERT INTO paraphrase_history (user_id, original_text, rewritten_text, style)
       VALUES (?, ?, ?, ?)`,
      [req.user.id, text, rewritten, chosenStyle]
    );

    res.status(201).json({
      id: result.insertId,
      original_text: text,
      rewritten_text: rewritten,
      style: chosenStyle,
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/tools/paraphrase/history
export async function getParaphraseHistory(req, res, next) {
  try {
    const [rows] = await pool.query(
      `SELECT id, original_text, rewritten_text, style, created_date
       FROM paraphrase_history
       WHERE user_id = ?
       ORDER BY created_date DESC
       LIMIT 20`,
      [req.user.id]
    );
    res.json({ history: rows });
  } catch (err) {
    next(err);
  }
}
