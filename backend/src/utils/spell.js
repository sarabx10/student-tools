// ============================================================
//  Shared spell checker (one dictionary instance, reused).
// ============================================================
import nspell from 'nspell';
import dictionary from 'dictionary-en';

let speller = null;
export function getSpell() {
  if (!speller) speller = nspell(dictionary);
  return speller;
}

// Fraction of alphabetic words that are real English words (0–1).
export function realWordRatio(text) {
  const spell = getSpell();
  const words = text.toLowerCase().match(/[a-z]+/g) || [];
  if (!words.length) return 0;
  const valid = words.filter((w) => spell.correct(w)).length;
  return valid / words.length;
}

// Does this look like real language we can work with?
// Rejects gibberish like "fddfhklgdflkhgf".
export function isRealText(text) {
  const words = text.match(/[A-Za-z]+/g) || [];
  if (words.length === 0) return false; // no words at all
  return realWordRatio(text) >= 0.4;    // at least 40% real words
}
