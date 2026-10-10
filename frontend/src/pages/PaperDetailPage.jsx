import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api.js';
import Spinner from '../components/Spinner.jsx';

const STATUSES = ['want-to-read', 'reading', 'read'];

export default function PaperDetailPage() {
  const { id } = useParams();
  const nav = useNavigate();
  const [paper, setPaper] = useState(null);
  const [notes, setNotes] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    api.get(`/papers/${id}`)
      .then((res) => {
        if (cancelled) return;
        setPaper(res.data.paper);
        setNotes(res.data.paper.notes || '');
      })
      .catch((err) => {
        if (cancelled) return;
        toast.error(err.response?.data?.error || 'Not found');
        nav('/library');
      });
    return () => { cancelled = true; };
  }, [id, nav]);

  if (!paper) {
    return <div className="flex justify-center py-10"><Spinner /></div>;
  }

  const update = async (patch) => {
    setSaving(true);
    try {
      const { data } = await api.patch(`/papers/${paper._id}`, patch);
      setPaper(data.paper);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const addTag = () => {
    const t = tagInput.trim().toLowerCase();
    if (!t) return;
    if (paper.tags.includes(t)) {
      setTagInput('');
      return;
    }
    update({ tags: [...paper.tags, t] });
    setTagInput('');
  };

  const removeTag = (tag) => {
    update({ tags: paper.tags.filter((t) => t !== tag) });
  };

  const saveNotes = () => {
    update({ notes });
  };

  const handleDelete = async () => {
    if (!confirm('Remove this paper from your library?')) return;
    try {
      await api.delete(`/papers/${paper._id}`);
      toast.success('Removed');
      nav('/library');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Could not remove');
    }
  };

  const readingDays = Math.floor(
    (Date.now() - new Date(paper.createdAt).getTime()) / 86400000
  );

  return (
    <div className="max-w-3xl mx-auto">
      <Link to="/library" className="text-sm text-ink-500 hover:text-ink-800">← Back to library</Link>

      <article className="card p-6 md:p-8 mt-3">
        <div className="flex flex-wrap gap-2 items-center mb-3">
          {STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => update({ status: s })}
              className={`text-xs rounded-full border px-2.5 py-1 transition ${
                paper.status === s
                  ? 'bg-ink-800 text-white border-ink-800'
                  : 'border-ink-200 text-ink-600 hover:bg-ink-100'
              }`}
            >
              {s.replace('-', ' ')}
            </button>
          ))}
          {paper.status !== 'read' && (
            <span className="text-xs text-ink-400 ml-2">
              on your shelf for {readingDays} day{readingDays === 1 ? '' : 's'}
            </span>
          )}
        </div>

        <h1 className="font-serif text-2xl md:text-3xl text-ink-900 leading-tight">
          {paper.title}
        </h1>

        <p className="text-sm text-ink-500 mt-2">
          {paper.authors.join(', ') || 'Unknown authors'}
          {paper.year && ` · ${paper.year}`}
          {paper.venue && <> · <span className="italic">{paper.venue}</span></>}
        </p>

        {paper.citationsCount > 0 && (
          <p className="text-xs text-ink-500 mt-1">
            {paper.citationsCount.toLocaleString()} citations · OpenAlex {paper.openalexId}
          </p>
        )}

        <div className="mt-5 flex items-center gap-3">
          {paper.url && (
            <a href={paper.url} target="_blank" rel="noreferrer" className="btn-secondary">
              Open source →
            </a>
          )}
          <button className="btn-ghost text-red-600" onClick={handleDelete}>Remove</button>
        </div>

        {paper.abstract && (
          <>
            <h2 className="font-serif text-lg mt-6 mb-2">Abstract</h2>
            <p className="text-ink-700 leading-relaxed text-sm whitespace-pre-wrap">
              {paper.abstract}
            </p>
          </>
        )}

        <h2 className="font-serif text-lg mt-6 mb-2">Rating</h2>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              onClick={() => update({ rating: paper.rating === n ? 0 : n })}
              className={`text-2xl transition ${
                n <= paper.rating ? 'text-accent-600' : 'text-ink-200 hover:text-ink-400'
              }`}
              aria-label={`Rate ${n} stars`}
            >
              ★
            </button>
          ))}
        </div>

        <h2 className="font-serif text-lg mt-6 mb-2">Tags</h2>
        <div className="flex flex-wrap gap-2 mb-2">
          {paper.tags.map((t) => (
            <span key={t} className="chip">
              #{t}
              <button
                className="ml-1 text-ink-400 hover:text-red-600"
                onClick={() => removeTag(t)}
                aria-label={`Remove tag ${t}`}
              >
                ×
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            className="input"
            placeholder="Add a tag (press enter)"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
          />
          <button className="btn-secondary" onClick={addTag}>Add</button>
        </div>

        <h2 className="font-serif text-lg mt-6 mb-2">Notes</h2>
        <textarea
          className="input min-h-[180px] font-serif text-base leading-relaxed"
          placeholder="What struck you? What did you want to remember?"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
        <div className="flex justify-end mt-2">
          <button
            className="btn-primary"
            disabled={saving || notes === paper.notes}
            onClick={saveNotes}
          >
            {saving ? <Spinner size={14} /> : 'Save notes'}
          </button>
        </div>
      </article>
    </div>
  );
}
