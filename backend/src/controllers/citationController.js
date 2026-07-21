import pool from '../config/db.js';
import { formatCitation } from '../utils/citationFormatter.js';

const VALID_TYPES = ['book', 'journal', 'website'];
const VALID_STYLES = ['apa', 'mla', 'harvard'];

// POST /api/tools/citations   { sourceType, style, fields }
export async function createCitation(req, res, next) {
  try {
    const { sourceType, style, fields = {} } = req.body;

    if (!VALID_TYPES.includes(sourceType)) {
      return res.status(400).json({ message: 'Please choose a valid source type.' });
    }
    if (!VALID_STYLES.includes(style)) {
      return res.status(400).json({ message: 'Please choose a valid citation style.' });
    }
    if (!fields.title || !fields.title.trim()) {
      return res.status(400).json({ message: 'A title is required.' });
    }

    const citationText = formatCitation({ sourceType, style, fields });

    await pool.query(
      `INSERT INTO citations (user_id, source_type, citation_style, citation_text)
       VALUES (?, ?, ?, ?)`,
      [req.user.id, sourceType, style, citationText]
    );

    res.status(201).json({ citation: citationText, sourceType, style });
  } catch (err) {
    next(err);
  }
}

// GET /api/tools/citations
export async function getCitations(req, res, next) {
  try {
    const [rows] = await pool.query(
      `SELECT id, source_type, citation_style, citation_text, created_date
       FROM citations WHERE user_id = ? ORDER BY created_date DESC LIMIT 30`,
      [req.user.id]
    );
    res.json({ citations: rows });
  } catch (err) {
    next(err);
  }
}
