import pool from '../config/db.js';
import { research as aiResearch } from '../services/aiService.js';

// POST /api/tools/research   { topic, depth }
export async function createResearch(req, res, next) {
  try {
    const { topic } = req.body;
    const depth = req.body.depth === 'quick' ? 'quick' : 'deep';

    if (!topic || !topic.trim()) {
      return res.status(400).json({ message: 'Please enter a topic to research.' });
    }
    if (topic.length > 200) {
      return res.status(400).json({ message: 'Topic is too long (max 200 characters).' });
    }

    let content = null;
    try {
      content = await aiResearch(topic.trim(), depth);
    } catch (err) {
      return res.status(502).json({ message: `Research failed: ${err.message}` });
    }

    if (!content || !content.trim()) {
      return res.status(503).json({
        message: 'Research Assistant needs an AI provider. Please set one up in the backend .env.',
      });
    }

    await pool.query(
      'INSERT INTO research_history (user_id, topic, depth, content) VALUES (?, ?, ?, ?)',
      [req.user.id, topic.trim(), depth, content]
    );

    res.status(201).json({ topic: topic.trim(), depth, content });
  } catch (err) {
    next(err);
  }
}

// GET /api/tools/research/history
export async function getResearchHistory(req, res, next) {
  try {
    const [rows] = await pool.query(
      `SELECT id, topic, depth, content, created_date
       FROM research_history WHERE user_id = ?
       ORDER BY created_date DESC LIMIT 20`,
      [req.user.id]
    );
    res.json({ history: rows });
  } catch (err) {
    next(err);
  }
}
