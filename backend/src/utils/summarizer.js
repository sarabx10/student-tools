// ============================================================
//  Extractive summarizer (no AI, no cost)
// ------------------------------------------------------------
//  Ranks sentences by how many "important" words they contain
//  (word-frequency scoring, ignoring common stop-words) and
//  returns the top sentences in their original order.
//
//  For abstractive summaries (rewritten in the AI's own words)
//  set AI_PROVIDER=gemini/openai — the controller uses AI then.
// ============================================================

const STOPWORDS = new Set(
  ('a about above after again against all am an and any are aren\'t as at be because been before being below ' +
    'between both but by can\'t cannot could couldn\'t did didn\'t do does doesn\'t doing don\'t down during each ' +
    'few for from further had hadn\'t has hasn\'t have haven\'t having he he\'d he\'ll he\'s her here here\'s hers ' +
    'herself him himself his how how\'s i i\'d i\'ll i\'m i\'ve if in into is isn\'t it it\'s its itself let\'s me ' +
    'more most mustn\'t my myself no nor not of off on once only or other ought our ours ourselves out over own same ' +
    'shan\'t she she\'d she\'ll she\'s should shouldn\'t so some such than that that\'s the their theirs them ' +
    'themselves then there there\'s these they they\'d they\'ll they\'re they\'ve this those through to too under ' +
    'until up very was wasn\'t we we\'d we\'ll we\'re we\'ve were weren\'t what what\'s when when\'s where where\'s ' +
    'which while who who\'s whom why why\'s with won\'t would wouldn\'t you you\'d you\'ll you\'re you\'ve your ' +
    'yours yourself yourselves').split(' ')
);

function splitSentences(text) {
  // Split on sentence-ending punctuation followed by a space/newline.
  return text
    .replace(/\s+/g, ' ')
    .match(/[^.!?]+[.!?]+|\S+$/g) // sentences, plus any trailing fragment
    ?.map((s) => s.trim())
    .filter((s) => s.length > 0) || [];
}

function words(text) {
  return (text.toLowerCase().match(/[a-z']+/g) || []);
}

function sentenceCount(type, total) {
  if (type === 'short') return Math.max(1, Math.min(3, Math.ceil(total * 0.15)));
  if (type === 'exam_notes') return Math.max(3, Math.min(8, Math.ceil(total * 0.3)));
  // detailed
  return Math.max(3, Math.ceil(total * 0.4));
}

export function extractiveSummarize(text, type = 'short') {
  const sentences = splitSentences(text);
  if (sentences.length <= 2) return text.trim();

  // Build normalized word-frequency table (ignoring stop-words).
  const freq = {};
  for (const w of words(text)) {
    if (w.length > 2 && !STOPWORDS.has(w)) freq[w] = (freq[w] || 0) + 1;
  }
  const max = Math.max(1, ...Object.values(freq));

  // Score each sentence = average importance of its content words.
  const scored = sentences.map((s, i) => {
    const ws = words(s).filter((w) => freq[w]);
    const score = ws.length ? ws.reduce((sum, w) => sum + freq[w] / max, 0) / ws.length : 0;
    return { i, s, score };
  });

  const n = sentenceCount(type, sentences.length);
  const top = [...scored]
    .sort((a, b) => b.score - a.score)
    .slice(0, n)
    .sort((a, b) => a.i - b.i); // restore original order

  if (type === 'exam_notes') return top.map((t) => `• ${t.s}`).join('\n');
  return top.map((t) => t.s).join(' ');
}
