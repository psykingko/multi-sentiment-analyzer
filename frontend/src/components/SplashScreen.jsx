import React from "react";

const SplashScreen = () => (
  <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#040D12]">
    <div className="relative flex items-center justify-center mb-6">
      <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-b-4 border-[#FFD700] shadow-[0_0_32px_4px_#FFD70044]" />
      <div className="absolute w-12 h-12 bg-[#181A1B] rounded-full shadow-[0_0_24px_4px_#00FFD044]" />
    </div>
    <span className="mt-2 text-[#FFD700] text-2xl unbounded-bold drop-shadow-glow animate-pulse tracking-widest">Loading...</span>
  </div>
);

export default SplashScreen; 