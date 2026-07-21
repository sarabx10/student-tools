// ============================================================
//  Study plan generator
// ------------------------------------------------------------
//  Builds a day-by-day schedule from today until the exam date,
//  rotating through study activities and ending with a mock exam.
// ============================================================

const FOCI = [
  'Read and understand the key concepts',
  'Practice past questions and exercises',
  'Review and make summary notes',
  'Active recall — test yourself without notes',
];

function badRequest(message) {
  const err = new Error(message);
  err.status = 400;
  return err;
}

function fmtDate(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

// Add a (possibly fractional) number of hours to an "HH:MM" time.
function addHours(hhmm, hours) {
  const [h, m] = hhmm.split(':').map(Number);
  let total = h * 60 + m + Math.round(hours * 60);
  total = ((total % 1440) + 1440) % 1440; // wrap within a day
  const nh = String(Math.floor(total / 60)).padStart(2, '0');
  const nm = String(total % 60).padStart(2, '0');
  return `${nh}:${nm}`;
}

export function generatePlan({ subject, examDate, hoursPerDay, startTime = '18:00' }) {
  if (!subject || !subject.trim()) throw badRequest('Please enter a subject.');
  if (!examDate) throw badRequest('Please choose an exam date.');
  if (!/^\d{2}:\d{2}$/.test(startTime)) startTime = '18:00';

  const hours = Number(hoursPerDay);
  if (!hours || hours <= 0 || hours > 16) {
    throw badRequest('Hours per day must be between 1 and 16.');
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const exam = new Date(`${examDate}T00:00:00`);
  if (isNaN(exam.getTime())) throw badRequest('Invalid exam date.');
  if (exam <= today) throw badRequest('The exam date must be in the future.');

  const MAX_DAYS = 60;
  const plans = [];
  const cur = new Date(today);
  let i = 0;

  while (cur < exam && plans.length < MAX_DAYS) {
    const daysLeft = Math.round((exam - cur) / 86400000);
    const isLastDay = daysLeft === 1;
    const task = isLastDay ? 'Final revision and a full mock exam' : FOCI[i % FOCI.length];

    plans.push({
      subject: subject.trim(),
      task,
      plan_date: fmtDate(cur),
      start_time: startTime,
      end_time: addHours(startTime, hours),
    });

    cur.setDate(cur.getDate() + 1);
    i++;
  }

  return plans;
}
