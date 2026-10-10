import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext.jsx';
import Spinner from '../components/Spinner.jsx';

export default function LoginPage() {
  const { user, initialized, login } = useAuth();
  const nav = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [submitting, setSubmitting] = useState(false);

  if (initialized && user) return <Navigate to="/library" replace />;

  const submit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    try {
      await login(form.email.trim(), form.password);
      toast.success('Welcome back');
      const target = location.state?.from?.pathname || '/library';
      nav(target, { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.error || 'Could not sign in');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto card p-6 md:p-8 mt-6">
      <h1 className="font-serif text-2xl text-ink-900 mb-1">Welcome back</h1>
      <p className="text-sm text-ink-500 mb-6">Pick up your reading where you left off.</p>

      <form onSubmit={submit} className="space-y-4">
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
            autoComplete="current-password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="input"
          />
        </div>
        <button type="submit" className="btn-primary w-full" disabled={submitting}>
          {submitting ? <Spinner size={16} /> : 'Sign in'}
        </button>
      </form>

      <p className="text-sm text-ink-500 mt-5 text-center">
        New here? <Link to="/register">Create an account</Link>
      </p>
    </div>
  );
}
