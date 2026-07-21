import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../lib/api.js';

/* ---- Inline line icons (stroke, currentColor) ---- */
const PATHS = {
  pencil: <><path d="M12 20h9" /><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" /></>,
  'badge-check': <><path d="M12 2 15 5l4 .5.5 4L22 12l-2.5 2.5-.5 4-4 .5L12 22l-3-2.5-4-.5-.5-4L2 12l2.5-2.5.5-4 4-.5Z" /><path d="m9 12 2 2 4-4" /></>,
  'file-lines': <><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8Z" /><path d="M14 3v5h5" /><path d="M9 13h6M9 17h6" /></>,
  book: <><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z" /></>,
  calendar: <><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></>,
  sparkles: <><path d="M12 3v4M12 17v4M3 12h4M17 12h4" /><path d="M12 8.5 13.2 11 15.5 12 13.2 13 12 15.5 10.8 13 8.5 12 10.8 11Z" /></>,
  search: <><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></>,
  cap: <><path d="M22 10 12 5 2 10l10 5 10-5Z" /><path d="M6 12v5c0 1 2.5 2.5 6 2.5s6-1.5 6-2.5v-5" /></>,
  doc: <><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8Z" /><path d="M14 3v5h5" /></>,
  flame: <><path d="M12 2c1 4 4 5 4 9a4 4 0 0 1-8 0c0-1.5.5-2.5 1-3 .3 1 1 1.5 1.5 1.5C10 8 11 5 12 2Z" /></>,
  arrow: <path d="M5 12h14M13 6l6 6-6 6" />,
};
function Icon({ name, size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {PATHS[name]}
    </svg>
  );
}

const TOOLS = [
  { title: 'Writing Improvement', to: '/paraphrase', accent: '#f59e0b', icon: 'pencil', chip: 'Popular',
    desc: 'Sharpen clarity, flow, and tone across any draft you paste in.', keywords: 'paraphrase rewrite tone clarity draft' },
  { title: 'Writing Checker', to: '/similarity', accent: '#2563eb', icon: 'badge-check',
    desc: 'Catch grammar, spelling, and punctuation slips before you submit.', keywords: 'grammar spelling punctuation check essay' },
  { title: 'Summarizer', to: '/summarizer', accent: '#64748b', icon: 'file-lines',
    desc: 'Turn long readings and lectures into tight, quotable notes.', keywords: 'summary notes pdf lecture' },
  { title: 'Citation Generator', to: '/citations', accent: '#10b981', icon: 'book',
    desc: 'Build accurate references in APA, MLA, Harvard, and more.', keywords: 'citation reference apa mla harvard bibliography' },
  { title: 'Study Planner', to: '/study-planner', accent: '#8b5cf6', icon: 'calendar',
    desc: 'Map deadlines into a realistic week you can actually follow.', keywords: 'study plan schedule exam revision' },
  { title: 'Humanizer', to: '/humanizer', accent: '#ec4899', icon: 'sparkles', chip: 'New',
    desc: 'Make AI-assisted text read naturally, in a voice that sounds like you.', keywords: 'humanize rewrite ai detection natural' },
  { title: 'Research Assistant', to: '/research', accent: '#14b8a6', icon: 'search',
    desc: 'Find a structured overview and the key points of any topic, fast.', keywords: 'research topic overview sources' },
  { title: 'AI Tutor', to: '/tutor', accent: '#6366f1', icon: 'cap', chip: 'Popular',
    desc: 'Ask questions and work through tricky concepts step by step.', keywords: 'tutor learn explain quiz teach' },
];

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const SAMPLE_BARS = [50, 30, 72, 46, 100, 28, 38];
const fmtDay = (d) => d.toISOString().slice(0, 10);

