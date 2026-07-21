// ============================================================
//  Humanizer (offline rewrite + human-likeness estimate)
// ------------------------------------------------------------
//  Rewrites text to read more naturally and estimates how
//  "human" it reads. The score is a ROUGH HEURISTIC — not a
//  real AI detector. No tool can reliably detect or hide AI text.
// ============================================================

// AI-cliché phrase -> simpler, more natural wording.
const PHRASE_MAP = {
  'it is important to note that ': '',
  'it is worth noting that ': '',
  'it should be noted that ': '',
  'in today\'s world': 'these days',
  'a wide range of': 'many',
  'a variety of': 'many',
  'due to the fact that': 'because',
  'in the event that': 'if',
  'in order to': 'to',
  'plays a crucial role in': 'is key to',
  'plays a vital role in': 'is key to',
  'delve into': 'look at',
  'delving into': 'looking at',
  moreover: 'also',
  furthermore: 'also',
  additionally: 'also',
  however: 'but',
  nevertheless: 'still',
  therefore: 'so',
  thus: 'so',
  hence: 'so',
  consequently: 'so',
  subsequently: 'later',
  utilize: 'use',
  utilized: 'used',
  numerous: 'many',
  commence: 'start',
  endeavor: 'try',
  facilitate: 'help',
};

// Full-verb-phrase -> contraction (more casual = reads more human).
const CONTRACTIONS = [
  [/\bit is\b/gi, "it's"], [/\bthat is\b/gi, "that's"], [/\bthere is\b/gi, "there's"],
  [/\bdo not\b/gi, "don't"], [/\bdoes not\b/gi, "doesn't"], [/\bdid not\b/gi, "didn't"],
  [/\bcan not\b/gi, "can't"], [/\bcannot\b/gi, "can't"], [/\bwill not\b/gi, "won't"],
  [/\bis not\b/gi, "isn't"], [/\bare not\b/gi, "aren't"], [/\bwould not\b/gi, "wouldn't"],
  [/\bcould not\b/gi, "couldn't"], [/\bshould not\b/gi, "shouldn't"], [/\bhave not\b/gi, "haven't"],
  [/\bthey are\b/gi, "they're"], [/\bwe are\b/gi, "we're"], [/\byou are\b/gi, "you're"],
];

const AI_PHRASES = [
  'moreover', 'furthermore', 'in addition', 'however', 'therefore', 'thus', 'hence',
  'utilize', 'numerous', 'delve', 'it is important to note', 'it is worth noting',
  'plays a crucial role', 'plays a vital role', "in today's world", 'a wide range of',
  'commence', 'endeavor', 'facilitate', 'subsequently', 'consequently', 'in conclusion',
];

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
function matchCase(match, replacement) {
  if (!replacement) return replacement;
  if (match[0] === match[0].toUpperCase()) return replacement[0].toUpperCase() + replacement.slice(1);
  return replacement;
}

export function humanizeText(text, level = 8) {
  let out = text;

  // 1. Replace AI-cliché phrases (always).
  for (const [from, to] of Object.entries(PHRASE_MAP)) {
    const re = new RegExp(escapeRegex(from), 'gi');
    out = out.replace(re, (m) => matchCase(m, to));
  }

  // 2. Add contractions (level >= 3).
  if (level >= 3) {
    for (const [re, to] of CONTRACTIONS) {
      out = out.replace(re, (m) => matchCase(m, to));
    }
  }

  // 3. Drop hedging filler adverbs (level >= 6).
  //    Skip when followed by much/many/few/little so we don't wreck
  //    common phrases like "very much" -> "much".
  if (level >= 6) {
    out = out.replace(/\b(very|really|quite|actually|basically|simply)[ \t]+(?!much|many|few|little)/gi, '');
  }

  // 4. Tidy spacing/punctuation and re-capitalize sentences.
  //    Only touch spaces/tabs — never newlines — so paragraph
  //    structure is preserved exactly.
  out = out
    .replace(/[ \t]{2,}/g, ' ')
    .replace(/[ \t]+([,.!?;:])/g, '$1')
    .replace(/(^\s*|[.!?]\s+)([a-z])/g, (m, lead, l) => lead + l.toUpperCase())
    .trim();

  return out;
}

// ---- Human-likeness estimate (heuristic only) --------------
function splitSentences(text) {
  return (text.replace(/\s+/g, ' ').match(/[^.!?]+[.!?]*/g) || [])
    .map((s) => s.trim())
    .filter(Boolean);
}

export function humanScoreForSentence(s) {
  const lower = s.toLowerCase();
  let ai = 0;
  for (const p of AI_PHRASES) if (lower.includes(p)) ai += 18;
  const wc = (s.match(/\S+/g) || []).length;
  if (wc >= 30) ai += 12;
  else if (wc >= 22) ai += 6;
  if (/(n't|'re|'ll|'ve|'m|it's|that's|there's)/i.test(s)) ai -= 18; // contractions read human
  const human = Math.max(5, Math.min(95, 65 - ai));
  return human;
}

export function scoreSentences(text) {
  return splitSentences(text).map((s) => {
    const human = humanScoreForSentence(s);
    return { text: s, human, isAI: human < 50 };
  });
}

// Same as scoreSentences but keeps the paragraph structure:
// returns an array of paragraphs, each an array of scored sentences.
export function scoreParagraphs(text) {
  return text
    .split(/\n+/)
    .map((para) => para.trim())
    .filter(Boolean)
    .map((para) =>
      splitSentences(para).map((s) => {
        const human = humanScoreForSentence(s);
        return { text: s, human, isAI: human < 50 };
      })
    );
}

export function scoreText(text) {
  const sents = scoreSentences(text);
  const human = sents.length
    ? Math.round(sents.reduce((a, b) => a + b.human, 0) / sents.length)
    : 60;
  const label = human >= 70 ? 'Reads human' : human >= 45 ? 'Mixed' : 'Reads like AI';
  return { human, label };
}
