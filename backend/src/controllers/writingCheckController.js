import { checkWriting } from '../services/aiService.js';
import { correctWriting } from '../utils/writingChecker.js';
import { aiLikeness } from '../utils/aiLikeness.js';
import { isRealText } from '../utils/spell.js';

const MAX_LEN = 8000;

// POST /api/tools/writing-check   { text }
// Returns { original, corrected, source, aiCheck }
export async function checkWritingHandler(req, res, next) {
  try {
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ message: 'Please enter your essay first.' });
    }
    if (text.length > MAX_LEN) {
      return res.status(400).json({ message: `Text is too long (max ${MAX_LEN} characters).` });
    }
    if (!isRealText(text)) {
      return res.status(400).json({
        message: 'Sorry, this doesn’t look like real text that can be checked. Please enter proper sentences.',
      });
    }

    let corrected = null;
    let source = 'rules';

    // Try AI first; fall back to the dictionary checker if it isn't configured.
    try {
      const ai = await checkWriting(text);
      if (ai && ai.trim()) {
        corrected = ai.trim();
        source = 'ai';
      }
    } catch {
      /* fall back below */
    }

    if (!corrected) {
      corrected = await correctWriting(text);
      source = 'rules';
    }

    res.json({
      original: text,
      corrected,
      source,
      aiCheck: aiLikeness(text),
    });
  } catch (err) {
    next(err);
  }
}
