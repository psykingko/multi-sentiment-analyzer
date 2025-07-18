import React from 'react';

const EMOTION_COLORS = {
  Happy: '#FFD700',
  Sad: '#60a5fa',
  Angry: '#FF6B6B',
  Surprised: '#34d399',
  Fearful: '#818cf8',
  Disgusted: '#a3e635',
  Neutral: '#888',
  Contempt: '#fbbf24',
  'No Face': '#444',
  'Deep model not available': '#8884d8',
  Unknown: '#8884d8',
};

function EmotionIntensityMeter({ confidence = 0, emotion = 'Neutral' }) {
  const color = EMOTION_COLORS[emotion] || '#FFD700';
  return (
    <div className="w-full max-w-md mx-auto my-4">
      <div className="flex justify-between items-center mb-1">
        <span className="text-white/80 text-sm font-semibold">Emotion Intensity</span>
        <span className="text-white/80 text-sm font-semibold">{confidence}%</span>
      </div>
      <div className="w-full h-5 bg-[#23272b] rounded-full overflow-hidden shadow border border-white/10">
        <div
          className="h-full transition-all duration-500 ease-in-out"
          style={{
            width: `${confidence}%`,
            background: color,
            boxShadow: `0 0 12px 2px ${color}55`,
          }}
        />
      </div>
      <div className="text-center mt-2 text-base font-bold" style={{ color }}>{emotion}</div>
    </div>
  );
}

export default EmotionIntensityMeter; 