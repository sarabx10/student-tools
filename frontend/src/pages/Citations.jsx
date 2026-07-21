import { useState, useEffect } from 'react';
import api from '../lib/api.js';

const TYPES = [
  { value: 'book', label: 'Book' },
  { value: 'journal', label: 'Journal' },
  { value: 'website', label: 'Website' },
];
const STYLES = [
  { value: 'apa', label: 'APA 7' },
  { value: 'mla', label: 'MLA 9' },
  { value: 'harvard', label: 'Harvard' },
];

// Which fields show for each source type.
const FIELDS = {
  book: [
    ['authors', 'Author(s) — one per line, e.g. Sommerville, Ian', true],
    ['year', 'Year', false],
    ['title', 'Title', false],
    ['edition', 'Edition (optional, e.g. 10th)', false],
    ['publisher', 'Publisher', false],
    ['place', 'Place of publication (optional, Harvard)', false],
  ],
  journal: [
    ['authors', 'Author(s) — one per line', true],
    ['year', 'Year', false],
    ['title', 'Article title', false],
    ['journal', 'Journal name', false],
    ['volume', 'Volume', false],
    ['issue', 'Issue (optional)', false],
    ['pages', 'Pages (e.g. 45-58)', false],
    ['doi', 'DOI (optional)', false],
  ],
  website: [
    ['authors', 'Author(s) — one per line (optional)', true],
    ['year', 'Year', false],
    ['title', 'Page title', false],
    ['siteName', 'Website / site name', false],
    ['url', 'URL', false],
    ['accessed', 'Accessed date (optional)', false],
  ],
};

// Render *italic* markers as <em>.
function renderItalic(text) {
  return text.split('*').map((seg, i) =>
    i % 2 === 1 ? <em key={i}>{seg}</em> : <span key={i}>{seg}</span>
  );
}
const stripMarks = (t) => t.replace(/\*/g, '');

export default function Citations() {
  const [sourceType, setSourceType] = useState('book');
  const [style, setStyle] = useState('apa');
  const [fields, setFields] = useState({});
  const [result, setResult] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(null);
  const [history, setHistory] = useState([]);

  async function loadHistory() {
    try {
      const res = await api.get('/tools/citations');
      setHistory(res.data.citations);
    } catch {
      /* non-critical */
    }
  }
  useEffect(() => {
    loadHistory();
  }, []);

  const update = (key, val) => setFields({ ...fields, [key]: val });

  async function handleGenerate() {
    setError('');
    setResult('');
    if (!fields.title || !fields.title.trim()) return setError('Please enter at least a title.');
    setBusy(true);
    try {
      const res = await api.post('/tools/citations', { sourceType, style, fields });
      setResult(res.data.citation);
      loadHistory();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not reach the server. Is the backend running?');
    } finally {
      setBusy(false);
    }
  }

  function copy(text, id) {
    navigator.clipboard.writeText(stripMarks(text));
    setCopied(id);
    setTimeout(() => setCopied(null), 1500);
  }

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-bold">Citation Generator</h1>
      <p className="text-gray-600">Create formatted references in APA, MLA, or Harvard style.</p>

      <div className="mt-4 card space-y-4">
        {error && <p className="rounded bg-red-50 p-2 text-sm text-red-600">{error}</p>}

        {/* Source type */}
        <div>
          <p className="mb-2 text-sm font-medium">Source type</p>
          <div className="flex flex-wrap gap-2">
            {TYPES.map((t) => (
              <button
                key={t.value}
                onClick={() => { setSourceType(t.value); setResult(''); }}
                className={`rounded-full border px-4 py-1.5 text-sm ${sourceType === t.value ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-gray-300 hover:bg-gray-100'}`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Style */}
        <div>
          <p className="mb-2 text-sm font-medium">Citation style</p>
          <div className="flex flex-wrap gap-2">
            {STYLES.map((s) => (
              <button
                key={s.value}
                onClick={() => setStyle(s.value)}
                className={`rounded-full border px-4 py-1.5 text-sm ${style === s.value ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-gray-300 hover:bg-gray-100'}`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic fields */}
        <div className="space-y-3">
          {FIELDS[sourceType].map(([key, placeholder, isArea]) =>
            isArea ? (
              <textarea key={key} className="input min-h-[70px]" placeholder={placeholder} value={fields[key] || ''} onChange={(e) => update(key, e.target.value)} />
            ) : (
              <input key={key} className="input" placeholder={placeholder} value={fields[key] || ''} onChange={(e) => update(key, e.target.value)} />
            )
          )}
        </div>

        <button className="btn-primary" onClick={handleGenerate} disabled={busy}>
          {busy ? 'Generating…' : 'Generate Citation'}
        </button>
      </div>

      {result && (
        <div className="mt-4 card">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="font-semibold">Reference</h2>
            <button onClick={() => copy(result, 'main')} className="text-sm text-indigo-600 hover:underline">
              {copied === 'main' ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <p className="leading-relaxed text-gray-800">{renderItalic(result)}</p>
        </div>
      )}

      {history.length > 0 && (
        <div className="mt-8">
          <h2 className="mb-3 font-semibold">Saved references</h2>
          <div className="space-y-3">
            {history.map((h) => (
              <div key={h.id} className="card">
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-xs uppercase tracking-wide text-indigo-500">
                    {h.source_type} · {h.citation_style}
                  </span>
                  <button onClick={() => copy(h.citation_text, h.id)} className="text-xs text-indigo-600 hover:underline">
                    {copied === h.id ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <p className="text-sm text-gray-700">{renderItalic(h.citation_text)}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
