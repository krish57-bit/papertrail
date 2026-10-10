import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

import LandingPage from './pages/LandingPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import LibraryPage from './pages/LibraryPage.jsx';
import SearchPage from './pages/SearchPage.jsx';
import PaperDetailPage from './pages/PaperDetailPage.jsx';
import DiscoverPage from './pages/DiscoverPage.jsx';
import CollectionsPage from './pages/CollectionsPage.jsx';
import SettingsPage from './pages/SettingsPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';

export default function App() {
  return (
    <div className="min-h-screen paper-bg">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/library"
            element={
              <ProtectedRoute>
                <LibraryPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/search"
            element={
              <ProtectedRoute>
                <SearchPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/discover"
            element={
              <ProtectedRoute>
                <DiscoverPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/paper/:id"
            element={
              <ProtectedRoute>
                <PaperDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/collections"
            element={
              <ProtectedRoute>
                <CollectionsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      <footer className="border-t border-ink-100 bg-white/60 mt-16">
        <div className="mx-auto max-w-6xl px-4 py-6 text-xs text-ink-500 flex flex-wrap justify-between gap-2">
          <span>PaperTrail · a reading companion for research</span>
          <span>
            Powered by{' '}
            <a href="https://openalex.org" target="_blank" rel="noreferrer">OpenAlex</a>
          </span>
        </div>
      </footer>
    </div>
  );
}
