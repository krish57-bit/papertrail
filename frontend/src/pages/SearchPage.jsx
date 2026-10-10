import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../services/api.js';
import { useDebounce } from '../hooks/useDebounce.js';
import PaperCard from '../components/PaperCard.jsx';
import Spinner from '../components/Spinner.jsx';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const debounced = useDebounce(query, 500);
  const [results, setResults] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [addedIds, setAddedIds] = useState(new Set());

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      if (!debounced || debounced.length < 3) {
        setResults([]);
        setTotal(0);
        return;
      }
      setLoading(true);
      try {
        const { data } = await api.get('/papers/search', { params: { q: debounced, page } });
        if (cancelled) return;
        setResults(data.results);
        setTotal(data.total);
      } catch (err) {
        if (!cancelled) toast.error(err.response?.data?.error || 'Search failed');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    run();
    return () => { cancelled = true; };
  }, [debounced, page]);

  useEffect(() => { setPage(1); }, [debounced]);

  const handleAdd = async (paper) => {
    try {
      const { data } = await api.post('/papers', paper);
      setAddedIds((prev) => new Set(prev).add(paper.openalexId));
      toast.success(`Added "${data.paper.title.slice(0, 40)}${data.paper.title.length > 40 ? '…' : ''}" to library`);
    } catch (err) {
      if (err.response?.status === 409) {
        toast('Already in your library', { icon: '✓' });
        setAddedIds((prev) => new Set(prev).add(paper.openalexId));
      } else {
        toast.error(err.response?.data?.error || 'Could not add paper');
      }
    }
  };

  return (
    <div>
      <h1 className="font-serif text-3xl text-ink-900 mb-2">Search papers</h1>
      <p className="text-sm text-ink-500 mb-6">
        Searching OpenAlex &mdash; a free, open index of 240M+ scholarly works.
      </p>

      <div className="flex gap-2 mb-6">
        <input
          autoFocus
          type="search"
          className="input"
          placeholder="Try: &quot;information foraging&quot;, &quot;retrieval augmented generation&quot;, &quot;sleep spindles&quot;…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {loading && <div className="flex justify-center py-6"><Spinner /></div>}

      {!loading && debounced && debounced.length >= 3 && (
        <p className="text-xs text-ink-500 mb-3">
          {total.toLocaleString()} result{total === 1 ? '' : 's'}
          {total > 0 && ` · page ${page}`}
        </p>
      )}

      <div className="grid gap-3">
        {results.map((paper) => (
          <PaperCard
            key={paper.openalexId}
            paper={paper}
            onAdd={addedIds.has(paper.openalexId) ? null : handleAdd}
            actions={
              addedIds.has(paper.openalexId) ? (
                <span className="chip text-emerald-700 border-emerald-200 bg-emerald-50">In library</span>
              ) : null
            }
          />
        ))}
      </div>

      {total > 10 && (
        <div className="mt-6 flex items-center justify-between">
          <button className="btn-secondary" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
            ← Previous
          </button>
          <span className="text-sm text-ink-500">page {page}</span>
          <button
            className="btn-secondary"
            disabled={page * 10 >= total}
            onClick={() => setPage((p) => p + 1)}
          >
            Next →
          </button>
        </div>
      )}

      {!loading && debounced && debounced.length >= 3 && results.length === 0 && (
        <p className="text-center text-ink-500 py-10">No results. Try different words.</p>
      )}

      {(!debounced || debounced.length < 3) && (
        <div className="text-center text-ink-400 text-sm py-16">
          Start typing to search &mdash; three characters minimum.
        </div>
      )}
    </div>
  );
}
