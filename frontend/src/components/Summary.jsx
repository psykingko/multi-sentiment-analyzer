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

const EMOTION_COLORS = {
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
const EMOTION_ICONS = {
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

const Summary = ({ summary }) => {
  const [animatedCounts, setAnimatedCounts] = useState({});

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

  if (!summary) return null;
  const { sentiment: overall_sentiment, average_score, sentiment_counts } = summary;
  const data = Object.entries(sentiment_counts || {}).map(([name, value]) => ({ name, value }));

  return (
    <div className="w-full max-w-5xl mx-auto">
      <motion.div
        className="mt-10 w-full max-w-5xl mx-auto relative flex flex-col"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <h2 className="unbounded-bold text-xl mb-4 z-10 relative text-white text-left">Paragraph Summary</h2>
        <motion.div
          className="bg-[#181A1B] border border-[#2e3236] shadow-xl rounded-2xl p-8 mb-8 flex flex-row justify-between items-center w-full max-w-5xl"
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          whileHover={{ scale: 1.01, boxShadow: "0 8px 32px rgba(0,0,0,0.12)" }}
          style={{ zIndex: 1 }}
        >
          <motion.span
            className=" min-w-0 px-3 py-3 rounded-full unbounded-bold text-lg shadow mb-4 md:mb-0 md:mr-10 inline-block border-4 border-[#23272b] text-white flex items-center justify-center"
            style={{
              backgroundColor: EMOTION_COLORS[overall_sentiment] + "22",
              color: EMOTION_COLORS[overall_sentiment] || "#fff",
              borderColor: EMOTION_COLORS[overall_sentiment] || "#23272b",
            }}
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1.15, opacity: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 15, delay: 0.1 }}
          >
            {EMOTION_ICONS[overall_sentiment] || "🔎"} {overall_sentiment}
          </motion.span>
          <div className="flex-1 min-w-0 flex items-center justify-center">
            <span className="text-lg unbounded-bold text-white">Average Score: <span className="font-mono">{average_score}</span></span>
          </div>
        </motion.div>
        <div className="h-80 z-10 relative w-full max-w-2xl">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                isAnimationActive={true}
                label={({ name, percent }) =>
                  `${EMOTION_ICONS[name] || ""} ${name}: ${(percent * 100).toFixed(0)}%`
                }
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
                      <span className="text-xl">{EMOTION_ICONS[payload[0].name] || ""}</span>
                      <span>{payload[0].name}</span>
                      <span className="ml-2 font-mono">{payload[0].value}</span>
                    </div>
                  ) : null
                }
              />
              <Legend
                iconType="circle"
                formatter={(value) => (
                  <span style={{ color: EMOTION_COLORS[value] || "#fff", fontWeight: 600 }}>
                    {EMOTION_ICONS[value] || ""} {value}
                  </span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
    </div>
  );
};

export default Summary;
