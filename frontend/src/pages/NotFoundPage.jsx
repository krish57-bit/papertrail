import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="text-center py-20">
      <h1 className="font-serif text-5xl text-ink-900 mb-3">404</h1>
      <p className="text-ink-500 mb-6">This page is not on the shelf.</p>
      <Link to="/" className="btn-primary">Back home</Link>
    </div>
  );
}
