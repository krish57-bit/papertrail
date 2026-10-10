import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function LandingPage() {
  const { user, initialized } = useAuth();
  if (initialized && user) return <Navigate to="/library" replace />;

  return (
    <div>
      <section className="pt-10 pb-16 text-center max-w-3xl mx-auto">
        <p className="text-xs uppercase tracking-wider text-accent-600 mb-4 font-medium">
          A reading companion for research
        </p>
        <h1 className="font-serif text-4xl md:text-5xl text-ink-900 leading-tight mb-5">
          Keep a trail of the papers that shape your thinking.
        </h1>
        <p className="text-ink-600 text-lg leading-relaxed">
          PaperTrail is a quiet space to collect papers, write notes, and discover what you did not
          know you were looking for &mdash; grounded in information foraging theory and citation networks.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Link to="/register" className="btn-primary">Create a free account</Link>
          <Link to="/login" className="btn-secondary">Sign in</Link>
        </div>
      </section>

      <section className="grid md:grid-cols-3 gap-5 pb-16">
        <Feature
          title="Search a universe"
          body="Pull from OpenAlex — 240M+ scholarly works, no API key required."
        />
        <Feature
          title="Hold your reading"
          body="Status, tags, ratings, and private notes. The simplest shelf for your papers."
        />
        <Feature
          title="Discover sideways"
          body="A serendipity dial surfaces papers your library points at, not just what you already know."
        />
      </section>

      <section className="card p-6 md:p-8 max-w-3xl mx-auto">
        <h2 className="font-serif text-xl text-ink-900 mb-3">The idea</h2>
        <p className="text-ink-600 leading-relaxed text-sm">
          Information foraging theory (Pirolli &amp; Card, 1999) describes how we move through
          information by following &ldquo;scent&rdquo; &mdash; cues that something worthwhile lies
          nearby. PaperTrail treats your library as a patch of scent: it watches which works your
          papers reference, counts the overlaps, and surfaces frequently-cited neighbours. Turn the
          serendipity dial up and it samples further out &mdash; closer to Foster &amp; Ford&apos;s
          (2003) model of designed-for serendipity in information seeking.
        </p>
      </section>
    </div>
  );
}

function Feature({ title, body }) {
  return (
    <div className="card p-5">
      <h3 className="font-serif text-lg text-ink-900 mb-1.5">{title}</h3>
      <p className="text-sm text-ink-600 leading-relaxed">{body}</p>
    </div>
  );
}
