import { useState, useEffect } from 'react';
import api from '../lib/api.js';

const hhmm = (t) => (t ? t.slice(0, 5) : '');

function prettyDate(dateStr) {
  const d = new Date(`${dateStr}T00:00:00`);
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
}

export default function StudyPlanner() {
  const [form, setForm] = useState({ subject: '', examDate: '', hoursPerDay: 3, startTime: '18:00' });
  const [plans, setPlans] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const update = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  async function loadPlans() {
    try {
      const res = await api.get('/tools/study-plans');
      setPlans(res.data.plans);
    } catch {
      /* non-critical */
    }
  }
  useEffect(() => {
    loadPlans();
  }, []);

  async function handleGenerate() {
    setError('');
    if (!form.subject.trim()) return setError('Please enter a subject.');
    if (!form.examDate) return setError('Please choose an exam date.');
    setBusy(true);
    try {
      await api.post('/tools/study-plans', form);
      await loadPlans();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not reach the server. Is the backend running?');
    } finally {
      setBusy(false);
    }
  }

  async function toggle(plan) {
    const status = plan.status === 'done' ? 'pending' : 'done';
    setPlans((prev) => prev.map((p) => (p.id === plan.id ? { ...p, status } : p)));
    try {
      await api.patch(`/tools/study-plans/${plan.id}`, { status });
    } catch {
      loadPlans(); // revert on failure
    }
  }

  async function remove(id) {
    setPlans((prev) => prev.filter((p) => p.id !== id));
    try {
      await api.delete(`/tools/study-plans/${id}`);
    } catch {
      loadPlans();
    }
  }

  // Group by date.
  const byDate = plans.reduce((acc, p) => {
    (acc[p.plan_date] = acc[p.plan_date] || []).push(p);
    return acc;
  }, {});
  const dates = Object.keys(byDate).sort();

  const done = plans.filter((p) => p.status === 'done').length;
  const percent = plans.length ? Math.round((done / plans.length) * 100) : 0;

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-bold">Study Planner</h1>
      <p className="text-gray-600">Generate a day-by-day study schedule up to your exam.</p>

      <div className="mt-4 card space-y-4">
        {error && <p className="rounded bg-red-50 p-2 text-sm text-red-600">{error}</p>}
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium">Subject</label>
            <input className="input" name="subject" placeholder="e.g. Software Engineering" value={form.subject} onChange={update} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Exam date</label>
            <input className="input" type="date" name="examDate" value={form.examDate} onChange={update} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Hours per day</label>
            <input className="input" type="number" min="1" max="16" step="0.5" name="hoursPerDay" value={form.hoursPerDay} onChange={update} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Start time</label>
            <input className="input" type="time" name="startTime" value={form.startTime} onChange={update} />
          </div>
        </div>
        <button className="btn-primary" onClick={handleGenerate} disabled={busy}>
          {busy ? 'Generating…' : 'Generate Schedule'}
        </button>
        <p className="text-xs text-gray-400">Tip: generating for the same subject again replaces its old plan.</p>
      </div>

      {plans.length > 0 && (
        <>
          {/* Progress */}
          <div className="mt-6 card">
            <div className="mb-1 flex items-center justify-between text-sm">
              <span className="font-medium">Progress</span>
              <span className="text-gray-500">{done} / {plans.length} tasks done ({percent}%)</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
              <div className="h-full bg-indigo-600 transition-all" style={{ width: `${percent}%` }} />
            </div>
          </div>

          {/* Schedule grouped by date */}
          <div className="mt-4 space-y-4">
            {dates.map((date) => (
              <div key={date} className="card">
                <h3 className="mb-2 font-semibold">{prettyDate(date)}</h3>
                <div className="space-y-2">
                  {byDate[date].map((p) => (
                    <div key={p.id} className="flex items-start gap-3 rounded-lg border border-gray-100 p-2">
                      <input
                        type="checkbox"
                        className="mt-1 h-4 w-4"
                        checked={p.status === 'done'}
                        onChange={() => toggle(p)}
                      />
                      <div className="flex-1">
                        <div className="text-sm text-gray-500">
                          {hhmm(p.start_time)}–{hhmm(p.end_time)} · <span className="font-medium text-indigo-600">{p.subject}</span>
                        </div>
                        <div className={p.status === 'done' ? 'text-gray-400 line-through' : 'text-gray-800'}>
                          {p.task}
                        </div>
                      </div>
                      <button onClick={() => remove(p.id)} className="text-gray-300 hover:text-red-500" title="Remove">
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
