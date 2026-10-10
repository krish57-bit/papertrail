import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const linkClass = ({ isActive }) =>
  `text-sm font-medium px-3 py-1.5 rounded-md transition-colors ${
    isActive ? 'bg-ink-100 text-ink-900' : 'text-ink-600 hover:text-ink-900 hover:bg-ink-100'
  }`;

export default function Navbar() {
  const { user, logout } = useAuth();
  const nav = useNavigate();

  const handleLogout = () => {
    logout();
    nav('/');
  };

  return (
    <header className="border-b border-ink-100 bg-white/80 backdrop-blur sticky top-0 z-10">
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
        <Link to={user ? '/library' : '/'} className="flex items-center gap-2 group">
          <span className="inline-block w-6 h-6 rounded-sm bg-ink-800 group-hover:bg-accent-600 transition" />
          <span className="font-serif font-semibold text-lg text-ink-900">PaperTrail</span>
        </Link>

        {user ? (
          <nav className="flex items-center gap-1">
            <NavLink to="/library" className={linkClass}>Library</NavLink>
            <NavLink to="/search" className={linkClass}>Search</NavLink>
            <NavLink to="/discover" className={linkClass}>Discover</NavLink>
            <NavLink to="/collections" className={linkClass}>Collections</NavLink>
            <NavLink to="/settings" className={linkClass}>Settings</NavLink>
            <span className="hidden md:inline text-ink-400 mx-2">|</span>
            <span className="hidden md:inline text-sm text-ink-500">@{user.username}</span>
            <button onClick={handleLogout} className="btn-ghost text-sm">Sign out</button>
          </nav>
        ) : (
          <nav className="flex items-center gap-2">
            <Link to="/login" className="btn-ghost text-sm">Sign in</Link>
            <Link to="/register" className="btn-primary">Get started</Link>
          </nav>
        )}
      </div>
    </header>
  );
}
