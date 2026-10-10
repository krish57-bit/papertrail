import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext.jsx';
import Spinner from '../components/Spinner.jsx';

export default function RegisterPage() {
  const { user, initialized, register } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [submitting, setSubmitting] = useState(false);

  if (initialized && user) return <Navigate to="/library" replace />;

  const submit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    if (form.password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    setSubmitting(true);
    try {
      await register(form.username.trim(), form.email.trim(), form.password);
      toast.success('Account created');
      nav('/library', { replace: true });
    } catch (err) {
      const data = err.response?.data;
      toast.error(data?.error || 'Could not register');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto card p-6 md:p-8 mt-6">
      <h1 className="font-serif text-2xl text-ink-900 mb-1">Start your trail</h1>
      <p className="text-sm text-ink-500 mb-6">A quiet shelf for the papers that shape you.</p>

      <form onSubmit={submit} className="space-y-4">
        <div>
          <label htmlFor="username" className="block text-sm text-ink-700 mb-1">Username</label>
          <input
            id="username"
            required
            minLength={3}
            maxLength={30}
            pattern="[a-zA-Z0-9_-]+"
            autoComplete="username"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            className="input"
          />
          <p className="text-xs text-ink-400 mt-1">Letters, numbers, dash and underscore only.</p>
        </div>
        <div>
          <label htmlFor="email" className="block text-sm text-ink-700 mb-1">Email</label>
          <input
            id="email"
            type="email"
            required
            autoComplete="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="input"
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm text-ink-700 mb-1">Password</label>
          <input
            id="password"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="input"
          />
          <p className="text-xs text-ink-400 mt-1">At least 8 characters.</p>
        </div>
        <button type="submit" className="btn-primary w-full" disabled={submitting}>
          {submitting ? <Spinner size={16} /> : 'Create account'}
        </button>
      </form>

      <p className="text-sm text-ink-500 mt-5 text-center">
        Already have an account? <Link to="/login">Sign in</Link>
      </p>
    </div>
  );
}
