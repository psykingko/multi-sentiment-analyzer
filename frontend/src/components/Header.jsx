import React, { useRef, useState, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import BackendStatus from './BackendStatus';
import { useAuth } from '../contexts/AuthContext';
import { LoginModal, LogoutConfirmModal } from '../contexts/AuthContext';
import { User, LogOut } from 'lucide-react';

const navItems = [
  { to: '/', label: 'Home' },
  { to: '/analyze', label: 'Text Analyzer' },
  { to: '/face-scan', label: 'Face Scan' },
  { to: '/insights', label: 'Insights' },
];

export default function Header() {
  const location = useLocation();
  const navRefs = useRef([]);
  const { user, isAuthenticated, logout } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const profileRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownOpen]);

  return (
    <header className="w-full bg-[#040D12] border-b border-transparent shadow-none fixed top-0 left-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-2.5">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 flex-shrink-0">
          <span className="inline-block">
            {/* Placeholder SVG logo */}
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="16" cy="16" r="14" stroke="#00FFCC" strokeWidth="3" fill="#181A1B" />
              <circle cx="16" cy="16" r="7" fill="#00FFCC" />
            </svg>
          </span>
          <span className="unbounded-bold text-lg md:text-xl tracking-widest text-white hidden sm:inline">Multi-Sentiment Analyzer</span>
        </Link>
        {/* All nav items and right elements in one container with even spacing */}
        <div className="flex-1 flex items-center justify-evenly px-4">
          {/* Navigation items */}
          {navItems.map((item, idx) => {
            const isActive = item.to === '/' ? location.pathname === '/' : location.pathname.startsWith(item.to);
            return (
              <div key={item.to} className="relative flex items-center">
                <NavLink
                  to={item.to}
                  ref={el => navRefs.current[idx] = el}
                  className={({ isActive }) =>
                    `inter-medium text-white text-sm md:text-base px-3 md:px-4 py-1.5 rounded-xl transition-all duration-150
                    hover:text-accent focus-visible:outline-none whitespace-nowrap
                    ${isActive ? 'text-accent' : ''}`
                  }
                  end={item.to === '/'}
                >
                  {isActive && (
                    <motion.div
                      layoutId="nav-ring"
                      className="absolute inset-0 rounded-xl border pointer-events-none"
                      style={{
                        borderWidth: 2,
                        borderColor: '#FFD700',
                        boxShadow: '0 0 6px 1px #FFD70066',
                      }}
                      transition={{ type: 'spring', stiffness: 600, damping: 24 }}
                    />
                  )}
                  <span className="relative z-10">{item.label}</span>
                </NavLink>
              </div>
            );
          })}
          {/* Backend Status */}
          <BackendStatus />
          {/* Auth Section */}
          <div className="flex items-center gap-2" ref={profileRef}>
            {isAuthenticated ? (
              <div className="relative">
                <motion.button
                  className="flex items-center justify-center w-9 h-9 rounded-full bg-[#181A1B] border border-[#23272b] hover:border-accent focus:outline-none focus:ring-2 focus:ring-accent/60 shadow-lg"
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => setDropdownOpen((open) => !open)}
                  aria-label="Profile menu"
                  type="button"
                >
                  {user?.image ? (
                    <img
                      src={user.image}
                      alt="Profile"
                      className="w-7 h-7 rounded-full object-cover"
                    />
                  ) : (
                    <User className="w-6 h-6 text-white/80" />
                  )}
                </motion.button>
                {/* Dropdown menu */}
                {dropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 mt-2 w-48 bg-[#10151A] border border-accent rounded-xl shadow-2xl py-2 z-50 backdrop-blur-md"
                    style={{ boxShadow: '0 0 16px 2px #00FFCC55, 0 2px 16px #000A' }}
                  >
                    <button
                      className="flex items-center w-full px-4 py-2 text-sm text-white/90 hover:bg-accent/10 transition-colors gap-2"
                      onClick={() => { setDropdownOpen(false); /* TODO: Add recent analyses logic */ }}
                    >
                      <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="inline-block"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" /></svg>
                      Recent Analyses
                    </button>
                    <button
                      className="flex items-center w-full px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors gap-2"
                      onClick={() => { setDropdownOpen(false); setShowLogoutModal(true); }}
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </motion.div>
                )}
              </div>
            ) : (
              <button
                onClick={() => setShowLoginModal(true)}
                className="px-4 py-1.5 unbounded-bold text-sm rounded-full bg-[#00FFCC] text-[#181A1B] hover:bg-[#00FFCC]/80 transition-all duration-150"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </div>
      <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
      <LogoutConfirmModal isOpen={showLogoutModal} onClose={() => setShowLogoutModal(false)} onConfirm={logout} />
    </header>
  );
}
