import React, { useState, useEffect } from 'react';
import { checkBackendStatus } from '../utils/backendStatus';
import { motion } from 'framer-motion';

const BackendStatus = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  const checkStatus = async () => {
    setIsChecking(true);
    const status = await checkBackendStatus();
    setIsConnected(status);
    setIsChecking(false);
  };

  useEffect(() => {
    checkStatus();
    
    // Check status every 10 seconds
    const interval = setInterval(checkStatus, 10000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-[#181A1B] border border-[#23272b]"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      title={isChecking ? 'Checking backend connection...' : isConnected ? 'Backend connected' : 'Backend disconnected'}
    >
      {/* Status indicator dot */}
      <div className="relative">
        <div
          className={`w-1.5 h-1.5 rounded-full ${
            isConnected 
              ? 'bg-[#00FFCC] shadow-[0_0_6px_#00FFCC]' 
              : 'bg-[#FF6B6B] shadow-[0_0_6px_#FF6B6B]'
          }`}
        />
        {isChecking && (
          <motion.div
            className="absolute inset-0 w-1.5 h-1.5 rounded-full border border-[#FFD700]"
            animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        )}
      </div>
      
      {/* Status text - hidden on small screens */}
      <span className="inter-medium text-xs text-white/80 hidden md:inline">
        {isChecking ? 'Checking...' : isConnected ? 'Connected' : 'Disconnected'}
      </span>
      
      {/* Connection icon */}
      <svg 
        width="12" 
        height="12" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke={isConnected ? "#00FFCC" : "#FF6B6B"} 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
        className="opacity-80"
      >
        {isConnected ? (
          // Connected icon (wifi)
          <>
            <path d="M5 12.55a11 11 0 0 1 14.08 0"/>
            <path d="M1.42 9a16 16 0 0 1 21.16 0"/>
            <path d="M8.53 16.11a6 6 0 0 1 6.95 0"/>
            <line x1="12" y1="20" x2="12.01" y2="20"/>
          </>
        ) : (
          // Disconnected icon (wifi-off)
          <>
            <line x1="1" y1="1" x2="23" y2="23"/>
            <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55"/>
            <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39"/>
            <path d="M10.71 5.05A16 16 0 0 1 22.58 9"/>
            <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88"/>
            <path d="M8.53 16.11a6 6 0 0 1 6.95 0"/>
            <line x1="12" y1="20" x2="12.01" y2="20"/>
          </>
        )}
      </svg>
    </motion.div>
  );
};

export default BackendStatus; 