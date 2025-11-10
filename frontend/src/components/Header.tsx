import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
// Using inline SVGs / emojis for icons to avoid external dependency

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [query, setQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    try {
      const params = new URLSearchParams(location.search);
      const q = params.get('q') || '';
      setQuery(q);
    } catch (err) {
      // ignore
    }
  }, [location.search]);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setMobileMenuOpen(false);
  };

  const openAI = () => {
    // Navigate to internal AI page
    navigate('/ai');
    setMobileMenuOpen(false);
  };
  
  return (
    <header className="bg-white border-b sticky top-0 z-40">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-600 rounded-md flex items-center justify-center text-white font-bold text-sm sm:text-base">📚</div>
            <span className="text-base sm:text-lg font-semibold text-gray-800">LibraryHub</span>
          </Link>

          {/* Search bar - hidden on mobile, shown on tablet+ */}
          <div className="hidden md:flex flex-1 px-4 lg:px-6">
            <div className="max-w-3xl mx-auto relative w-full">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const q = query.trim();
                    navigate(`/dashboard${q ? `?q=${encodeURIComponent(q)}` : ''}`);
                  }
                }}
                aria-label="Search books"
                className="w-full rounded-full border border-gray-200 px-4 py-2.5 sm:py-3 pl-10 sm:pl-12 pr-12 sm:pr-14 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-200 text-sm sm:text-base"
                placeholder="Search books, authors, ISBN..."
              />
              <svg className="absolute left-3 sm:left-4 top-2.5 sm:top-3.5 text-gray-400 w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <circle cx="11" cy="11" r="7"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <button
                onClick={openAI}
                aria-label="Open AI"
                title="Open AI"
                className="absolute right-2 sm:right-3 top-2 sm:top-2.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full p-1.5 sm:p-2 shadow-md hover:opacity-95 focus:outline-none"
              >
                <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M12 3v3"></path>
                  <path d="M12 18v3"></path>
                  <path d="M4.2 7.2l2.1 2.1"></path>
                  <path d="M17.7 15.7l2.1 2.1"></path>
                  <path d="M7 12h3"></path>
                  <path d="M14 12h3"></path>
                </svg>
              </button>
            </div>
          </div>

          {/* Desktop user actions */}
          <div className="hidden md:flex items-center gap-3 flex-shrink-0">
            {!user ? (
              <>
                <Link to="/login" className="px-4 py-2 rounded-full bg-blue-600 text-white font-semibold text-sm whitespace-nowrap">Login</Link>
              </>
            ) : (
              <div className="flex items-center gap-2 sm:gap-3">
                {user.role === 'admin' && (
                  <Link to="/admin" className="px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-sm whitespace-nowrap">Admin</Link>
                )}
                <span className="text-sm text-gray-700 hidden lg:inline truncate max-w-[120px]">{user.name}</span>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleLogout}
                  className="px-3 py-1 border rounded-md text-sm whitespace-nowrap"
                >
                  Logout
                </motion.button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-2">
            {user && (
              <button
                onClick={openAI}
                aria-label="Open AI"
                className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full shadow-md"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 3v3"></path>
                  <path d="M12 18v3"></path>
                  <path d="M4.2 7.2l2.1 2.1"></path>
                  <path d="M17.7 15.7l2.1 2.1"></path>
                  <path d="M7 12h3"></path>
                  <path d="M14 12h3"></path>
                </svg>
              </button>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-gray-700 hover:bg-gray-100 rounded-md"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile search bar */}
        {!mobileMenuOpen && (
          <div className="md:hidden mt-3">
            <div className="relative">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const q = query.trim();
                    navigate(`/dashboard${q ? `?q=${encodeURIComponent(q)}` : ''}`);
                  }
                }}
                aria-label="Search books"
                className="w-full rounded-full border border-gray-200 px-4 py-2.5 pl-10 pr-4 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-200 text-sm"
                placeholder="Search books, authors, ISBN..."
              />
              <svg className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <circle cx="11" cy="11" r="7"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </div>
          </div>
        )}

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden mt-4 pb-4 border-t pt-4"
            >
              {!user ? (
                <div className="space-y-2">
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block w-full px-4 py-2 rounded-full bg-blue-600 text-white font-semibold text-center"
                  >
                    Login
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="px-2 py-2 border-b">
                    <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                    <p className="text-xs text-gray-500">{user.role}</p>
                  </div>
                  {user.role === 'admin' && (
                    <Link
                      to="/admin"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-4 py-2 rounded-md bg-gray-100 text-gray-700 text-sm"
                    >
                      Admin Panel
                    </Link>
                  )}
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={handleLogout}
                    className="w-full px-4 py-2 border rounded-md text-sm text-left"
                  >
                    Logout
                  </motion.button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* no secondary nav here — primary navigation is in the layout */}
    </header>
  );
};

export default Header;

