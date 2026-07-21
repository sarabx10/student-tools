import { useState, useRef, useEffect } from 'react';
import api from '../lib/api.js';
import Markdownish from '../components/Markdownish.jsx';

const GREETING = {
  role: 'assistant',
  content: "Hi! 👋 I'm your AI Tutor. Ask me about any academic topic and I'll explain it step by step. What would you like to learn today?",
};

const SUGGESTIONS = [
  'Explain recursion simply',
  'What is normalization in databases?',
  'Help me understand the OSI model',
];

export default function Tutor() {
  const [messages, setMessages] = useState([GREETING]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, busy]);

  async function send(text) {
    const content = (text ?? input).trim();
    if (!content || busy) return;
    setError('');
    setInput('');

    const nextMessages = [...messages, { role: 'user', content }];
    setMessages(nextMessages);
    setBusy(true);
    try {
      // Send the conversation without the local greeting (it's just UI).
      const history = nextMessages.filter((m) => m !== GREETING);
      const res = await api.post('/tools/tutor', { messages: history });
      setMessages((prev) => [...prev, { role: 'assistant', content: res.data.reply }]);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not reach the tutor. Is the backend running?');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto flex h-[calc(100vh-9rem)] max-w-3xl flex-col">
      <div className="mb-3">
        <h1 className="text-2xl font-bold">AI Tutor</h1>
        <p className="text-gray-600">Learn any topic through a friendly, step-by-step conversation.</p>
      </div>

      {/* Messages */}
      <div className="flex-1 space-y-4 overflow-y-auto rounded-xl border border-gray-200 bg-white p-4">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-2 ${
                m.role === 'user'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              {m.role === 'assistant' ? <Markdownish text={m.content} /> : m.content}
            </div>
          </div>
        ))}

        {busy && (
          <div className="flex justify-start">
            <div className="rounded-2xl bg-gray-100 px-4 py-2 text-gray-500">Thinking…</div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Suggestions (only before the first question) */}
      {messages.length === 1 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => send(s)}
              className="rounded-full border border-gray-300 px-3 py-1 text-sm hover:bg-gray-100"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {error && <p className="mt-2 rounded bg-red-50 p-2 text-sm text-red-600">{error}</p>}

      {/* Input */}
      <div className="mt-3 flex gap-2">
        <input
          className="input"
          placeholder="Ask your tutor anything…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && send()}
          disabled={busy}
        />
        <button className="btn-primary" onClick={() => send()} disabled={busy || !input.trim()}>
          Send
        </button>
      </div>
    </div>
  );
}
