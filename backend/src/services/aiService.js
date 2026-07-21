// ============================================================
//  AI Service abstraction
// ------------------------------------------------------------
//  The ONLY file that talks to an AI provider. The rest of the
//  app calls paraphrase()/summarize() and doesn't care which
//  provider is behind them.
//
//  Set AI_PROVIDER in .env to one of:
//    mock    -> canned result, no key, no cost (default)
//    gemini  -> Google Gemini (free tier available)  needs GEMINI_API_KEY
//    openai  -> OpenAI                                needs OPENAI_API_KEY
// ============================================================
import dotenv from 'dotenv';
dotenv.config();

const PROVIDER = (process.env.AI_PROVIDER || 'mock').toLowerCase();

// ---- Prompt builders ---------------------------------------
const STYLE_HINTS = {
  simple: 'Use simple, clear language that is easy to read.',
  academic: 'Use a formal academic tone suitable for university coursework.',
  professional: 'Use a polished, professional tone.',
  short: 'Make it more concise while keeping the meaning.',
};

function paraphrasePrompt(text, style) {
  const hint = STYLE_HINTS[style] || STYLE_HINTS.academic;
  return `Rewrite the following text to improve clarity and wording WITHOUT changing its meaning. ${hint} Return only the rewritten text, with no preamble.\n\nText:\n"""${text}"""`;
}

function summarizePrompt(text, type) {
  const map = {
    short: 'Write a short summary in 3-4 sentences.',
    detailed: 'Write a detailed summary covering all key points.',
    exam_notes: 'Produce concise exam-revision notes as bullet points.',
  };
  const instruction = map[type] || map.short;
  return `${instruction} Return only the summary.\n\nText:\n"""${text}"""`;
}

// ---- Provider callers --------------------------------------
async function callGemini(prompt) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error('GEMINI_API_KEY is not set in .env');
  const model = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
  });
  if (!res.ok) throw new Error(`Gemini API error: ${res.status} ${await res.text()}`);
  const data = await res.json();
  return data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
}

async function callOpenAI(prompt) {
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error('OPENAI_API_KEY is not set in .env');
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
    }),
  });
  if (!res.ok) throw new Error(`OpenAI API error: ${res.status} ${await res.text()}`);
  const data = await res.json();
  return data?.choices?.[0]?.message?.content?.trim() || '';
}

async function callGroq(prompt) {
  const key = process.env.GROQ_API_KEY;
  if (!key) throw new Error('GROQ_API_KEY is not set in .env');
  const model = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
    }),
  });
  if (!res.ok) throw new Error(`Groq API error: ${res.status} ${await res.text()}`);
  const data = await res.json();
  return data?.choices?.[0]?.message?.content?.trim() || '';
}

async function callProvider(prompt) {
  if (PROVIDER === 'gemini') return callGemini(prompt);
  if (PROVIDER === 'openai') return callOpenAI(prompt);
  if (PROVIDER === 'groq') return callGroq(prompt);
  return null; // mock
}

// ---- Multi-turn chat (system prompt + message history) -----
async function chatGroq(system, messages) {
  const key = process.env.GROQ_API_KEY;
  if (!key) throw new Error('GROQ_API_KEY is not set in .env');
  const model = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model,
      messages: [{ role: 'system', content: system }, ...messages],
      temperature: 0.7,
    }),
  });
  if (!res.ok) throw new Error(`Groq API error: ${res.status} ${await res.text()}`);
  const data = await res.json();
  return data?.choices?.[0]?.message?.content?.trim() || '';
}

async function chatOpenAI(system, messages) {
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error('OPENAI_API_KEY is not set in .env');
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [{ role: 'system', content: system }, ...messages],
    }),
  });
  if (!res.ok) throw new Error(`OpenAI API error: ${res.status} ${await res.text()}`);
  const data = await res.json();
  return data?.choices?.[0]?.message?.content?.trim() || '';
}

async function chatGemini(system, messages) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error('GEMINI_API_KEY is not set in .env');
  const model = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;
  const contents = messages.map((m) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }));
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ systemInstruction: { parts: [{ text: system }] }, contents }),
  });
  if (!res.ok) throw new Error(`Gemini API error: ${res.status} ${await res.text()}`);
  const data = await res.json();
  return data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
}

// Send a system prompt + conversation history; returns the reply, or null on mock.
export async function chat(system, messages) {
  if (PROVIDER === 'groq') return chatGroq(system, messages);
  if (PROVIDER === 'openai') return chatOpenAI(system, messages);
  if (PROVIDER === 'gemini') return chatGemini(system, messages);
  return null; // mock
}

// ---- Mock (no network, no cost) ----------------------------
function mockParaphrase(text, style) {
  return `[${style || 'academic'} rewrite — mock output]\n${text}`;
}

// ---- Public API --------------------------------------------
export async function paraphrase(text, style) {
  const result = await callProvider(paraphrasePrompt(text, style));
  return result || mockParaphrase(text, style);
}

// Returns the fully corrected text, or null on mock (caller falls back to rules).
export async function checkWriting(text) {
  const prompt =
    `Correct all spelling, grammar, and punctuation mistakes in the text below. ` +
    `Keep the original meaning and line breaks. ` +
    `Return ONLY the corrected text, with no explanations, quotes, or preamble.\n\nText:\n"""${text}"""`;
  return await callProvider(prompt); // null when AI_PROVIDER=mock
}

// Returns an AI summary, or null on mock (caller falls back to extractive).
export async function summarize(text, type) {
  return await callProvider(summarizePrompt(text, type));
}

// Research a topic. Returns a structured overview, or null on mock.
export async function research(topic, depth = 'deep') {
  const scope =
    depth === 'quick'
      ? 'Give a concise overview — a few short paragraphs covering the essentials.'
      : 'Provide a full, well-structured report with clear detail in each section.';
  const prompt =
    `Research the topic: "${topic}". ${scope}\n\n` +
    `Cover these sections, each under its own heading:\n` +
    `1. Definition / Overview\n` +
    `2. Key concepts or subfields\n` +
    `3. Historical background (if relevant)\n` +
    `4. Real-world applications\n` +
    `5. Important tools, technologies, or terms\n` +
    `6. Recommended resources to learn more\n\n` +
    `Format using markdown: use "## " for each section heading and "- " for bullet points. ` +
    `Use **bold** for key terms. Keep it clear, accurate, and suitable for a student. ` +
    `Start directly with the first heading — no preamble.`;
  return await callProvider(prompt);
}

// Rewrite text to read more naturally. Returns null on mock (caller falls back).
export async function humanize(text, level = 8) {
  const intensity =
    level >= 8 ? 'Rewrite it heavily, with maximum natural variation,'
    : level >= 5 ? 'Rewrite it moderately'
    : 'Lightly rewrite it';
  const prompt =
    `${intensity} so it reads like a real person wrote it, not an AI. ` +
    `Use everyday words, natural rhythm, and some contractions, while avoiding AI-cliché phrases ` +
    `(e.g. "moreover", "delve into", "it is important to note"). ` +
    `IMPORTANT: keep the SAME structure — the same paragraphs and line breaks, and the same ` +
    `number of sentences in the same order. Only reword each sentence in place; do not merge, ` +
    `split, reorder, add, or remove sentences. Keep the original meaning and language. ` +
    `Return ONLY the rewritten text.\n\nText:\n"""${text}"""`;
  return await callProvider(prompt);
}
