// Summary.jsx
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export const EMOTION_COLORS = {
  Positive: "#00FFCC",
  Negative: "#FF6B6B",
  Neutral: "#FFD700",
  Joy: "#4A5F5D",
  Sadness: "#60a5fa",
  Anger: "#f472b6",
  Fear: "#818cf8",
  Surprise: "#34d399",
  Disgust: "#a3e635",
  Contempt: "#fbbf24",
};

// Sleek SVG icon mapping for each sentiment
export const EMOTION_ICONS = {
  Positive: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#00FFCC" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 15s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>
  ),
  Negative: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#FF6B6B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M16 15s-1.5-2-4-2-4 2-4 2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>
  ),
  Neutral: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#FFD700" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="8" y1="15" x2="16" y2="15"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>
  ),
  Joy: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#4A5F5D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 15s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>
  ),
  Sadness: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M16 15s-1.5-2-4-2-4 2-4 2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>
  ),
  Anger: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#f472b6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M16 15s-1.5-2-4-2-4 2-4 2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/><path d="M8 8l2 2"/><path d="M16 8l-2 2"/></svg>
  ),
  Fear: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><ellipse cx="12" cy="16" rx="4" ry="2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>
  ),
  Surprise: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="15" r="1.5"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>
  ),
  Disgust: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#a3e635" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 15c1.5-1 6.5-1 8 0"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>
  ),
  Contempt: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 15c1.5-1 6.5-1 8 0"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>
  ),
};

