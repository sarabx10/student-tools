// ============================================================
//  Rule + dictionary based writing checker (no AI, no cost)
// ------------------------------------------------------------
//  Uses a full English dictionary (nspell) to catch ANY
//  misspelled word, plus mechanical grammar rules. Everything
//  it finds is fixed in the returned "corrected" text.
//
//  For deeper grammar (tense, structure, word choice) set
//  AI_PROVIDER=gemini/openai and the controller uses AI instead.
// ============================================================
import { getSpell } from './spell.js';

// Informal contractions -> proper form (nspell leaves these alone).
const CONTRACTIONS = {
  im: "I'm", dont: "don't", cant: "can't", wont: "won't", didnt: "didn't",
  doesnt: "doesn't", isnt: "isn't", wasnt: "wasn't", couldnt: "couldn't",
  shouldnt: "shouldn't", wouldnt: "wouldn't", ive: "I've", youre: "you're",
  theyre: "they're", weve: "we've", thats: "that's", whats: "what's", lets: "let's",
};

function preserveCap(original, fixed) {
  if (original[0] === original[0].toUpperCase() && /[a-z]/.test(fixed[0])) {
    return fixed[0].toUpperCase() + fixed.slice(1);
  }
  return fixed;
}

export async function correctWriting(text) {
  const spell = getSpell();

  // 1. Word-level: fix contractions + any misspelled lowercase word.
  //    We only spell-correct fully-lowercase words so we don't mangle
  //    names/acronyms like "Ali", "Madam", or "APU".
  let corrected = text.replace(/[A-Za-z']+/g, (word) => {
    const lower = word.toLowerCase();

    if (CONTRACTIONS[lower]) {
      return preserveCap(word, CONTRACTIONS[lower]);
    }
    if (/^[a-z]{2,}$/.test(word) && !spell.correct(word)) {
      const suggestions = spell.suggest(word);
      if (suggestions.length) return suggestions[0];
    }
    return word;
  });

  // 2. Mechanical grammar/format fixes.
  corrected = corrected
    .replace(/[ \t]{2,}/g, ' ')                 // collapse repeated spaces
    .replace(/\s+([,.!?;:])/g, '$1')            // no space before punctuation
    .replace(/([,.!?;:])(?=[A-Za-z])/g, '$1 ')  // one space after punctuation
    .replace(/\b(\w+)(\s+)\1\b/gi, '$1')        // duplicate words: "the the" -> "the"
    .replace(/\bi\b/g, 'I')                      // standalone i -> I
    .replace(/(^\s*|[.!?]\s+)([a-z])/g, (m, lead, l) => lead + l.toUpperCase()); // capitalize sentences

  return corrected;
}
