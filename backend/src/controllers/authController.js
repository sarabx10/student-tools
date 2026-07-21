import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../config/db.js';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function signToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

// POST /api/auth/register
export async function register(req, res, next) {
  try {
    const { fullName, studentId, email, password, university, course } = req.body;

    // --- Validation ---
    if (!fullName || !studentId || !email || !password) {
      return res.status(400).json({ message: 'Please fill in all required fields.' });
    }
    if (!EMAIL_RE.test(email)) {
      return res.status(400).json({ message: 'Invalid email format.' });
    }
    if (password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters.' });
    }

    // --- Duplicate check ---
    const [existing] = await pool.query(
      'SELECT id FROM users WHERE email = ? OR student_id = ?',
      [email, studentId]
    );
    if (existing.length) {
      return res.status(409).json({ message: 'An account with that email or student ID already exists.' });
    }

    // --- Hash password (never store plain text) ---
    const passwordHash = await bcrypt.hash(password, 12);

    const [result] = await pool.query(
      `INSERT INTO users (full_name, student_id, email, password_hash, university, course)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [fullName, studentId, email, passwordHash, university || null, course || null]
    );

    const user = { id: result.insertId, email, fullName };
    const token = signToken(user);
    res.status(201).json({ token, user: { id: user.id, fullName, email } });
  } catch (err) {
    next(err);
  }
}

// POST /api/auth/login
export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (!rows.length) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const user = rows[0];
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const token = signToken(user);
    res.json({
      token,
      user: { id: user.id, fullName: user.full_name, email: user.email },
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/auth/me   (protected)
export async function me(req, res, next) {
  try {
    const [rows] = await pool.query(
      'SELECT id, full_name, student_id, email, university, course, created_date FROM users WHERE id = ?',
      [req.user.id]
    );
    if (!rows.length) return res.status(404).json({ message: 'User not found.' });
    res.json({ user: rows[0] });
  } catch (err) {
    next(err);
  }
}