const Summary = ({ summary, section }) => {
  const [animatedCounts, setAnimatedCounts] = useState({});
  const [isMobile, setIsMobile] = useState(false); // NEW

  useEffect(() => {
    if (!summary?.sentiment_counts) return;
    // Animate counters
    const keys = Object.keys(summary.sentiment_counts);
    let frame;
    let start = {};
    keys.forEach((k) => (start[k] = 0));
    let t = 0;
    const animate = () => {
      t += 1;
      let next = {};
      let done = true;
      keys.forEach((k) => {
        const val = Math.min(
          summary.sentiment_counts[k] || 0,
          Math.round((t / 30) * (summary.sentiment_counts[k] || 0))
        );
        next[k] = val;
        if (val < (summary.sentiment_counts[k] || 0)) done = false;
      });
      setAnimatedCounts(next);
      if (!done) frame = requestAnimationFrame(animate);
    };
    animate();
    return () => cancelAnimationFrame(frame);
  }, [summary]);

  useEffect(() => {
    // Responsive check
    const handleResize = () => setIsMobile(window.innerWidth < 640);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!summary) return null;
  const { sentiment: overall_sentiment, average_score, word_count, char_count, mental_state, mental_state_distribution } = summary;
  const data = mental_state_distribution
    ? Object.entries(mental_state_distribution).map(([name, value]) => ({ name, value }))
    : [];

  // Only show pie chart and legend for 'distribution' section
  if (section === 'distribution') {
    return (
      <div className="flex flex-col items-center justify-center w-full max-w-2xl mx-auto mt-8 mb-4">
        <div className={isMobile ? "h-56 w-full flex items-center justify-center" : "h-80 w-full flex items-center justify-center"}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={isMobile ? 40 : 60}
                outerRadius={isMobile ? 70 : 100}
                fill="#8884d8"
                dataKey="value"
                isAnimationActive={true}
                label={isMobile ? false : ({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={EMOTION_COLORS[entry.name]}
                    stroke="#181A1B"
                    style={{ filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.08))" }}
                  />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) =>
                  active && payload && payload.length ? (
                    <div className="bg-[#23272b] rounded-full shadow-lg px-4 py-2 border border-[#2e3236] animate-fade-in flex items-center gap-2 min-w-0 max-w-xs mx-auto text-base inter-semibold text-white"
                      style={{ pointerEvents: 'none', minWidth: 'unset', maxWidth: 180 }}>
                      <span className="text-xl">{EMOTION_ICONS[payload[0].name] || ''}</span>
                      <span>{payload[0].name}</span>
                      <span className="ml-2 font-mono">{(payload[0].percent * 100).toFixed(1)}%</span>
                    </div>
                  ) : null
                }
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        {/* Custom Legend below the chart */}
        <div className="flex flex-wrap justify-center gap-6 mt-6">
          {data.map((entry, idx) => (
            <div
              key={entry.name}
              className="flex flex-col items-center justify-center w-36 h-36 rounded-xl shadow border border-[#2e3236] bg-[#181A1B]"
              style={{ boxShadow: '0 0 8px 1px ' + (EMOTION_COLORS[entry.name] || '#FFD700') + '44' }}
            >
              <span className="text-2xl mb-1" style={{ color: EMOTION_COLORS[entry.name] }}>{EMOTION_ICONS[entry.name]}</span>
              <span className="unbounded-bold text-base" style={{ color: EMOTION_COLORS[entry.name] }}>{entry.name}</span>
              <span className="font-mono text-[#FFD700] text-lg">{(entry.value * 100).toFixed(0)}%</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Only show summary cards for 'summary' section
  if (section === 'summary') {
    return (
      <div className="w-full max-w-5xl mx-auto">
        <div className="flex flex-wrap gap-6 mb-8">
          {/* Word Count Card */}
          <div className="flex-1 min-w-[160px] bg-[#181A1B] border border-cyan-400/40 rounded-xl p-6 mb-4 shadow-lg transition-all hover:shadow-cyan-400/20 max-w-2xl mx-auto flex flex-col items-center justify-center text-white">
            <span className="text-lg font-semibold mb-1 tracking-wide text-cyan-200">Words</span>
            <span className="text-3xl font-mono text-[#FFD700]">{word_count}</span>
          </div>
          {/* Char Count Card */}
          <div className="flex-1 min-w-[160px] bg-[#181A1B] border border-cyan-400/40 rounded-xl p-6 mb-4 shadow-lg transition-all hover:shadow-cyan-400/20 max-w-2xl mx-auto flex flex-col items-center justify-center text-white">
            <span className="text-lg font-semibold mb-1 tracking-wide text-cyan-200">Characters</span>
            <span className="text-3xl font-mono text-[#FFD700]">{char_count}</span>
          </div>
          {/* Mental State Card */}
          <div className="flex-1 min-w-[160px] bg-[#181A1B] border border-cyan-400/40 rounded-xl p-6 mb-4 shadow-lg transition-all hover:shadow-cyan-400/20 max-w-2xl mx-auto flex flex-col items-center justify-center text-white">
            <span className="text-lg font-semibold mb-1 tracking-wide text-cyan-200">Mental State</span>
            <span className="flex items-center gap-2 text-2xl font-bold mt-1" style={{color: EMOTION_COLORS[mental_state] || '#FFD700'}}>
              {EMOTION_ICONS[mental_state] || '🔎'} {mental_state || 'N/A'}
            </span>
          </div>
        </div>
        {/* Average Score Card */}
        <div className="flex flex-wrap gap-6 mb-8">
          <div className="flex-1 min-w-[160px] bg-[#181A1B] border border-cyan-400/40 rounded-xl p-6 mb-4 shadow-lg transition-all hover:shadow-cyan-400/20 max-w-2xl mx-auto flex flex-col items-center justify-center text-white">
            <span className="text-lg font-semibold mb-1 tracking-wide text-cyan-200">Average Score</span>
            <span className="text-3xl font-mono text-[#FFD700]">{average_score}</span>
          </div>
        </div>
      </div>
    );
  }

  // Default: show both (for backward compatibility)
  return (
    <>
      {/* Distribution */}
      <Summary summary={summary} section="distribution" />
      {/* Summary */}
      <Summary summary={summary} section="summary" />
    </>
  );
};

export default Summary;