export default function Dashboard() {
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [stats, setStats] = useState({ documents: 24, citations: 96, streak: 5, tasksDue: 3 });
  const [bars, setBars] = useState(SAMPLE_BARS);
  const [sessions, setSessions] = useState(14);
  const [animH, setAnimH] = useState(SAMPLE_BARS.map(() => 0));

  const now = new Date();
  const hour = now.getHours();
  const partOfDay = hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening';
  const dateLabel = now
    .toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })
    .toUpperCase()
    .replace(',', ' ·');
  const firstName = user?.fullName?.split(' ')[0] || 'there';

  // Pull real activity to fill the stats + weekly chart (graceful fallback to sample).
  useEffect(() => {
    let alive = true;
    Promise.all([
      api.get('/tools/summaries').then((r) => r.data.summaries).catch(() => []),
      api.get('/tools/citations').then((r) => r.data.citations).catch(() => []),
      api.get('/tools/study-plans').then((r) => r.data.plans).catch(() => []),
      api.get('/tools/paraphrase/history').then((r) => r.data.history).catch(() => []),
      api.get('/tools/research/history').then((r) => r.data.history).catch(() => []),
    ])
      .then(([summaries, citations, plans, paraphrases, research]) => {
        if (!alive) return;

        const tasksDue = plans.filter((p) => p.status !== 'done').length;

        // All activity dates (YYYY-MM-DD) from the history tables.
        const dates = [
          ...summaries.map((x) => x.created_date),
          ...citations.map((x) => x.created_date),
          ...paraphrases.map((x) => x.created_date),
          ...research.map((x) => x.created_date),
        ]
          .filter(Boolean)
          .map((d) => String(d).slice(0, 10));

        // Consecutive-day streak ending today.
        const daySet = new Set(dates);
        let streak = 0;
        const cur = new Date();
        cur.setHours(0, 0, 0, 0);
        while (daySet.has(fmtDay(cur))) {
          streak++;
          cur.setDate(cur.getDate() - 1);
        }

        // This week's per-weekday counts (Mon–Sun).
        const monday = new Date();
        monday.setHours(0, 0, 0, 0);
        monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
        const counts = DAYS.map((_, i) => {
          const d = new Date(monday);
          d.setDate(monday.getDate() + i);
          const key = fmtDay(d);
          return dates.filter((x) => x === key).length;
        });
        const weekTotal = counts.reduce((a, b) => a + b, 0);

        setStats({
          documents: summaries.length,
          citations: citations.length,
          streak,
          tasksDue,
        });

        if (weekTotal > 0) {
          const max = Math.max(...counts, 1);
          setBars(counts.map((c) => Math.max(8, Math.round((c / max) * 100))));
          setSessions(weekTotal);
        }
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  // Animate bars up from zero after mount.
  useEffect(() => {
    const t = setTimeout(() => setAnimH(bars), 120);
    return () => clearTimeout(t);
  }, [bars]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return TOOLS;
    return TOOLS.filter((t) => `${t.title} ${t.keywords}`.toLowerCase().includes(q));
  }, [query]);

  const peak = Math.max(...bars);

  const STAT_CARDS = [
    ['DOCUMENTS', stats.documents, 'doc'],
    ['CITATIONS', stats.citations, 'book'],
    ['DAY STREAK', stats.streak, 'flame'],
    ['TASKS DUE', stats.tasksDue, 'calendar'],
  ];

  return (
    <div>
      {/* Hero */}
      <section className="pt-2">
        <p className="text-xs font-semibold tracking-[0.15em]" style={{ color: 'var(--brand)' }}>
          {dateLabel}
        </p>
        <h1 className="mt-2 font-serif text-4xl font-semibold sm:text-5xl">
          Good {partOfDay}, {firstName} <span className="wave">👋</span>
        </h1>
        <p className="mt-2 max-w-xl text-gray-600">
          Eight tools, ready when you are. Pick one to keep your coursework moving.
        </p>
      </section>

      {/* Stats strip */}
      <section className="mt-7 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {STAT_CARDS.map(([label, value, icon]) => (
          <div key={label} className="card">
            <div className="flex items-center gap-2 text-gray-500">
              <Icon name={icon} size={16} />
              <span className="text-xs font-semibold tracking-wide">{label}</span>
            </div>
            <div className="mt-3 text-4xl font-bold tabular-nums">{value}</div>
          </div>
        ))}
      </section>

      {/* Tools */}
      <section className="mt-9">
        <div className="mb-4 flex items-center justify-between gap-3">
          <span className="text-xs font-semibold tracking-[0.15em] text-gray-500">TOOLS</span>
          <div className="flex items-center gap-3">
            <div className="relative hidden sm:block">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--faint)' }}>
                <Icon name="search" size={16} />
              </span>
              <input
                className="input py-1.5 pl-9"
                style={{ width: 210 }}
                placeholder="Search tools"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                aria-label="Search tools"
              />
            </div>
            <span className="text-sm text-gray-500">{filtered.length} tools</span>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="card text-center text-gray-500">No tools match that search.</div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((t) => (
              <Link key={t.title} to={t.to} className="tool-card" style={{ '--accent': t.accent }}>
                <div className="flex items-start justify-between">
                  <div className="tool-tile"><Icon name={t.icon} /></div>
                  {t.chip && (
                    <span
                      className="rounded-full px-2.5 py-0.5 text-xs font-semibold"
                      style={{ color: t.accent, background: `color-mix(in srgb, ${t.accent} 14%, transparent)` }}
                    >
                      {t.chip}
                    </span>
                  )}
                </div>
                <h3 className="mt-4 text-lg font-semibold">{t.title}</h3>
                <p className="mt-1 flex-1 text-sm text-gray-600">{t.desc}</p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="tool-open text-sm font-semibold">Open tool</span>
                  <span className="tool-arrow"><Icon name="arrow" size={16} /></span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Weekly activity */}
      <section className="mt-9 card">
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <h2 className="font-serif text-2xl font-semibold">This week's activity</h2>
            <p className="mt-1 text-sm text-gray-600">Sessions across all your tools, Monday to Sunday.</p>
            <div className="mt-5 flex items-end gap-6">
              <div>
                <div className="text-3xl font-bold tabular-nums">{sessions}</div>
                <div className="text-xs text-gray-500">sessions</div>
              </div>
              <div>
                <div className="text-3xl font-bold tabular-nums">2.4<span className="text-lg">h</span></div>
                <div className="text-xs text-gray-500">focused time</div>
              </div>
              <span
                className="mb-1 rounded-full px-2.5 py-1 text-xs font-semibold"
                style={{ color: '#10b981', background: 'color-mix(in srgb, #10b981 14%, transparent)' }}
              >
                ↑ 22% vs last week
              </span>
            </div>
          </div>

          <div className="flex items-end justify-between gap-2" style={{ height: 160 }}>
            {DAYS.map((d, i) => {
              const isPeak = bars[i] === peak;
              return (
                <div key={d} className="flex flex-1 flex-col items-center gap-2">
                  <div className="flex w-full flex-1 items-end">
                    <div
                      className="bar w-full rounded-t-md"
                      style={{
                        height: `${animH[i]}%`,
                        background: isPeak
                          ? 'linear-gradient(180deg, var(--brand), var(--brand-pressed))'
                          : 'color-mix(in srgb, var(--brand) 26%, transparent)',
                      }}
                    />
                  </div>
                  <span className="text-xs text-gray-500">{d}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
