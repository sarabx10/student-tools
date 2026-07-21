import { useState } from 'react';
import api from '../lib/api.js';
import { diffTokens, buildChanges } from '../lib/diff.js';

const isSpace = (t) => /^\s+$/.test(t);

export default function Similarity() {
  const [text, setText] = useState('');
  const [data, setData] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  async function handleCheck() {
    setError('');
    setData(null);
    if (!text.trim()) return setError('Please enter your essay first.');
    setBusy(true);
    try {
      const res = await api.post('/tools/writing-check', { text });
      const { original, corrected, source, aiCheck } = res.data;
      const ops = diffTokens(original, corrected);
      setData({ original, corrected, source, aiCheck, ops, changes: buildChanges(ops) });
    } catch (err) {
      setError(err.response?.data?.message || 'Could not reach the server. Is the backend running?');
    } finally {
      setBusy(false);
    }
  }

  function copyCorrected() {
    navigator.clipboard.writeText(data.corrected);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-bold">Writing Checker</h1>
      <p className="text-gray-600">Paste your essay — mistakes are shown in red, then corrected below.</p>

      <div className="mt-4 card space-y-4">
        {error && <p className="rounded bg-red-50 p-2 text-sm text-red-600">{error}</p>}
        <textarea
          className="input min-h-[160px]"
          placeholder="Paste your essay here…"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400">{text.length} / 8000</span>
          <button className="btn-primary" onClick={handleCheck} disabled={busy}>
            {busy ? 'Checking…' : 'Check Writing'}
          </button>
        </div>
      </div>

      {data && (
        <>
          {/* AI-likeness indicator */}
          {data.aiCheck && (
            <div className="mt-4 card">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold">AI-likeness check</h2>
                <span
                  className={`rounded-full px-3 py-1 text-sm font-medium ${
                    data.aiCheck.label === 'High'
                      ? 'bg-red-100 text-red-700'
                      : data.aiCheck.label === 'Medium'
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-green-100 text-green-700'
                  }`}
                >
                  {data.aiCheck.label} · {data.aiCheck.score}%
                </span>
              </div>
              <ul className="mt-2 list-inside list-disc text-sm text-gray-600">
                {data.aiCheck.signals.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
              <p className="mt-2 rounded bg-amber-50 p-2 text-xs text-amber-800">
                ⚠️ This is a rough estimate only. No tool can reliably detect AI-written text — do not treat this as proof.
              </p>
            </div>
          )}

          {/* No mistakes */}
          {data.changes.length === 0 ? (
            <div className="mt-4 card bg-green-50">
              <p className="font-medium text-green-800">✓ No mistakes found — your writing looks good!</p>
            </div>
          ) : (
            <>
              {/* 1. Mistakes highlighted in red */}
              <div className="mt-4 card">
                <h2 className="mb-2 font-semibold text-red-600">Mistakes found ({data.changes.length})</h2>
                <p className="whitespace-pre-wrap leading-relaxed text-gray-800">
                  {(data.ops || []).filter((o) => o.type !== 'ins').map((o, idx) =>
                    o.type === 'del' && !isSpace(o.text) ? (
                      <span key={idx} className="rounded bg-red-100 font-medium text-red-700 line-through decoration-red-400">
                        {o.text}
                      </span>
                    ) : (
                      <span key={idx}>{o.text}</span>
                    )
                  )}
                </p>
              </div>

              {/* 2. List of corrections */}
              <div className="mt-4 card">
                <h2 className="mb-3 font-semibold">Corrections</h2>
                <ul className="space-y-2">
                  {data.changes.map((c, i) => (
                    <li key={i} className="flex flex-wrap items-center gap-2 text-sm">
                      <span className="rounded bg-red-100 px-2 py-0.5 text-red-700 line-through">
                        {c.from || '(missing)'}
                      </span>
                      <span className="text-gray-400">→</span>
                      <span className="rounded bg-green-100 px-2 py-0.5 text-green-800">
                        {c.to || '(remove)'}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* 3. Corrected version */}
              <div className="mt-4 card">
                <div className="mb-2 flex items-center justify-between">
                  <h2 className="font-semibold text-green-700">Corrected version</h2>
                  <button onClick={copyCorrected} className="text-sm text-indigo-600 hover:underline">
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <p className="whitespace-pre-wrap leading-relaxed text-gray-800">
                  {(data.ops || []).filter((o) => o.type !== 'del').map((o, idx) =>
                    o.type === 'ins' && !isSpace(o.text) ? (
                      <span key={idx} className="rounded bg-green-100 text-green-800">{o.text}</span>
                    ) : (
                      <span key={idx}>{o.text}</span>
                    )
                  )}
                </p>
              </div>
            </>
          )}

          <p className="mt-3 text-center text-xs text-gray-400">
            {data.source === 'ai' ? 'Checked with AI' : 'Checked with the built-in rule checker (add a Gemini key for deeper grammar checking)'}
          </p>
        </>
      )}
    </div>
  );
}
