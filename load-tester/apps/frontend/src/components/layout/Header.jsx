import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Logo = () => (
  <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="currentColor" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const Header = () => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const isActive = (path) => location.pathname === path;

  return (
    <header className="bg-gradient-to-r from-primary-700 via-primary-600 to-primary-700 shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group" aria-label="Load Tester - Home">
            <div className="bg-white/10 p-2 rounded-lg group-hover:bg-white/20 transition-colors">
              <Logo aria-hidden="true" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold text-white tracking-tight">Load Tester</span>
              <span className="text-xs text-primary-200 font-medium hidden sm:block">API Performance Testing</span>
            </div>
          </Link>
          
          {/* Desktop Navigation */}
          <nav aria-label="Main navigation" className="hidden md:flex items-center gap-2">
            <Link 
              to="/" 
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                isActive('/') 
                  ? 'bg-white/20 text-white' 
                  : 'text-primary-100 hover:bg-white/10 hover:text-white'
              }`}
            >
              <span className="flex items-center gap-2">
                <svg aria-hidden="true" className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
                Dashboard
              </span>
            </Link>
            <Link 
              to="/scenarios" 
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                location.pathname.startsWith('/scenarios')
                  ? 'bg-white/20 text-white' 
                  : 'text-primary-100 hover:bg-white/10 hover:text-white'
              }`}
            >
              <span className="flex items-center gap-2">
                <svg aria-hidden="true" className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                Scenarios
              </span>
            </Link>
            <Link 
              to="/endpoints/new" 
              className="bg-white text-primary-700 px-4 py-2 rounded-lg font-semibold hover:bg-primary-50 hover:shadow-md transition-all flex items-center gap-2"
            >
              <svg aria-hidden="true" className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Endpoint
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden p-2 rounded-lg text-white hover:bg-white/10"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
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

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <nav aria-label="Main navigation" className="md:hidden mt-4 pt-4 border-t border-white/20 space-y-2">
            <Link 
              to="/" 
              className={`block px-4 py-2 rounded-lg font-medium transition-all ${
                isActive('/') 
                  ? 'bg-white/20 text-white' 
                  : 'text-primary-100 hover:bg-white/10'
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Dashboard
            </Link>
            <Link 
              to="/scenarios" 
              className={`block px-4 py-2 rounded-lg font-medium transition-all ${
                location.pathname.startsWith('/scenarios')
                  ? 'bg-white/20 text-white' 
                  : 'text-primary-100 hover:bg-white/10'
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Scenarios
            </Link>
            <Link 
              to="/endpoints/new" 
              className="block bg-white text-primary-700 px-4 py-2 rounded-lg font-semibold text-center"
              onClick={() => setMobileMenuOpen(false)}
            >
              + Add Endpoint
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
};
