import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import ThemeToggle from './ThemeToggle.jsx';

function CapMark() {
  return (
    <div
      className="grid h-9 w-9 place-items-center rounded-xl text-white shadow-sm"
      style={{ background: 'linear-gradient(135deg, #6d63ff, #4b40d6)' }}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M22 10 12 5 2 10l10 5 10-5Z" />
        <path d="M6 12v5c0 1 2.5 2.5 6 2.5s6-1.5 6-2.5v-5" />
      </svg>
    </div>
  );
}

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <header
      className="sticky top-0 z-20 border-b"
      style={{
        borderColor: 'var(--border)',
        background: 'color-mix(in srgb, var(--surface) 78%, transparent)',
        backdropFilter: 'blur(10px)',
      }}
    >
      <nav className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4">
        {/* Brand */}
        <Link to={user ? '/dashboard' : '/'} className="flex items-center gap-2.5">
          <CapMark />
          <span className="font-serif text-xl font-semibold" style={{ color: 'var(--text)' }}>
            Student <span style={{ color: 'var(--brand)' }}>Tools</span>
          </span>
        </Link>

        {user && (
          <div className="ml-2 hidden items-center gap-1 lg:flex">
            {[
              ['Dashboard', '/dashboard'],
              ['Activity', '/dashboard'],
              ['Saved', '/dashboard'],
            ].map(([label, to], i) => (
              <NavLink
                key={label}
                to={to}
                end
                className={({ isActive }) =>
                  `rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                    isActive && i === 0 ? '' : 'text-gray-600 hover:bg-gray-100'
                  }`
                }
                style={({ isActive }) =>
                  isActive && i === 0
                    ? { background: 'var(--brand-tint)', color: 'var(--brand)' }
                    : undefined
                }
              >
                {label}
              </NavLink>
            ))}
          </div>
        )}

        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          <ThemeToggle />

          {user ? (
            <>
              <Link
                to="/profile"
                className="flex items-center gap-2 rounded-full border py-1 pl-1 pr-2 transition hover:bg-gray-100"
                style={{ borderColor: 'var(--border)' }}
              >
                <span
                  className="grid h-7 w-7 place-items-center rounded-full text-sm font-semibold text-white"
                  style={{ background: 'linear-gradient(135deg, #ff8a4c, #f2661f)' }}
                >
                  {(user.fullName || 'A').trim().charAt(0).toUpperCase()}
                </span>
                <span className="hidden text-sm font-medium sm:inline">
                  {user.fullName?.split(' ')[0] || 'You'}
                </span>
                <svg className="hidden sm:block" width="14" height="14" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                  style={{ color: 'var(--faint)' }} aria-hidden="true">
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-sm text-gray-600 transition hover:bg-gray-100"
                style={{ borderColor: 'var(--border)' }}
                aria-label="Log out"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <path d="m16 17 5-5-5-5" />
                  <path d="M21 12H9" />
                </svg>
                <span className="hidden sm:inline">Log out</span>
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm text-gray-600 hover:text-gray-900">Login</Link>
              <Link to="/register" className="btn-primary py-1.5">Register</Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
