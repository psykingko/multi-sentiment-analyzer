import { useState, cloneElement } from 'react';

export default function Tooltip({ content, children }) {
  const [show, setShow] = useState(false);
  return (
    <span className="relative inline-block"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
      onFocus={() => setShow(true)}
      onBlur={() => setShow(false)}
      tabIndex={0}
    >
      {children}
      {show && (
        <span className="absolute z-50 left-1/2 -translate-x-1/2 mt-2 px-4 py-2 rounded-xl bg-[#181A1B] text-white text-sm shadow-lg border border-[#FFD700]/40 backdrop-blur-md whitespace-pre-line pointer-events-none animate-fade-in"
          style={{ minWidth: 180, maxWidth: 260, boxShadow: '0 0 12px 2px #FFD70033' }}
        >
          {content}
        </span>
      )}
    </span>
  );
} 