import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
  ReferenceLine,
} from "recharts";
import { Fragment, useMemo } from "react";

// Simple emotion lexicon for demo word highlighting


// Sleek SVG icon mapping for each sentiment
export const SENTIMENT_ICONS = {
  positive: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 15C9.5 17,14.5 17,16 15"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>
  ),
  negative: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M16 15s-1.5-2-4-2-4 2-4 2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>
  ),
  neutral: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#a3a3a3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="8" y1="15" x2="16" y2="15"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>
  ),
  joy: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#facc15" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 15C9.5 17,14.5 17,16 15"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>
  ),
  sadness: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M16 15s-1.5-2-4-2-4 2-4 2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>
  ),
  anger: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#f472b6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M16 15s-1.5-2-4-2-4 2-4 2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/><path d="M8 8l2 2"/><path d="M16 8l-2 2"/></svg>
  ),
  fear: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><ellipse cx="12" cy="16" rx="4" ry="2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>
  ),
  surprise: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="15" r="1.5"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>
  ),
  disgust: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#a3e635" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 15c1.5-1 6.5-1 8 0"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>
  ),
  contempt: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 15c1.5-1 6.5-1 8 0"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>
  ),
};

const SentimentResult = ({ data }) => {
  if (!data || data.length === 0) return null;

  const getColor = (sentiment) => {
    switch (sentiment.toLowerCase()) {
      case "positive":
        return "#4ade80"; // green
      case "negative":
        return "#f87171"; // red
      case "neutral":
        return "#a3a3a3"; // gray
      case "joy":
        return "#facc15"; // yellow
      case "sadness":
        return "#60a5fa"; // blue
      case "anger":
        return "#f472b6"; // pink
      case "fear":
        return "#818cf8"; // indigo
      case "surprise":
        return "#34d399"; // teal
      case "disgust":
        return "#a3e635"; // lime
      case "contempt":
        return "#fbbf24"; // amber
      default:
        return "#a3a3a3"; // fallback gray
    }
  };

  const getIcon = (sentiment) => {
    return SENTIMENT_ICONS[sentiment.toLowerCase()] || null;
  };

  // Prepare chart data with index for X axis
  const chartData = data.map((item, idx) => ({
    ...item,
    idx: idx + 1,
    icon: getIcon(item.sentiment),
    color: getColor(item.sentiment),
  }));

  // Color palette for vibrant bars
  const SENTIMENT_PALETTE = {
    positive: "#4ade80",
    negative: "#f87171",
    neutral: "#a3a3a3",
    joy: "#facc15",
    sadness: "#60a5fa",
    anger: "#f472b6",
    fear: "#818cf8",
    surprise: "#34d399",
    disgust: "#a3e635",
    contempt: "#fbbf24",
  };

  // Calculate sentiment distribution for bar chart and summary
  const sentimentCounts = useMemo(() => {
    const counts = {};
    data.forEach((item) => {
      const key = item.sentiment.toLowerCase();
      counts[key] = (counts[key] || 0) + 1;
    });
    return counts;
  }, [data]);
  const total = data.length;
  const distributionData = Object.entries(sentimentCounts).map(([sentiment, count]) => ({
    sentiment,
    count,
    color: SENTIMENT_PALETTE[sentiment] || "#a3a3a3",
    icon: getIcon(sentiment),
  }));

  // Legend for the bar chart
  const Legend = () => (
    <div className="flex flex-wrap gap-4 mt-4 mb-2">
      {distributionData.map((d) => (
        <div key={d.sentiment} className="flex items-center gap-2">
          <span style={{ background: d.color, width: 16, height: 16, borderRadius: 4, display: 'inline-block' }}></span>
          <span className="inter-regular text-sm text-white/80">{d.icon} {d.sentiment.charAt(0).toUpperCase() + d.sentiment.slice(1)}</span>
        </div>
      ))}
    </div>
  );

  // Animated Bar Chart Tooltip
  const BarTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const d = payload[0].payload;
      return (
        <div className="bg-white/90 rounded-xl shadow-lg px-4 py-2 animate-fade-in flex items-center gap-2 min-w-0 max-w-xs mx-auto text-base inter-semibold"
          style={{ pointerEvents: 'none', minWidth: 'unset', maxWidth: 220 }}>
          <span className="text-xl">{d.icon}</span>
          <span>{d.sentiment.charAt(0).toUpperCase() + d.sentiment.slice(1)}</span>
          <span className="ml-2 font-mono">{d.count} ({((d.count/total)*100).toFixed(1)}%)</span>
        </div>
      );
    }
    return null;
  };

  // Summary sentence
  const topSentiment = distributionData.reduce((a, b) => (a.count > b.count ? a : b), { count: 0 });
  const summarySentence = total > 0
    ? `Most sentences are ${topSentiment.sentiment} (${topSentiment.count}/${total}, ${(topSentiment.count/total*100).toFixed(1)}%).`
    : "No sentiment data available.";

  // Custom tooltip for the line chart
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const d = payload[0].payload;
      return (
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl px-4 py-2 border-2 border-[#FFD700] animate-fade-in flex items-center gap-2 min-w-0 max-w-xs mx-auto text-base inter-bold text-[#181A1B] dark:text-[#FFD700]"
          style={{ pointerEvents: 'none', minWidth: 'unset', maxWidth: 240, fontWeight: 700 }}>
          <span className="text-xl">{d.icon}</span>
          <span className="font-bold">{d.sentiment}</span>
          <span className="ml-2 font-mono text-[#FFD700]">{d.score}</span>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="mt-10 w-full max-w-5xl mx-auto">
      <h2 className="unbounded-bold text-xl mb-4 z-10 relative text-white text-left">Sentence-wise Sentiment</h2>

      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 mb-4">
        {data.map((item, idx) => {
          const sentiment = (item.sentiment || '').toLowerCase();
          const displaySentiment = sentiment.charAt(0).toUpperCase() + sentiment.slice(1);
          const icon = getIcon(sentiment) || getIcon('neutral');
          const color = getColor(sentiment);
          const score = typeof item.score === 'number' ? item.score.toFixed(2) : '0.00';
          return (
            <div
              key={idx}
              className="bg-[#181A1B] border border-cyan-400/40 rounded-xl p-4 flex flex-col justify-between shadow-lg transition-all hover:shadow-cyan-400/20"
            >
              <p className="text-cyan-200 text-base mb-3 leading-relaxed w-full break-words whitespace-pre-line" title={item.sentence}>
                "{item.sentence}"
              </p>
              <div className="flex flex-col items-center w-full gap-1 mt-auto">
                <div className="w-full text-center flex items-center justify-center gap-2">
                  <span className="font-semibold text-cyan-300">Sentiment:</span>
                  <span className="font-bold text-yellow-400 flex items-center gap-1" style={{ color }}>
                    {icon}
                    {displaySentiment}
                  </span>
                </div>
                <div className="w-full text-center flex items-center justify-center">
                  <span className="font-mono text-yellow-400">Score: {score}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-10">
        <h3 className="unbounded-bold text-xl mb-4 z-10 relative text-white text-left">Sentence-wise Sentiment Score Trend</h3>
        {/* Only keep the sentiment score (line) graph, restyled */}
        <div className="h-72 bg-[#181A1B] p-4 rounded-2xl shadow-xl border border-[#23272b] flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 20, right: 30, left: 10, bottom: 10 }}>
              <defs>
                <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FFD700" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#00FFD0" stopOpacity={0.2}/>
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#23272b" strokeDasharray="3 3" />
              <XAxis dataKey="idx" stroke="#FFD700" tick={{ fill: '#FFD700', fontSize: 14, fontFamily: 'inherit' }} />
              <YAxis stroke="#FFD700" tick={{ fill: '#FFD700', fontSize: 14, fontFamily: 'inherit' }} />
              <Tooltip content={CustomTooltip} cursor={{ stroke: '#FFD700', strokeWidth: 1, opacity: 0.2 }} />
              <Line
                type="monotone"
                dataKey="score"
                stroke="url(#scoreGradient)"
                strokeWidth={3}
                dot={{ r: 6, stroke: '#FFD700', strokeWidth: 2.5, fill: '#181A1B' }}
                activeDot={{ r: 10, stroke: '#FFD700', strokeWidth: 4, fill: '#FFD700', filter: 'drop-shadow(0 0 8px #FFD70088)' }}
                isAnimationActive={true}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default SentimentResult;
