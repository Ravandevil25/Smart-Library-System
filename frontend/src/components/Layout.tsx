import React from 'react';
import { Link } from 'react-router-dom';
import Header from './Header';
import { useAuth } from '../hooks/useAuth';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user } = useAuth();
  // layout uses auth and renders header/banner/hero

  if (!user) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* student nav (kept simple) */}
      {user.role === 'student' && (
        <nav className="border-b bg-white sticky top-[73px] md:top-[81px] z-30">
          <div className="container mx-auto px-4 py-2 sm:py-3">
            <div className="flex gap-2 sm:gap-3 overflow-x-auto scrollbar-hide">
              <Link to="/dashboard" className="px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm text-gray-700 hover:bg-primary-50 whitespace-nowrap flex-shrink-0">Dashboard</Link>
              <Link to="/borrow" className="px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm text-gray-700 hover:bg-primary-50 whitespace-nowrap flex-shrink-0">Borrow</Link>
              <Link to="/return" className="px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm text-gray-700 hover:bg-primary-50 whitespace-nowrap flex-shrink-0">Return</Link>
              <Link to="/history" className="px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm text-gray-700 hover:bg-primary-50 whitespace-nowrap flex-shrink-0">History</Link>
              <Link to="/wishlist" className="px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm text-gray-700 hover:bg-primary-50 whitespace-nowrap flex-shrink-0">Wishlist</Link>
            </div>
          </div>
        </nav>
      )}

      <main>{children}</main>
    </div>
  );
};

export default Layout;

