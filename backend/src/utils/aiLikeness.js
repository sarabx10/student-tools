// ============================================================
//  "AI-likeness" heuristic  (NOT a reliable detector)
// ------------------------------------------------------------
//  IMPORTANT: There is no accurate way to detect AI-generated
//  text. Even commercial tools produce many false positives.
//  This returns a ROUGH indicator based on simple signals, for
//  self-checking only — never as proof a text was AI-written.
// ============================================================

// Phrases that appear disproportionately in AI-generated text.
const AI_PHRASES = [
  'delve', 'moreover', 'furthermore', 'in conclusion', 'it is important to note',
  'it is worth noting', 'tapestry', 'navigating', 'realm', 'underscore',
  'multifaceted', "in today's world", 'plays a crucial role', 'plays a vital role',
  'a testament to', 'when it comes to', 'the world of', 'foster', 'leverage',
];

function splitSentences(text) {
  return text.split(/[.!?]+/).map((s) => s.trim()).filter((s) => s.length > 0);
}

function stdev(nums) {
  if (nums.length < 2) return 0;
  const mean = nums.reduce((a, b) => a + b, 0) / nums.length;
  const variance = nums.reduce((a, b) => a + (b - mean) ** 2, 0) / nums.length;
  return Math.sqrt(variance);
}

export function aiLikeness(text) {
  const signals = [];
  const lower = text.toLowerCase();

  // Signal 1: common AI phrases.
  const hits = AI_PHRASES.filter((p) => lower.includes(p));
  const phraseScore = Math.min(50, hits.length * 12);
  if (hits.length) signals.push(`Uses ${hits.length} phrase(s) common in AI text (e.g. "${hits[0]}")`);

  // Signal 2: sentence-length uniformity ("burstiness").
  // Human writing mixes short & long sentences; AI is often uniform.
  const sentences = splitSentences(text);
  let uniformityScore = 0;
  if (sentences.length >= 3) {
    const lengths = sentences.map((s) => s.split(/\s+/).length);
    const mean = lengths.reduce((a, b) => a + b, 0) / lengths.length;
    const cv = mean ? stdev(lengths) / mean : 0; // coefficient of variation
    uniformityScore = Math.max(0, Math.min(40, ((0.4 - cv) / 0.4) * 40));
    if (cv < 0.25) signals.push('Sentences are unusually uniform in length');
  }

  const score = Math.min(95, Math.round(phraseScore + uniformityScore));
  const label = score < 30 ? 'Low' : score < 60 ? 'Medium' : 'High';
  if (!signals.length) signals.push('No strong AI-like signals detected');

  return { score, label, signals };
}
