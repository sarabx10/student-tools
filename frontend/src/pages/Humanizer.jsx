import { useState } from 'react';
import api from '../lib/api.js';

const LEVEL_DESC = (l) =>
  l <= 2 ? 'Light touch-up' : l <= 4 ? 'Light rewrite'
  : l <= 6 ? 'Moderate rewrite' : l <= 8 ? 'Heavy rewrite with more variation'
  : 'Maximum rewrite';

const wordCount = (t) => (t.trim().match(/\S+/g) || []).length;

function ScoreRing({ score, title, subtitle }) {
  const color = score.human >= 70 ? '#059669' : score.human >= 45 ? '#d97706' : '#dc2626';
  return (
    <div className="text-center">
      {title && <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">{title}</p>}
      <div
        className="mx-auto flex h-28 w-28 items-center justify-center rounded-full"
        style={{ background: `conic-gradient(${color} ${score.human * 3.6}deg, #e5e7eb 0)` }}
      >
        <div className="flex h-20 w-20 flex-col items-center justify-center rounded-full bg-white">
          <span className="text-2xl font-bold" style={{ color }}>{score.human}%</span>
          <span className="text-[10px] text-gray-400">human</span>
        </div>
      </div>
      <p className="mt-2 text-sm font-medium" style={{ color }}>{score.label}</p>
      {subtitle && <p className="text-xs text-gray-400">{subtitle}</p>}
    </div>
  );
}

export default function Humanizer() {
  const [text, setText] = useState('');
  const [level, setLevel] = useState(8);
  const [result, setResult] = useState(null); // { humanized, sentences, beforeScore, afterScore, source }
  const [checkScore, setCheckScore] = useState(null);
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  async function handleCheck() {
    setError('');
    if (!text.trim()) return setError('Please paste some text first.');
    setResult(null); // clear any previous humanize result so the check score shows
    setCheckScore(null);
    setBusy('check');
    try {
      const res = await api.post('/tools/humanize/check', { text });
      setCheckScore(res.data.score);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not reach the server. Is the backend running?');
    } finally {
      setBusy('');
    }
  }

  async function handleHumanize() {
    setError('');
    setResult(null);
    setCheckScore(null);
    if (!text.trim()) return setError('Please paste some text first.');
    setBusy('humanize');
    try {
      const res = await api.post('/tools/humanize', { text, level });
      setResult(res.data);
      setCheckScore(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not reach the server. Is the backend running?');
    } finally {
      setBusy('');
    }
  }

  function copyResult() {
    navigator.clipboard.writeText(result.humanized);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  const words = wordCount(text);

  return (
    <div>
      <h1 className="text-2xl font-bold">Humanizer</h1>
      <p className="text-gray-600">Rewrite text so it reads more naturally, and see which parts sound AI-like.</p>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        {/* Main editor */}
        <div className="space-y-4 lg:col-span-2">
          <div className="card space-y-4">
            {error && <p className="rounded bg-red-50 p-2 text-sm text-red-600">{error}</p>}

            {/* Level */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium">Level</span>
              {Array.from({ length: 10 }, (_, i) => i + 1).map((l) => (
                <button
                  key={l}
                  onClick={() => setLevel(l)}
                  className={`h-8 w-8 rounded text-sm ${level === l ? 'bg-indigo-600 text-white' : 'border border-gray-300 hover:bg-gray-100'}`}
                >
                  {l}
                </button>
              ))}
              <span className="text-sm text-gray-500">{LEVEL_DESC(level)}</span>
            </div>

            <textarea
              className="input min-h-[280px]"
              placeholder="Paste your text here…"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />

            <div className="flex items-center justify-between">
              <span className={`text-xs ${words > 1000 ? 'text-red-500' : 'text-gray-400'}`}>{words} / 1000 words</span>
              <div className="flex gap-2">
                <button
                  onClick={handleCheck}
                  disabled={busy}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm hover:bg-gray-100 disabled:opacity-50"
                >
                  {busy === 'check' ? 'Checking…' : '🔍 Check for AI'}
                </button>
                <button onClick={handleHumanize} disabled={busy} className="btn-primary">
                  {busy === 'humanize' ? 'Humanizing…' : '✨ Humanize'}
                </button>
              </div>
            </div>
          </div>

          {/* Highlighted result */}
          {result && (
            <div className="card">
              <div className="mb-2 flex items-center justify-between">
                <h2 className="font-semibold">Humanized text</h2>
                <button onClick={copyResult} className="text-sm text-indigo-600 hover:underline">
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <div className="leading-relaxed">
                {result.paragraphs.map((para, pi) => (
                  <p key={pi} className="mb-3 last:mb-0">
                    {para.map((s, i) => (
                      <span
                        key={i}
                        className={`rounded px-0.5 ${s.isAI ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-900'}`}
                      >
                        {s.text}{' '}
                      </span>
                    ))}
                  </p>
                ))}
              </div>
              <p className="mt-3 text-xs text-gray-400">
                <span className="rounded bg-green-100 px-1">Green</span> = reads natural ·{' '}
                <span className="rounded bg-red-100 px-1">Red</span> = still reads AI-like ·{' '}
                {result.source === 'ai' ? 'rewritten with AI' : 'rewritten with the built-in engine (add a Gemini key for stronger rewrites)'}
              </p>
            </div>
          )}
        </div>

        {/* Detection score sidebar */}
        <div className="card h-fit">
          <h2 className="mb-4 font-semibold">Detection Score</h2>
          {result ? (
            <div className="space-y-4">
              <ScoreRing score={result.beforeScore} title="Original" />
              <div className="text-center text-gray-300">↓</div>
              <ScoreRing score={result.afterScore} title="Humanized" />
            </div>
          ) : checkScore ? (
            <ScoreRing score={checkScore} />
          ) : (
            <p className="py-8 text-center text-sm text-gray-400">
              Click “Check for AI” to estimate your text, or “Humanize” to rewrite it.
            </p>
          )}

          <p className="mt-4 rounded bg-amber-50 p-2 text-xs text-amber-800">
            ⚠️ This score is a rough estimate, not a real AI detector. No tool can reliably detect or hide AI-written text — don’t rely on it to pass academic checks.
          </p>
        </div>
      </div>
    </div>
  );
}
