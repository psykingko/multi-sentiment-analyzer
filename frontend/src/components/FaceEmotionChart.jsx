import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Bar, BarChart, Legend, ResponsiveContainer, Cell } from 'recharts';

// Map emotion to color for bar chart
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

function FaceEmotionChart({ timeline }) {
  // Prepare data for chart
  const data = timeline.map((entry, i) => ({
    time: entry.time,
    emotion: entry.emotion.charAt(0).toUpperCase() + entry.emotion.slice(1),
    confidence: entry.confidence,
  }));

  // Mobile check
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;

  return (
    <div>
      <h3 className="text-lg sm:text-xl md:text-2xl unbounded-bold text-white mb-2">Live Emotion Timeline</h3>
      <div className="w-full max-w-2xl mx-auto my-6 bg-[#181A1B] rounded-xl p-4 shadow border border-white/10">
        
      
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="#2226" strokeDasharray="3 3" />
          <XAxis dataKey="time" stroke="#FFD700" />
          <YAxis domain={[0, 100]} stroke="#FFD700" tick={{ fill: '#FFD700' }} />
          <Tooltip contentStyle={{ background: '#23272b', border: '1px solid #FFD700', color: '#FFD700' }} />
          <Legend />
          <Line type="monotone" dataKey="confidence" stroke="#FFD700" strokeWidth={3} dot={{ r: 5, fill: '#FFD700' }} name="Confidence" isAnimationActive={!isMobile} />
        </LineChart>
      </ResponsiveContainer>
      <ResponsiveContainer width="100%" height={60}>
        <BarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <XAxis dataKey="time" hide />
          <YAxis hide />
          <Tooltip contentStyle={{ background: '#23272b', border: '1px solid #FFD700', color: '#FFD700' }} />
          <Bar dataKey="emotion" name="Emotion" isAnimationActive={!isMobile}>
            {data.map((entry, idx) => (
              <Cell key={`cell-${idx}`} fill={EMOTION_COLORS[entry.emotion] || '#FFD700'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <div className="flex justify-between mt-2 text-xs text-white/70">
        {data.map((entry, idx) => (
          <span key={idx} style={{ color: EMOTION_COLORS[entry.emotion] || '#FFD700' }}>{entry.emotion}</span>
        ))}
      </div>
    </div>
    </div>
  );
}

export default FaceEmotionChart; 