import { useState, useEffect } from 'react';
import api from '../lib/api.js';

const STYLES = [
  { value: 'simple', label: 'Simple' },
  { value: 'academic', label: 'Academic' },
  { value: 'professional', label: 'Professional' },
  { value: 'short', label: 'Short' },
];

export default function Paraphrase() {
  const [text, setText] = useState('');
  const [style, setStyle] = useState('academic');
  const [result, setResult] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState([]);

  async function loadHistory() {
    try {
      const res = await api.get('/tools/paraphrase/history');
      setHistory(res.data.history);
    } catch {
      /* non-critical */
    }
  }

  useEffect(() => {
    loadHistory();
  }, []);

  async function handleGenerate() {
    setError('');
    setResult('');
    if (!text.trim()) return setError('Please enter some text first.');
    setBusy(true);
    try {
      const res = await api.post('/tools/paraphrase', { text, style });
      setResult(res.data.rewritten_text);
      loadHistory();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not reach the server. Is the backend running?');
    } finally {
      setBusy(false);
    }
  }

  function copyResult() {
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-bold">Writing Improvement</h1>
      <p className="text-gray-600">Rewrite your text to improve clarity and tone.</p>

      <div className="mt-4 card space-y-4">
        {error && <p className="rounded bg-red-50 p-2 text-sm text-red-600">{error}</p>}

        <textarea
          className="input min-h-[150px]"
          placeholder="Enter your text here…"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <div className="text-right text-xs text-gray-400">{text.length} / 5000</div>

        <div>
          <p className="mb-2 text-sm font-medium">Style</p>
          <div className="flex flex-wrap gap-2">
            {STYLES.map((s) => (
              <button
                key={s.value}
                type="button"
                onClick={() => setStyle(s.value)}
                className={`rounded-full border px-4 py-1.5 text-sm transition ${
                  style === s.value
                    ? 'border-indigo-600 bg-indigo-600 text-white'
                    : 'border-gray-300 hover:bg-gray-100'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        <button className="btn-primary" onClick={handleGenerate} disabled={busy}>
          {busy ? 'Generating…' : 'Generate'}
        </button>
      </div>

      {result && (
        <div className="mt-4 card">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="font-semibold">Result</h2>
            <button onClick={copyResult} className="text-sm text-indigo-600 hover:underline">
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <p className="whitespace-pre-wrap text-gray-800">{result}</p>
        </div>
      )}

      {history.length > 0 && (
        <div className="mt-8">
          <h2 className="mb-3 font-semibold">Recent</h2>
          <div className="space-y-3">
            {history.map((h) => (
              <div key={h.id} className="card">
                <div className="mb-1 text-xs uppercase tracking-wide text-indigo-500">{h.style}</div>
                <p className="text-sm text-gray-500 line-clamp-2">{h.original_text}</p>
                <p className="mt-1 text-sm text-gray-800 line-clamp-2">→ {h.rewritten_text}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
