import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api.js';
import EmptyState from '../components/EmptyState.jsx';
import Spinner from '../components/Spinner.jsx';

export default function CollectionsPage() {
  const [collections, setCollections] = useState([]);
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', isPublic: false, papers: [] });
  const [creating, setCreating] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [cols, pps] = await Promise.all([
        api.get('/collections'),
        api.get('/papers'),
      ]);
      setCollections(cols.data.collections);
      setPapers(pps.data.papers);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Could not load');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const togglePaper = (id) => {
    setForm((f) => ({
      ...f,
      papers: f.papers.includes(id) ? f.papers.filter((x) => x !== id) : [...f.papers, id],
    }));
  };

  const create = async () => {
    if (!form.name.trim()) {
      toast.error('Give the collection a name');
      return;
    }
    setCreating(true);
    try {
      const { data } = await api.post('/collections', form);
      setCollections((prev) => [data.collection, ...prev]);
      setForm({ name: '', description: '', isPublic: false, papers: [] });
      setShowNew(false);
      toast.success('Collection created');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Could not create');
    } finally {
      setCreating(false);
    }
  };

  const remove = async (id) => {
    if (!confirm('Delete this collection? Papers in it will not be removed from your library.')) return;
    try {
      await api.delete(`/collections/${id}`);
      setCollections((prev) => prev.filter((c) => c._id !== id));
      toast.success('Collection deleted');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Could not delete');
    }
  };

  const togglePublic = async (col) => {
    try {
      const { data } = await api.patch(`/collections/${col._id}`, { isPublic: !col.isPublic });
      setCollections((prev) => prev.map((c) => (c._id === col._id ? data.collection : c)));
    } catch (err) {
      toast.error(err.response?.data?.error || 'Could not update');
    }
  };

  return (
    <div>
      <div className="flex items-start justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="font-serif text-3xl text-ink-900">Collections</h1>
          <p className="text-sm text-ink-500 mt-1">Curate reading lists you can share.</p>
        </div>
        <button className="btn-primary" onClick={() => setShowNew((s) => !s)}>
          {showNew ? 'Cancel' : '+ New collection'}
        </button>
      </div>

      {showNew && (
        <section className="card p-5 mb-6">
          <div className="space-y-3">
            <input
              className="input"
              placeholder="Collection name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <textarea
              className="input min-h-[80px]"
              placeholder="A short description…"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
            <label className="flex items-center gap-2 text-sm text-ink-700">
              <input
                type="checkbox"
                checked={form.isPublic}
                onChange={(e) => setForm({ ...form, isPublic: e.target.checked })}
              />
              Public — share with a link
            </label>
            <div>
              <p className="text-sm text-ink-700 mb-2">Pick papers from your library:</p>
              <div className="max-h-60 overflow-auto border border-ink-100 rounded-md divide-y divide-ink-100">
                {papers.length === 0 ? (
                  <p className="text-sm text-ink-400 p-3">Your library is empty. Add some papers first.</p>
                ) : papers.map((p) => (
                  <label key={p._id} className="flex items-start gap-2 p-2 hover:bg-ink-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.papers.includes(p._id)}
                      onChange={() => togglePaper(p._id)}
                      className="mt-1"
                    />
                    <span className="text-sm text-ink-700 flex-1">
                      {p.title}
                      <span className="text-ink-400"> · {p.year || 'n/a'}</span>
                    </span>
                  </label>
                ))}
              </div>
            </div>
            <button className="btn-primary" disabled={creating} onClick={create}>
              {creating ? <Spinner size={14} /> : 'Create collection'}
            </button>
          </div>
        </section>
      )}

      {loading ? (
        <div className="flex justify-center py-8"><Spinner /></div>
      ) : collections.length === 0 ? (
        <EmptyState
          title="No collections yet"
          hint="Group papers around a question, a project, or a reading list."
        />
      ) : (
        <div className="grid gap-3">
          {collections.map((col) => (
            <article key={col._id} className="card p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <h2 className="font-serif text-lg text-ink-900">{col.name}</h2>
                  {col.description && (
                    <p className="text-sm text-ink-600 mt-1">{col.description}</p>
                  )}
                  <p className="text-xs text-ink-500 mt-2">
                    {col.papers?.length || 0} paper{col.papers?.length === 1 ? '' : 's'} ·{' '}
                    {col.isPublic ? 'public' : 'private'}
                    {col.isPublic && col.slug && (
                      <> · <span className="text-ink-400">slug: {col.slug}</span></>
                    )}
                  </p>
                  {col.papers?.length > 0 && (
                    <ul className="mt-3 space-y-1 text-sm text-ink-700">
                      {col.papers.slice(0, 5).map((p) => (
                        <li key={p._id}>
                          <Link to={`/paper/${p._id}`} className="hover:text-accent-600 text-ink-700">
                            {p.title}
                          </Link>
                        </li>
                      ))}
                      {col.papers.length > 5 && (
                        <li className="text-xs text-ink-400">+ {col.papers.length - 5} more</li>
                      )}
                    </ul>
                  )}
                </div>
                <div className="flex flex-col gap-1 shrink-0">
                  <button className="btn-ghost text-xs" onClick={() => togglePublic(col)}>
                    Make {col.isPublic ? 'private' : 'public'}
                  </button>
                  <button className="btn-ghost text-xs text-red-600" onClick={() => remove(col._id)}>
                    Delete
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
