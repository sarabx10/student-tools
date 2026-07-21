import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// A connection pool is reused across requests (efficient & safe).
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'student_tools',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  // Return DATE/TIME/DATETIME as strings (e.g. "2026-08-20") instead of JS
  // Date objects, so values aren't shifted by the server timezone.
  dateStrings: true,
  // Managed/cloud MySQL hosts require TLS. Set DB_SSL=true in production.
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
});

export default pool;
