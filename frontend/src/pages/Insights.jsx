import React from "react";
import { motion } from "framer-motion";

const stats = [
  { label: "Sentences Analyzed", value: 1245 },
  { label: "Emotions Detected", value: 892 },
  { label: "Realtime Accuracy", value: "98.2%" },
  { label: "Sessions", value: 312 },
];

const barData = [
  { label: "Pos", value: 46, color: "#00FFCC" },
  { label: "Neg", value: 22, color: "#FF6B6B" },
  { label: "Neu", value: 19, color: "#FFD700" },
  { label: "Joy", value: 32, color: "#4A5F5D" },
  { label: "Ang", value: 28, color: "#999" },
];

export default function Insights() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] bg-transparent">
      <motion.div
        className="w-full max-w-3xl rounded-2xl border border-white/20 shadow-xl p-8 mt-8 mb-12 backdrop-blur-md bg-white/5"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, type: 'spring' }}
      >
        <h1 className="unbounded-black text-4xl md:text-6xl mb-6 tracking-widest text-white text-center">Insights</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              className="rounded-2xl border border-white/20 shadow-xl p-6 flex flex-col items-center text-center backdrop-blur-md bg-white/5 cursor-pointer"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ delay: i * 0.1, duration: 0.35, type: 'spring' }}
              whileHover={{ scale: 1.03, borderColor: '#FFD700', boxShadow: '0 0 24px #FFD70044' }}
            >
              <span className="unbounded-bold text-2xl mb-2 text-white/90">{s.value}</span>
              <span className="inter-regular text-base text-white/80">{s.label}</span>
            </motion.div>
          ))}
        </div>
        {/* Animated Bar Graph */}
        <motion.div
          className="w-full max-w-xl mx-auto rounded-3xl bg-[#040D12] border border-white/20 shadow-xl p-8 flex flex-col items-center text-center backdrop-blur-md"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ delay: 0.1, duration: 0.35, type: 'spring' }}
        >
          <h3 className="unbounded-bold text-xl mb-6 text-white">Sentiment Distribution</h3>
          <div className="flex items-end justify-center gap-6 w-full h-48">
            {barData.map((bar, i) => (
              <motion.div
                key={bar.label}
                initial={{ height: 0 }}
                whileInView={{ height: `${bar.value * 2}px` }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ delay: 0.3 + i * 0.1, duration: 0.35, type: 'spring' }}
                className="flex flex-col items-center justify-end"
                style={{ minWidth: 32 }}
              >
                <div
                  className="w-8 rounded-t-lg"
                  style={{ height: `${bar.value * 2}px`, background: bar.color, boxShadow: '0 2px 12px 0 #0004' }}
                ></div>
                <span className="mt-2 text-xs text-white/60">{bar.label}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
} 