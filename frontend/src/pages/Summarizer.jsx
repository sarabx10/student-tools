import { useState, useEffect, useRef } from 'react';
import api from '../lib/api.js';

const TYPES = [
  { value: 'short', label: 'Short' },
  { value: 'detailed', label: 'Detailed' },
  { value: 'exam_notes', label: 'Exam Notes' },
];

export default function Summarizer() {
  const [mode, setMode] = useState('file'); // 'file' | 'text'
  const [file, setFile] = useState(null);
  const [text, setText] = useState('');
  const [type, setType] = useState('short');
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState([]);
  const fileRef = useRef();

  async function loadHistory() {
    try {
      const res = await api.get('/tools/summaries');
      setHistory(res.data.summaries);
    } catch {
      /* non-critical */
    }
  }
  useEffect(() => {
    loadHistory();
  }, []);

  async function handleSummarize() {
    setError('');
    setResult(null);
    if (mode === 'file' && !file) return setError('Please choose a file first.');
    if (mode === 'text' && !text.trim()) return setError('Please paste some text first.');

    const form = new FormData();
    form.append('summaryType', type);
    if (mode === 'file') form.append('file', file);
    else form.append('text', text);

    setBusy(true);
    try {
      const res = await api.post('/tools/summarize', form);
      setResult(res.data);
      loadHistory();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not reach the server. Is the backend running?');
    } finally {
      setBusy(false);
    }
  }

  function copySummary() {
    navigator.clipboard.writeText(result.summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  const reduction = result && result.originalWords
    ? Math.max(0, Math.round((1 - result.summaryWords / result.originalWords) * 100))
    : 0;

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-bold">Summarizer</h1>
      <p className="text-gray-600">Turn long PDFs, notes, or lectures into short summaries.</p>

      <div className="mt-4 card space-y-4">
        {error && <p className="rounded bg-red-50 p-2 text-sm text-red-600">{error}</p>}

        {/* Source toggle */}
        <div className="flex gap-2">
          <button
            onClick={() => setMode('file')}
            className={`rounded-lg px-4 py-1.5 text-sm ${mode === 'file' ? 'bg-indigo-600 text-white' : 'border border-gray-300'}`}
          >
            Upload file
          </button>
          <button
            onClick={() => setMode('text')}
            className={`rounded-lg px-4 py-1.5 text-sm ${mode === 'text' ? 'bg-indigo-600 text-white' : 'border border-gray-300'}`}
          >
            Paste text
          </button>
        </div>

        {mode === 'file' ? (
          <div>
            <input
              ref={fileRef}
              type="file"
              accept=".pdf,.doc,.docx,.txt"
              onChange={(e) => setFile(e.target.files[0])}
              className="block w-full text-sm text-gray-600 file:mr-3 file:rounded-lg file:border-0 file:bg-indigo-50 file:px-4 file:py-2 file:text-indigo-700 hover:file:bg-indigo-100"
            />
            <p className="mt-1 text-xs text-gray-400">PDF, Word (.docx), or TXT — max 10 MB.</p>
          </div>
        ) : (
          <textarea
            className="input min-h-[160px]"
            placeholder="Paste the text you want summarized…"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        )}

        <div>
          <p className="mb-2 text-sm font-medium">Summary type</p>
          <div className="flex flex-wrap gap-2">
            {TYPES.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => setType(t.value)}
                className={`rounded-full border px-4 py-1.5 text-sm transition ${
                  type === t.value ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-gray-300 hover:bg-gray-100'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <button className="btn-primary" onClick={handleSummarize} disabled={busy}>
          {busy ? 'Summarizing…' : 'Summarize'}
        </button>
      </div>

      {result && (
        <div className="mt-4 card">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="font-semibold">Summary</h2>
            <button onClick={copySummary} className="text-sm text-indigo-600 hover:underline">
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
          {result.originalWords > 0 && (
            <p className="mb-3 text-xs text-gray-500">
              {result.originalWords} words → {result.summaryWords} words
              {reduction > 0 && <span className="ml-1 font-medium text-green-600">({reduction}% shorter)</span>}
            </p>
          )}
          <p className="whitespace-pre-wrap leading-relaxed text-gray-800">{result.summary}</p>
          <p className="mt-3 text-xs text-gray-400">
            {result.source === 'ai' ? 'Summarized with AI' : 'Summarized with the built-in summarizer (add a Gemini key for AI summaries)'}
          </p>
        </div>
      )}

      {history.length > 0 && (
        <div className="mt-8">
          <h2 className="mb-3 font-semibold">Recent summaries</h2>
          <div className="space-y-3">
            {history.map((h) => (
              <div key={h.id} className="card">
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">{h.file_name || 'Pasted text'}</span>
                  <span className="text-xs uppercase tracking-wide text-indigo-500">{h.summary_type.replace('_', ' ')}</span>
                </div>
                <p className="text-sm text-gray-600 line-clamp-3">{h.summary}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
