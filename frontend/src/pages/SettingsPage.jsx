import { useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext.jsx';

export default function SettingsPage() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({
    bio: user?.bio || '',
    publicProfile: user?.publicProfile ?? true,
    serendipityLevel: user?.serendipityLevel ?? 40,
  });
  const [saving, setSaving] = useState(false);

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateUser({
        bio: form.bio,
        publicProfile: form.publicProfile,
        serendipityLevel: parseInt(form.serendipityLevel),
      });
      toast.success('Saved');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto">
      <h1 className="font-serif text-3xl text-ink-900 mb-6">Settings</h1>

      <form onSubmit={save} className="card p-6 space-y-5">
        <div>
          <label className="block text-sm text-ink-700 mb-1">Username</label>
          <input className="input" value={user?.username || ''} disabled />
        </div>
        <div>
          <label className="block text-sm text-ink-700 mb-1">Email</label>
          <input className="input" value={user?.email || ''} disabled />
        </div>
        <div>
          <label className="block text-sm text-ink-700 mb-1">Bio</label>
          <textarea
            className="input min-h-[80px]"
            maxLength={300}
            value={form.bio}
            onChange={(e) => setForm({ ...form, bio: e.target.value })}
            placeholder="One line about what you're reading these days…"
          />
          <p className="text-xs text-ink-400 mt-1">{form.bio.length}/300</p>
        </div>
        <div>
          <label className="flex items-center gap-2 text-sm text-ink-700">
            <input
              type="checkbox"
              checked={form.publicProfile}
              onChange={(e) => setForm({ ...form, publicProfile: e.target.checked })}
            />
            Public profile — show my username on public collections
          </label>
        </div>
        <div>
          <label className="block text-sm text-ink-700 mb-1">
            Serendipity level ({form.serendipityLevel})
          </label>
          <input
            type="range"
            min="0"
            max="100"
            step="5"
            className="w-full accent-accent-600"
            value={form.serendipityLevel}
            onChange={(e) => setForm({ ...form, serendipityLevel: e.target.value })}
          />
          <p className="text-xs text-ink-400 mt-1">
            Controls how far from your current reading recommendations are drawn.
          </p>
        </div>
        <button className="btn-primary" disabled={saving}>
          {saving ? 'Saving…' : 'Save changes'}
        </button>
      </form>
    </div>
  );
}
