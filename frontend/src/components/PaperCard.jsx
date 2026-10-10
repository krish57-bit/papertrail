import { Link } from 'react-router-dom';

const statusLabel = {
  'want-to-read': 'Want to read',
  'reading': 'Reading',
  'read': 'Read',
};

const statusClass = {
  'want-to-read': 'badge-want',
  'reading': 'badge-reading',
  'read': 'badge-read',
};

function formatAuthors(authors = []) {
  if (!authors.length) return 'Unknown authors';
  if (authors.length <= 3) return authors.join(', ');
  return `${authors.slice(0, 3).join(', ')} + ${authors.length - 3}`;
}

export default function PaperCard({ paper, onAdd, onDelete, actions, variant = 'library' }) {
  const inLibrary = Boolean(paper._id);

  return (
    <article className="card p-4 hover:shadow-md transition">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            {inLibrary && (
              <span className={statusClass[paper.status] || 'badge-want'}>
                {statusLabel[paper.status]}
              </span>
            )}
            {paper.year && <span className="text-xs text-ink-500">{paper.year}</span>}
            {paper.citationsCount > 0 && (
              <span className="text-xs text-ink-500" title="Citations">
                · {paper.citationsCount.toLocaleString()} cites
              </span>
            )}
            {typeof paper.coCitationStrength === 'number' && paper.coCitationStrength > 0 && (
              <span className="text-xs text-accent-600 font-medium" title="How many of your papers reference this">
                · cited by {paper.coCitationStrength} of your papers
              </span>
            )}
          </div>

          {inLibrary ? (
            <Link to={`/paper/${paper._id}`} className="font-serif text-base leading-snug text-ink-900 hover:text-accent-600 transition no-underline block">
              {paper.title}
            </Link>
          ) : (
            <h3 className="font-serif text-base leading-snug text-ink-900">{paper.title}</h3>
          )}

          <p className="text-xs text-ink-500 mt-1">
            {formatAuthors(paper.authors)}
            {paper.venue && <span className="italic"> · {paper.venue}</span>}
          </p>

          {paper.abstract && variant !== 'compact' && (
            <p className="text-sm text-ink-600 mt-2 line-clamp-3">{paper.abstract}</p>
          )}

          {paper.tags?.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {paper.tags.map((tag) => (
                <span key={tag} className="chip">#{tag}</span>
              ))}
            </div>
          )}

          {paper.concepts?.length > 0 && !paper.tags?.length && (
            <div className="mt-2 flex flex-wrap gap-1">
              {paper.concepts.slice(0, 4).map((c) => (
                <span key={c} className="chip">{c}</span>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2 shrink-0">
          {onAdd && !inLibrary && (
            <button className="btn-secondary text-sm whitespace-nowrap" onClick={() => onAdd(paper)}>
              + Library
            </button>
          )}
          {paper.url && (
            <a href={paper.url} target="_blank" rel="noreferrer" className="btn-ghost text-sm whitespace-nowrap">
              Open
            </a>
          )}
          {onDelete && inLibrary && (
            <button className="btn-ghost text-xs text-ink-400 hover:text-red-600" onClick={() => onDelete(paper)}>
              Remove
            </button>
          )}
          {actions}
        </div>
      </div>
    </article>
  );
}
