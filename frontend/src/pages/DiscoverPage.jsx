import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import PaperCard from '../components/PaperCard.jsx';
import EmptyState from '../components/EmptyState.jsx';
import Spinner from '../components/Spinner.jsx';

export default function DiscoverPage() {
  const { user, updateUser } = useAuth();
  const [recs, setRecs] = useState([]);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [added, setAdded] = useState(new Set());
  const [serendipity, setSerendipity] = useState(user?.serendipityLevel ?? 40);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/papers/recommend');
      setRecs(data.recommendations || []);
      setNote(data.note || '');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Could not load recommendations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const changeSerendipity = async (value) => {
    setSerendipity(value);
    try {
      await updateUser({ serendipityLevel: value });
    } catch { /* non-fatal */ }
  };

  const handleAdd = async (paper) => {
    try {
      await api.post('/papers', paper);
      setAdded((s) => new Set(s).add(paper.openalexId));
      toast.success('Added to library');
    } catch (err) {
      if (err.response?.status === 409) {
        setAdded((s) => new Set(s).add(paper.openalexId));
      } else {
        toast.error(err.response?.data?.error || 'Could not add paper');
      }
    }
  };

  return (
    <div>
      <h1 className="font-serif text-3xl text-ink-900 mb-2">Discover</h1>
      <p className="text-sm text-ink-500 mb-6">
        Papers the works in your library point at &mdash; sorted by overlap, filtered by your
        serendipity dial.
      </p>

      <section className="card p-5 mb-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h2 className="font-serif text-lg text-ink-900">Serendipity dial</h2>
            <p className="text-xs text-ink-500 mt-0.5">
              Low: strong citation overlap. High: sample further out for serendipity (Foster &amp; Ford, 2003).
            </p>
          </div>
          <div className="w-full md:w-80">
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={serendipity}
              onChange={(e) => setSerendipity(parseInt(e.target.value))}
              onMouseUp={(e) => changeSerendipity(parseInt(e.target.value))}
              onTouchEnd={(e) => changeSerendipity(parseInt(e.target.value))}
              className="w-full accent-accent-600"
            />
            <div className="flex justify-between text-xs text-ink-400 mt-1">
              <span>focused</span>
              <span className="font-medium text-ink-700">{serendipity}</span>
              <span>exploratory</span>
            </div>
            <button className="btn-secondary mt-3 w-full" onClick={load}>
              Refresh recommendations
            </button>
          </div>
        </div>
      </section>

      {loading ? (
        <div className="flex justify-center py-8"><Spinner /></div>
      ) : recs.length === 0 ? (
        <EmptyState
          title="Not enough signal yet"
          hint={note || 'Add a handful of papers to your library — the more references they have, the better the recommendations.'}
          action={<Link to="/search" className="btn-primary">Add papers</Link>}
        />
      ) : (
        <div className="grid gap-3">
          {recs.map((paper) => (
            <PaperCard
              key={paper.openalexId}
              paper={paper}
              onAdd={added.has(paper.openalexId) ? null : handleAdd}
              actions={
                added.has(paper.openalexId) ? (
                  <span className="chip text-emerald-700 border-emerald-200 bg-emerald-50">In library</span>
                ) : null
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
