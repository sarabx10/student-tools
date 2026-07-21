import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: '', studentId: '', email: '', password: '',
    confirmPassword: '', university: '', course: '',
  });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const update = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  function validate() {
    if (!EMAIL_RE.test(form.email)) return 'Invalid email format.';
    if (form.password.length < 8) return 'Password must be at least 8 characters.';
    if (form.password !== form.confirmPassword) return 'Passwords do not match.';
    return '';
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const v = validate();
    if (v) return setError(v);
    setError('');
    setBusy(true);
    try {
      const { confirmPassword, ...payload } = form;
      await register(payload);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <h1 className="mb-4 text-2xl font-bold">Create your account</h1>
      <form onSubmit={handleSubmit} className="card space-y-3">
        {error && <p className="rounded bg-red-50 p-2 text-sm text-red-600">{error}</p>}
        <input className="input" name="fullName" placeholder="Full Name" value={form.fullName} onChange={update} required />
        <input className="input" name="studentId" placeholder="Student ID (e.g. TP145007)" value={form.studentId} onChange={update} required />
        <input className="input" name="email" type="email" placeholder="Email" value={form.email} onChange={update} required />
        <input className="input" name="password" type="password" placeholder="Password (min 8 chars)" value={form.password} onChange={update} required />
        <input className="input" name="confirmPassword" type="password" placeholder="Confirm Password" value={form.confirmPassword} onChange={update} required />
        <input className="input" name="university" placeholder="University" value={form.university} onChange={update} />
        <input className="input" name="course" placeholder="Course" value={form.course} onChange={update} />
        <button className="btn-primary w-full" disabled={busy}>{busy ? 'Creating…' : 'Register'}</button>
        <p className="text-center text-sm text-gray-600">
          Already have an account? <Link to="/login" className="text-indigo-600">Login</Link>
        </p>
      </form>
    </div>
  );
}
