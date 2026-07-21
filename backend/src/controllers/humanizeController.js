import pool from '../config/db.js';
import { humanize as aiHumanize } from '../services/aiService.js';
import { humanizeText, scoreText, scoreParagraphs } from '../utils/humanizer.js';
import { correctWriting } from '../utils/writingChecker.js';
import { isRealText } from '../utils/spell.js';

const NOT_REAL_TEXT = 'Sorry, this doesn’t look like real text that can be humanized. Please enter proper sentences.';

const MAX_LEN = 8000;

// POST /api/tools/humanize   { text, level }
export async function humanizeHandler(req, res, next) {
  try {
    const { text } = req.body;
    let level = Number(req.body.level) || 8;
    level = Math.max(1, Math.min(10, level));

    if (!text || !text.trim()) {
      return res.status(400).json({ message: 'Please paste some text first.' });
    }
    if (text.length > MAX_LEN) {
      return res.status(400).json({ message: `Text is too long (max ${MAX_LEN} characters).` });
    }
    if (!isRealText(text)) {
      return res.status(400).json({ message: NOT_REAL_TEXT });
    }

    let humanized = null;
    let source = 'rules';
    try {
      const ai = await aiHumanize(text, level);
      if (ai && ai.trim()) {
        humanized = ai.trim();
        source = 'ai';
      }
    } catch {
      /* fall back below */
    }
    if (!humanized) {
      // Offline path: fix spelling/grammar first, then humanize.
      const corrected = await correctWriting(text);
      humanized = humanizeText(corrected, level);
    }

    // Save to history (reuse the paraphrase table with a 'humanized' style).
    await pool.query(
      `INSERT INTO paraphrase_history (user_id, original_text, rewritten_text, style)
       VALUES (?, ?, ?, 'humanized')`,
      [req.user.id, text, humanized]
    );

    res.status(201).json({
      original: text,
      humanized,
      source,
      beforeScore: scoreText(text),
      afterScore: scoreText(humanized),
      paragraphs: scoreParagraphs(humanized),
    });
  } catch (err) {
    next(err);
  }
}

// POST /api/tools/humanize/check   { text }   -> just the estimate
export async function checkHandler(req, res, next) {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ message: 'Please paste some text first.' });
    }
    if (!isRealText(text)) {
      return res.status(400).json({ message: NOT_REAL_TEXT });
    }
    res.json({ score: scoreText(text) });
  } catch (err) {
    next(err);
  }
}
