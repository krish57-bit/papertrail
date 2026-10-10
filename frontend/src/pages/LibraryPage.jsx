import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api.js';
import PaperCard from '../components/PaperCard.jsx';
import EmptyState from '../components/EmptyState.jsx';
import Spinner from '../components/Spinner.jsx';

const SORTS = [
  { value: 'recent', label: 'Recently added' },
  { value: 'oldest', label: 'Oldest first' },
  { value: 'debt', label: 'Reading debt (oldest unread)' },
  { value: 'year', label: 'Publication year' },
  { value: 'citations', label: 'Most cited' },
  { value: 'rating', label: 'Highest rated' },
];

const STATUSES = [
  { value: '', label: 'All papers' },
  { value: 'want-to-read', label: 'Want to read' },
  { value: 'reading', label: 'Reading' },
  { value: 'read', label: 'Read' },
];

export default function LibraryPage() {
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [sort, setSort] = useState('recent');
  const [query, setQuery] = useState('');
  const [stats, setStats] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const [papersRes, statsRes] = await Promise.all([
        api.get('/papers', { params: { status: status || undefined, sort, q: query || undefined } }),
        api.get('/papers/stats'),
      ]);
      setPapers(papersRes.data.papers);
      setStats(statsRes.data);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Could not load library');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [status, sort]);

  const handleDelete = async (paper) => {
    if (!confirm(`Remove "${paper.title}" from your library?`)) return;
    try {
      await api.delete(`/papers/${paper._id}`);
      setPapers((prev) => prev.filter((p) => p._id !== paper._id));
      toast.success('Removed');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Could not remove paper');
    }
  };

  const tagCloud = useMemo(() => stats?.topTags || [], [stats]);

  return (
    <div>
      <div className="flex items-start justify-between flex-wrap gap-4 mb-6">
        <div>
          <h1 className="font-serif text-3xl text-ink-900">Your library</h1>
          <p className="text-sm text-ink-500 mt-1">
            {stats ? `${stats.total} paper${stats.total === 1 ? '' : 's'} on your shelf.` : ' '}
          </p>
        </div>
        <Link to="/search" className="btn-primary">+ Add from search</Link>
      </div>

      {stats && stats.total > 0 && (
        <section className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <StatCard label="Want to read" value={stats.byStatus['want-to-read'] || 0} />
          <StatCard label="Reading" value={stats.byStatus.reading || 0} />
          <StatCard label="Read" value={stats.byStatus.read || 0} />
          <StatCard
            label="Reading debt"
            value={stats.oldestUnread
              ? `${Math.floor((Date.now() - new Date(stats.oldestUnread.createdAt).getTime()) / 86400000)}d`
              : '—'}
            hint="oldest unread"
          />
        </section>
      )}

      <section className="card p-3 mb-5 flex flex-wrap items-center gap-2">
        <select
          className="input max-w-[200px]"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          {STATUSES.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
        <select
          className="input max-w-[220px]"
          value={sort}
          onChange={(e) => setSort(e.target.value)}
        >
          {SORTS.map((s) => (
            <option key={s.value} value={s.value}>Sort: {s.label}</option>
          ))}
        </select>
        <div className="flex-1 min-w-[200px] flex gap-2">
          <input
            type="search"
            placeholder="Search within library…"
            className="input"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') load(); }}
          />
          <button className="btn-secondary" onClick={load}>Go</button>
        </div>
      </section>

      {tagCloud.length > 0 && (
        <section className="mb-5 flex flex-wrap gap-2">
          {tagCloud.map((t) => (
            <span key={t.tag} className="chip" title={`${t.count} papers`}>
              #{t.tag} <span className="text-ink-400 ml-0.5">{t.count}</span>
            </span>
          ))}
        </section>
      )}

      {loading ? (
        <div className="flex justify-center py-10"><Spinner /></div>
      ) : papers.length === 0 ? (
        <EmptyState
          icon=""
          title="Nothing on this shelf yet"
          hint="Head to search and pull in a paper you're reading or want to read."
          action={<Link to="/search" className="btn-primary">Find papers</Link>}
        />
      ) : (
        <div className="grid gap-3">
          {papers.map((p) => (
            <PaperCard key={p._id} paper={p} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, hint }) {
  return (
    <div className="card p-4">
      <div className="text-xs uppercase tracking-wide text-ink-500">{label}</div>
      <div className="font-serif text-2xl text-ink-900 mt-1">{value}</div>
      {hint && <div className="text-xs text-ink-400 mt-0.5">{hint}</div>}
    </div>
  );
}
