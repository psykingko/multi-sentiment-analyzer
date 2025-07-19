import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from '../lib/supabase';
import { fetchGlobalInsights } from '../utils/fetchInsights';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

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

function useAnimatedNumber(target, duration = 1000, decimals = 0) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (target == null) return;
    let start = 0;
    let startTime = null;
    function animate(ts) {
      if (!startTime) startTime = ts;
      const progress = Math.min((ts - startTime) / duration, 1);
      const next = start + (target - start) * progress;
      setValue(decimals ? parseFloat(next.toFixed(decimals)) : Math.round(next));
      if (progress < 1) requestAnimationFrame(animate);
    }
    requestAnimationFrame(animate);
    // Reset on target change
    return () => setValue(0);
  }, [target, duration, decimals]);
  return value;
}

// Custom Tooltip for PieChart
const PieCustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const d = payload[0].payload;
    const percent = payload[0].percent ? (payload[0].percent * 100).toFixed(1) : '0.0';
    return (
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl px-4 py-2 border-2 border-[#FFD700] animate-fade-in flex flex-col items-center min-w-0 max-w-xs mx-auto text-base inter-bold text-[#181A1B] dark:text-[#FFD700]"
        style={{ pointerEvents: 'none', minWidth: 'unset', maxWidth: 220, fontWeight: 700 }}>
        <span className="font-bold text-lg" style={{ color: EMOTION_COLORS[d.name] || '#FFD700' }}>{d.name}</span>
        <span className="font-mono text-[#FFD700]">{d.value} ({percent}%)</span>
      </div>
    );
  }
  return null;
};

export default function Insights() {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchInsights() {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchGlobalInsights();
        setInsights(data);
      } catch (err) {
        setError('Could not fetch insights.');
      } finally {
        setLoading(false);
      }
    }
    fetchInsights();
  }, []);

  // Prepare chart data
  const pieData = insights && insights.sentiment_distribution
    ? Object.entries(insights.sentiment_distribution).map(([name, value]) => ({ name, value }))
    : [];

  // Animated numbers
  const animatedAnalyses = useAnimatedNumber(insights?.total_analyses ?? 0, 1200);
  const animatedEmotions = useAnimatedNumber(insights?.total_emotions ?? 0, 1200);
  const animatedAccuracy = useAnimatedNumber(insights?.avg_confidence ? parseFloat(insights.avg_confidence) * 100 : 0, 1200, 1);
  const animatedUsers = useAnimatedNumber(insights?.sessions ?? 0, 1200);

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] bg-transparent">
      <h1 className="unbounded-bold text-4xl md:text-5xl mb-8 mt-2 tracking-widest text-[#FFD700] text-center drop-shadow-lg">Insights</h1>
      <motion.div
        className="w-full max-w-6xl rounded-2xl border border-white/20 shadow-2xl p-8 mt-8 mb-12 backdrop-blur-md bg-[#10151A]"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, type: 'spring' }}
      >
        {loading && <div className="text-white/70 text-center py-8">Loading insights...</div>}
        {error && <div className="text-red-400 text-center py-8">{error}</div>}
        {insights && (
          <>
            <div className="w-full max-w-4xl px-2 sm:px-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-10">
                <div className="rounded-2xl border-2 border-[#00FFD0]/30 shadow-xl p-6 flex flex-col items-center text-center backdrop-blur-md bg-[#181A1B] min-w-0">
                  <span className="unbounded-bold text-3xl mb-2 text-[#FFD700]">{animatedAnalyses}</span>
                  <span className="inter-regular text-base text-white/80">Texts Analyzed</span>
                </div>
                <div className="rounded-2xl border-2 border-[#00FFD0]/30 shadow-xl p-6 flex flex-col items-center text-center backdrop-blur-md bg-[#181A1B] min-w-0">
                  <span className="unbounded-bold text-3xl mb-2 text-[#FFD700]">{animatedEmotions}</span>
                  <span className="inter-regular text-base text-white/80">Emotions Detected</span>
                </div>
                <div className="rounded-2xl border-2 border-[#00FFD0]/30 shadow-xl p-6 flex flex-col items-center text-center backdrop-blur-md bg-[#181A1B] min-w-0">
                  <span className="unbounded-bold text-3xl mb-2 text-[#FFD700]">
                    {insights.avg_confidence ? `${animatedAccuracy}%` : 'N/A'}
                  </span>
                  <span className="inter-regular text-base text-white/80">Accuracy Rate</span>
                </div>
                <div className="rounded-2xl border-2 border-[#00FFD0]/30 shadow-xl p-6 flex flex-col items-center text-center backdrop-blur-md bg-[#181A1B] min-w-0">
                  <span className="unbounded-bold text-3xl mb-2 text-[#FFD700]">{animatedUsers}</span>
                  <span className="inter-regular text-base text-white/80">Active Users</span>
                </div>
              </div>
              {/* Pie Chart for Sentiment Distribution */}
              <div className="w-full max-w-2xl mx-auto mt-8 min-w-0">
                <h3 className="unbounded-bold text-2xl mb-6 text-[#00FFD0] text-center">Sentiment Distribution</h3>
                <div className="h-80 w-full flex items-center justify-center bg-[#181A1B] rounded-2xl shadow border border-[#2e3236]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        isAnimationActive={true}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {pieData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={EMOTION_COLORS[entry.name] || '#FFD700'}
                            stroke="#181A1B"
                            style={{ filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.08))" }}
                          />
                        ))}
                      </Pie>
                      <Tooltip content={<PieCustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
              {/* Bar Chart for Sentiment Counts */}
              <div className="w-full max-w-2xl mx-auto mt-8 min-w-0">
                <h3 className="unbounded-bold text-2xl mb-6 text-white text-center">Sentiment Counts</h3>
                <div className="h-64 w-full flex items-center justify-center bg-[#181A1B] rounded-2xl shadow border border-[#2e3236]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={pieData}
                      margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid stroke="#23272b" strokeDasharray="3 3" />
                      <XAxis dataKey="name" stroke="#FFD700" tick={{ fill: '#FFD700', fontSize: 14, fontFamily: 'inherit' }} />
                      <YAxis stroke="#FFD700" tick={{ fill: '#FFD700', fontSize: 14, fontFamily: 'inherit' }} />
                      <Bar dataKey="value" fill="#FFD700">
                        {pieData.map((entry, idx) => (
                          <Cell key={entry.name} fill={EMOTION_COLORS[entry.name] || '#FFD700'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
} 