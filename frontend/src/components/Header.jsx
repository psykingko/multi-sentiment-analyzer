import React, { useRef } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

const navItems = [
  { to: '/', label: 'Home' },
  { to: '/analyze', label: 'Text Analyzer' },
  { to: '/face-scan', label: 'Face Scan' },
  { to: '/insights', label: 'Insights' },
];

export default function Header() {
  const location = useLocation();
  const navRefs = useRef([]);

  return (
    <header className="w-full bg-[#040D12] border-b border-transparent shadow-none fixed top-0 left-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-3">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <span className="inline-block">
            {/* Placeholder SVG logo */}
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="16" cy="16" r="14" stroke="#00FFCC" strokeWidth="3" fill="#181A1B" />
              <circle cx="16" cy="16" r="7" fill="#00FFCC" />
            </svg>
          </span>
          <span className="unbounded-bold text-xl tracking-widest text-white hidden sm:inline">Multi-Sentiment Analyzer</span>
        </Link>
        {/* Centered nav with animated slim ring */}
        <nav className="flex-1 flex justify-center relative">
          <ul className="flex gap-6 md:gap-8 relative">
            {navItems.map((item, idx) => {
              const isActive = item.to === '/' ? location.pathname === '/' : location.pathname.startsWith(item.to);
              return (
                <li key={item.to} className="relative flex items-center">
                  <NavLink
                    to={item.to}
                    ref={el => navRefs.current[idx] = el}
                    className={({ isActive }) =>
                      `inter-medium text-white text-base px-6 py-2 rounded-xl transition-all duration-150
                      hover:text-accent focus-visible:outline-none
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
                </li>
              );
            })}
          </ul>
        </nav>
        {/* Get Started button */}
        <Link
          to="/analyze"
          className="ml-4 px-5 py-2 unbounded-bold text-base rounded-full bg-[#181A1B] text-white border border-[#23272b] hover:bg-accent hover:text-[#181A1B] transition-all duration-150"
        >
          Get Started
        </Link>
      </div>
    </header>
  );
}
