import React from "react";

const PeekingRobo = ({ show }) => {
  if (!show) return null;
  return (
    <div className="fixed bottom-0 left-1/2 z-50 -translate-x-1/2 mb-2 animate-bounce">
      <svg width="80" height="60" viewBox="0 0 80 60" fill="none" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="40" cy="55" rx="30" ry="5" fill="#23272b" fillOpacity="0.7" />
        <g>
          <ellipse cx="40" cy="30" rx="28" ry="20" fill="#23272b" stroke="#FFD700" strokeWidth="3" />
          <ellipse cx="28" cy="32" rx="5" ry="7" fill="#fff" />
          <ellipse cx="52" cy="32" rx="5" ry="7" fill="#fff" />
          <ellipse cx="28" cy="34" rx="2.5" ry="3.5" fill="#60a5fa" />
          <ellipse cx="52" cy="34" rx="2.5" ry="3.5" fill="#60a5fa" />
          <rect x="35" y="44" width="10" height="3" rx="1.5" fill="#FFD700" />
          <rect x="37" y="16" width="6" height="8" rx="3" fill="#FFD700" />
        </g>
      </svg>
      <div className="text-center text-[#FFD700] font-bold mt-1 text-base drop-shadow-glow animate-pulse">Results are ready!</div>
    </div>
  );
};

export default PeekingRobo; 