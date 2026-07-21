import { useState, useEffect } from 'react';
import api from '../lib/api.js';
import Markdownish from '../components/Markdownish.jsx';

const DEPTHS = [
  { value: 'quick', label: 'Quick Overview' },
  { value: 'deep', label: 'Deep Dive' },
];

// Export text as a Word-openable .doc file (no libraries needed).
function downloadDoc(title, text) {
  const safeText = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const html =
    `<html xmlns:w="urn:schemas-microsoft-com:office:word"><head><meta charset="utf-8"></head>` +
    `<body style="font-family:Calibri,Arial,sans-serif"><h1>${title}</h1><pre style="white-space:pre-wrap;font-family:Calibri,Arial">${safeText}</pre></body></html>`;
  const blob = new Blob([html], { type: 'application/msword' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${title.replace(/[^a-z0-9]+/gi, '_').slice(0, 50)}.doc`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function Research() {
  const [topic, setTopic] = useState('');
  const [depth, setDepth] = useState('deep');
  const [result, setResult] = useState(null); // { topic, content }
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState([]);

  async function loadHistory() {
    try {
      const res = await api.get('/tools/research/history');
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
    setResult(null);
    if (!topic.trim()) return setError('Please enter a topic first.');
    setBusy(true);
    try {
      const res = await api.post('/tools/research', { topic, depth });
      setResult(res.data);
      loadHistory();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not reach the server. Is the backend running?');
    } finally {
      setBusy(false);
    }
  }

  function copyResult() {
    navigator.clipboard.writeText(result.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-bold">Research Assistant</h1>
      <p className="text-gray-600">Enter a topic and get a structured research overview.</p>

      <div className="mt-4 card space-y-4">
        {error && <p className="rounded bg-red-50 p-2 text-sm text-red-600">{error}</p>}

        <div>
          <label className="mb-1 block text-sm font-medium">What topic do you want to research?</label>
          <input
            className="input"
            placeholder="e.g. Software Engineering"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
          />
        </div>

        <div>
          <p className="mb-2 text-sm font-medium">Depth</p>
          <div className="flex flex-wrap gap-2">
            {DEPTHS.map((d) => (
              <button
                key={d.value}
                type="button"
                onClick={() => setDepth(d.value)}
                className={`rounded-full border px-4 py-1.5 text-sm transition ${
                  depth === d.value ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-gray-300 hover:bg-gray-100'
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>

        <button className="btn-primary" onClick={handleGenerate} disabled={busy}>
          {busy ? 'Researching…' : '🔎 Generate Research'}
        </button>
      </div>

      {result && (
        <div className="mt-4 card">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-semibold">{result.topic}</h2>
            <div className="flex gap-3 text-sm">
              <button onClick={copyResult} className="text-indigo-600 hover:underline">
                {copied ? 'Copied!' : 'Copy'}
              </button>
              <button onClick={() => downloadDoc(result.topic, result.content)} className="text-indigo-600 hover:underline">
                Download (.doc)
              </button>
            </div>
          </div>
          <div className="text-gray-800">
            <Markdownish text={result.content} />
          </div>
        </div>
      )}

      {history.length > 0 && (
        <div className="mt-8">
          <h2 className="mb-3 font-semibold">Recent research</h2>
          <div className="space-y-2">
            {history.map((h) => (
              <button
                key={h.id}
                onClick={() => setResult({ topic: h.topic, content: h.content })}
                className="card block w-full text-left transition hover:shadow-md"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-800">{h.topic}</span>
                  <span className="text-xs uppercase tracking-wide text-indigo-500">{h.depth}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
