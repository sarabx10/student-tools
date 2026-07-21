import pool from '../config/db.js';
import { generatePlan } from '../utils/studyPlanner.js';

// POST /api/tools/study-plans   { subject, examDate, hoursPerDay, startTime }
// Generating for a subject replaces any existing plan for that subject.
export async function createStudyPlan(req, res, next) {
  try {
    const { subject, examDate, hoursPerDay, startTime } = req.body;
    const plans = generatePlan({ subject, examDate, hoursPerDay, startTime });

    // Replace any previous plan for this subject.
    await pool.query('DELETE FROM study_plans WHERE user_id = ? AND subject = ?', [
      req.user.id,
      subject.trim(),
    ]);

    const values = plans.map((p) => [
      req.user.id, p.subject, p.task, p.plan_date, p.start_time, p.end_time, 'pending',
    ]);
    await pool.query(
      'INSERT INTO study_plans (user_id, subject, task, plan_date, start_time, end_time, status) VALUES ?',
      [values]
    );

    res.status(201).json({ created: plans.length });
  } catch (err) {
    next(err);
  }
}

// GET /api/tools/study-plans
export async function getStudyPlans(req, res, next) {
  try {
    const [rows] = await pool.query(
      `SELECT id, subject, task, plan_date, start_time, end_time, status
       FROM study_plans WHERE user_id = ?
       ORDER BY plan_date, start_time`,
      [req.user.id]
    );
    res.json({ plans: rows });
  } catch (err) {
    next(err);
  }
}

// PATCH /api/tools/study-plans/:id   { status }
export async function updateStudyPlan(req, res, next) {
  try {
    const status = req.body.status === 'done' ? 'done' : 'pending';
    const [result] = await pool.query(
      'UPDATE study_plans SET status = ? WHERE id = ? AND user_id = ?',
      [status, req.params.id, req.user.id]
    );
    if (!result.affectedRows) return res.status(404).json({ message: 'Task not found.' });
    res.json({ id: Number(req.params.id), status });
  } catch (err) {
    next(err);
  }
}

// DELETE /api/tools/study-plans/:id
export async function deleteStudyPlan(req, res, next) {
  try {
    await pool.query('DELETE FROM study_plans WHERE id = ? AND user_id = ?', [
      req.params.id,
      req.user.id,
    ]);
    res.json({ deleted: true });
  } catch (err) {
    next(err);
  }
}
