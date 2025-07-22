import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { useState, useEffect } from "react";
import React from "react"; // Added for React.cloneElement
import OldBackground from '../components/OldBackground';
import { FileText, Smile, Mic, Cpu, Download, Shield, User, Users2, BarChart2, LayoutDashboard } from 'lucide-react';
import { fetchGlobalInsights } from '../utils/fetchInsights';
import faceScannerImg from '../assets/face-scanner.png';
import faceScannerWebp from '../assets/face-scanner.webp';

const features = [
  {
    title: "Text & Paragraph Insights",
    desc: "Instantly detect sentiment and emotion in any text, from single sentences to full paragraphs.",
    icon: <FileText size={24} strokeWidth={1.5} className="mb-2" color="#00FFD0" />,
  },
  {
    title: "Real-Time Face Emotion",
    desc: "Instantly read emotions from your facial expressions using your webcam.",
    icon: <Smile size={24} strokeWidth={1.5} className="mb-2" color="#00B2FF" />,
  },
  {
    title: "Voice & Video Input",
    desc: "Speak or show your emotions-analyze both voice and facial cues live.",
    icon: <Mic size={24} strokeWidth={1.5} className="mb-2" color="#A259FF" />,
  },
  {
    title: "Flexible AI Models",
    desc: "Choose between lightning-fast rule-based or advanced deep learning for your analysis.",
    icon: <Cpu size={24} strokeWidth={1.5} className="mb-2" color="#FF3B3B" />,
  },
  {
    title: "Exportable Reports",
    desc: "Download detailed PDF reports of your sentiment and emotion analysis.",
    icon: <Download size={24} strokeWidth={1.5} className="mb-2" color="#00FF85" />,
  },
  {
    title: "Data Privacy & Security",
    desc: "All your data is encrypted-privacy and security are always protected.",
    icon: <Shield size={24} strokeWidth={1.5} className="mb-2" color="#FFD700" />,
  },
  {
    title: "SoulSync AI Support",
    desc: "Chat with SoulSync, your AI companion for supportive, mindful conversation.",
    icon: <User size={24} strokeWidth={1.5} className="mb-2" color="#FFB300" />,
  },
  {
    title: "In-Depth Analytics",
    desc: "Get comprehensive breakdowns and trends for every analysis.",
    icon: <BarChart2 size={24} strokeWidth={1.5} className="mb-2" color="#4ADE80" />,
  },
  {
    title: "Simple & Intuitive Design",
    desc: "Experience a clean, easy-to-use interface-no tech skills required.",
    icon: <LayoutDashboard size={24} strokeWidth={1.5} className="mb-2" color="#FF3B3B" />,
  },
];

const aiModels = [
  // Text Analysis Models
  {
    name: "VADER (Valence Aware Dictionary and sEntiment Reasoner)",
    description: "Rule-based sentiment analyzer optimized for social media and general text. Provides fast, real-time sentiment and emotion analysis.",
    type: "Rule-Based (Text)",
    accuracy: 85,
    accuracyNote: "~85% (on standard benchmarks)"
  },
  {
    name: "TextBlob",
    description: "Lightweight rule-based sentiment analysis library for quick polarity and subjectivity scores.",
    type: "Rule-Based (Text)",
    accuracy: 78,
    accuracyNote: "~78% (on standard benchmarks)"
  },
  {
    name: "DistilBERT",
    description: "A distilled version of BERT, providing deep learning-based sentiment and emotion analysis with high accuracy and efficiency.",
    type: "Deep Learning (Text)",
    accuracy: 97,
    accuracyNote: "~97% (on standard benchmarks)"
  },
  {
    name: "BERTh",
    description: "A robust deep learning model for advanced sentiment and emotion analysis, excelling at nuanced language understanding.",
    type: "Deep Learning (Text)",
    accuracy: 98,
    accuracyNote: "~98% (on standard benchmarks)"
  },
  // Face Scan Models
  {
    name: "MediaPipe Face Mesh",
    description: "Google's MediaPipe Face Mesh extracts facial landmarks. We use custom geometric rules on these points for fast, privacy-friendly emotion detection.",
    type: "Rule-Based (Face)",
    accuracy: 80,
    accuracyNote: "Estimated, may vary by use case"
  },
  {
    name: "face-api.js",
    description: "Deep learning library for face detection and emotion recognition in the browser. Used for advanced facial emotion analysis.",
    type: "Deep Learning (Face)",
    accuracy: 92,
    accuracyNote: "Estimated, may vary by use case"
  },
];

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

const animatedStats = [
  { label: "Texts Analyzed", value: 15420, suffix: "+", color: "#00FFCC" },
  { label: "Emotions Detected", value: 8920, suffix: "+", color: "#FFD700" },
  { label: "Accuracy Rate", value: 98.7, suffix: "%", color: "#FF6B6B" },
  { label: "Active Users", value: 1247, suffix: "+", color: "#4A5F5D" },
];

const statIcons = [
  <FileText size={32} aria-label="Texts Analyzed" key="texts" />, // 15420+
  <Smile size={32} aria-label="Emotions Detected" key="emotions" />, // 8920+
  <Shield size={32} aria-label="Accuracy Rate" key="accuracy" />, // 98%
  <Users2 size={32} aria-label="Active Users" key="users" />, // 1247+
];

const faqData = [
  {
    question: "What is sentiment analysis?",
    answer: "Sentiment analysis is the process of determining whether a piece of text expresses positive, negative, or neutral sentiment. Our AI models can analyze emotions, context, and even sarcasm to provide accurate sentiment scores."
  },
  {
    question: "How accurate are your AI models?",
    answer: "Our deep learning models (BERT and RoBERTa) achieve 99.2-99.5% accuracy on standard sentiment analysis tasks. Rule-based models like VADER provide 85%+ accuracy for real-time applications."
  },
  {
    question: "Can I analyze voice and facial expressions?",
    answer: "Yes! Our platform supports real-time voice transcription and facial emotion detection using your webcam. We use MediaPipe for face analysis and Web Speech API for voice processing."
  },
  {
    question: "What's the difference between rule-based and deep learning?",
    answer: "Rule-based models (VADER, TextBlob) are faster and work well for social media text, while deep learning models (BERT, RoBERTa) provide superior accuracy and understand complex context and nuances."
  },
  {
    question: "Is my data secure and private?",
    answer: "Absolutely. All analysis is performed locally or on secure servers. We don't store your personal data, and all communications are encrypted. Your privacy is our top priority."
  },
  {
    question: "Can I integrate this into my own applications?",
    answer: "Yes! We provide a RESTful API that allows you to integrate sentiment analysis into your applications, websites, or services. Check our documentation for integration examples."
  }
];

function PlayIcon() {
  return (
    <span className="inline-block align-middle mr-2">
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <circle cx="11" cy="11" r="10" stroke="#00FFCC" strokeWidth="2" fill="#222" />
        <polygon points="9,7 16,11 9,15" fill="#00FFCC" />
      </svg>
    </span>
  );
}

// Animated Counter Component
function AnimatedCounter({ end, suffix = "", duration = 2, decimals = 0 }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime = null;
    const animate = (currentTime) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / (duration * 1000), 1);
      const currentCount = decimals
        ? parseFloat((progress * end).toFixed(decimals))
        : Math.floor(progress * end);
      setCount(currentCount);
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    requestAnimationFrame(animate);
  }, [end, duration, decimals]);

  return (
    <span className="unbounded-bold text-3xl">
      {decimals ? count.toFixed(decimals) : count}{suffix}
    </span>
  );
}

// FAQ Item Component
function FAQItem({ question, answer, isOpen, onToggle }) {
  return (
    <div
      className="border border-white/20 rounded-2xl overflow-hidden backdrop-blur-sm"
    >
      <button
        onClick={onToggle}
        className="w-full px-4 md:px-6 py-4 text-left flex items-center justify-between hover:bg-white/5 transition-colors"
      >
        <h4 className="unbounded-regular text-lg text-white font-medium">{question}</h4>
        <svg
          width="20"
          height="20"
          fill="none"
          stroke="#00FFCC"
          strokeWidth="2"
          className="ml-2 md:ml-0 flex-shrink-0"
          style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }}
        >
          <polyline points="6,9 12,15 18,9"></polyline>
        </svg>
      </button>
      <div
        style={{ height: isOpen ? 'auto' : 0, opacity: isOpen ? 1 : 0, transition: 'height 0.3s, opacity 0.3s' }}
        className="overflow-hidden"
      >
        <div className="px-6 pb-4">
          <p className="inter-regular text-white/80 leading-relaxed">{answer}</p>
        </div>
      </div>
    </div>
  );
}

function GoldenDonut({ percent }) {
  // percent: number (e.g., 99.2)
  const radius = 54;
  const stroke = 12;
  const normalizedRadius = radius - stroke / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const progress = Math.max(0, Math.min(100, percent));
  const offset = circumference - (progress / 100) * circumference;
  return (
    <svg width={140} height={140} viewBox="0 0 140 140">
      <circle
        cx={70}
        cy={70}
        r={normalizedRadius}
        fill="none"
        stroke="#2d2d2d"
        strokeWidth={stroke}
        opacity={0.18}
      />
      <circle
        cx={70}
        cy={70}
        r={normalizedRadius}
        fill="none"
        stroke="#FFD700"
        strokeWidth={stroke}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        // strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 0.6s cubic-bezier(.4,2,.6,1)' }}
      />
      <text
        x="70"
        y="76"
        textAnchor="middle"
        fontSize="1.2rem"
        fontWeight="bold"
        fill="#FFD700"
        style={{ fontFamily: 'inter, sans-serif', filter: 'drop-shadow(0 1px 2px #0008)' }}
      >
        {progress}%
      </text>
    </svg>
  );
}

export default function Home() {
  const [openFAQ, setOpenFAQ] = useState(null);
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 1000], [0, -200]);
  const y2 = useTransform(scrollY, [0, 1000], [0, 100]);
  const y3 = useTransform(scrollY, [0, 1000], [0, -150]);

  // --- Real Insights Stats ---
  const [insights, setInsights] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [errorStats, setErrorStats] = useState(null);

  useEffect(() => {
    async function fetchStats() {
      setLoadingStats(true);
      setErrorStats(null);
      try {
        const data = await fetchGlobalInsights();
        setInsights(data);
      } catch (err) {
        setErrorStats('Could not fetch stats.');
      } finally {
        setLoadingStats(false);
      }
    }
    fetchStats();
  }, []);

  // Prepare animated values (show 0 while loading)
  const animatedStats = [
    {
      label: "Texts Analyzed",
      value: insights?.total_analyses ?? 0,
      suffix: "+",
      color: "#00FFCC",
      decimals: 0,
    },
    {
      label: "Emotions Detected",
      value: insights?.total_emotions ?? 0,
      suffix: "+",
      color: "#FFD700",
      decimals: 0,
    },
    {
      label: "Accuracy Rate",
      value: insights?.avg_confidence ? parseFloat(insights.avg_confidence) * 100 : 0,
      suffix: "%",
      color: "#FF6B6B",
      decimals: 1,
    },
    {
      label: "Active Users",
      value: insights?.sessions ?? 0,
      suffix: "+",
      color: "#4A5F5D",
      decimals: 0,
    },
  ];

  const statIcons = [
    <FileText size={32} aria-label="Texts Analyzed" key="texts" />, // 15420+
    <Smile size={32} aria-label="Emotions Detected" key="emotions" />, // 8920+
    <Shield size={32} aria-label="Accuracy Rate" key="accuracy" />, // 98%
    <Users2 size={32} aria-label="Active Users" key="users" />, // 1247+
  ];

  return (
    <div className="relative w-full min-h-screen flex flex-col items-center justify-start bg-[#040D12]">
      {/* Futuristic animated background */}
      {/* <HolographicCubesBackground /> */}
      <OldBackground />
      {/* Hero Section */}
      <section className="w-full flex flex-col items-center justify-center min-h-[90vh] pt-8 pb-20">
        <motion.h1
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="unbounded-black  text-4xl md:text-6xl mb-6 tracking-widest text-[#FFD700] text-center"
        >
          Multi-Sentiment Analyzer
        </motion.h1>
        <motion.p
          className="inter-regular text-lg md:text-2xl text-white/90 mb-10 max-w-2xl mx-auto text-center"
        >
          Analyze text, voice, and facial expressions for sentiment and emotion using state-of-the-art AI.
        </motion.p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center w-full max-w-md mx-auto">
          <motion.div
            className="flex-1"
            whileHover={{
              scale: 1.05,
              boxShadow: "0 0 30px rgba(255, 215, 0, 0.6)",
              borderColor: '#FFD700',
              borderRadius: '9999px',
            }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20, duration: 0.15 }}
          >
            <Link
              to="/analyze"
              className="w-full min-w-[300px] max-w-xs flex-1 flex items-center justify-center px-8 py-3 rounded-full unbounded-bold text-lg bg-black text-white border-2 border-[#222]  hover:bg-white hover:text-black transition-all duration-300 shadow-lg border-[#FFD700] text-center "
            >
              Try Text Analyzer
            </Link>
          </motion.div>
          <motion.div
            className="flex-1"
            whileHover={{
              scale: 1.05,
              boxShadow: "0 0 30px rgba(255, 215, 0, 0.6)",
              borderColor: '#FFD700',
              borderRadius: '9999px',
            }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20, duration: 0.15 }}
          >
            <Link
              to="/face-scan"
              className="w-full min-w-[300px] max-w-xs flex-1 flex items-center justify-center px-8 py-3 rounded-full unbounded-bold text-lg bg-black text-white border-2 border-[#222] hover:bg-white hover:text-black transition-all duration-300 shadow-lg border-[#FFD700] text-center"
            >
              Try Face Analyzer
            </Link>
          </motion.div>
        </div>
      </section>
      {/* 1. Why Choose Multi-Sentiment Analyzer? (feature cards) */}
      <section className="w-full max-w-4xl mx-auto mb-16 px-4">
        <div
          className="unbounded-bold text-3xl md:text-4xl mb-10 tracking-widest text-[#FFD700] text-center rounded-2xl py-6 px-2 shadow-xl"
        >
          Why Choose Multi-Sentiment Analyzer?
        </div>
        {/* Feature cards outer box */}
        <div
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4"
        >
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              className="rounded-2xl border border-white/20 shadow-xl p-6 flex flex-col items-center text-center backdrop-blur-md bg-white/5 cursor-pointer border border-white/20 w-full max-w-xs mx-auto md:max-w-none flex-1 min-h-[240px] md:min-h-[300px] h-full justify-between"
              whileHover={{ scale: 1.01, borderColor: '#FFD700' }}
              transition={{ type: 'spring', stiffness: 300, damping: 20, duration: 0.6 }}
            >
              <div className="mb-4 flex items-center justify-center w-12 h-12">{React.cloneElement(f.icon, { width: 48, height: 48, className: 'mb-2 w-12 h-12' })}</div>
              <h3 className="unbounded-bold text-xl mb-2 text-white">{f.title}</h3>
              <p className="inter-regular text-base text-white/80 flex-1 flex items-center justify-center">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>
      <div className="w-full my-10 flex justify-center">
          <div className="h-0.5 w-3/4 bg-gradient-to-r from-transparent via-[#FFD700] to-transparent shadow-[0_0_8px_2px_#FFD70044] rounded-full" />
        </div>
     
      
      {/* 3. AI Models Powering Our Analysis (AI model cards) */}
      <section className="w-full max-w-4xl mx-auto mb-16 px-4">
      <div
          className="unbounded-bold text-3xl md:text-4xl mb-10 tracking-widest text-[#FFD700] text-center rounded-2xl py-6 px-2 shadow-xl"
        >
          AI Models Powering Our Analysis
        </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {aiModels.map((model, i) => (
              <motion.div
                key={model.name}
                className="rounded-2xl p-8 backdrop-blur-md border border-white/20 shadow-xl bg-white/5 flex flex-col justify-between items-center h-full"
                whileHover={{ scale: 1.01, borderColor: '#FFD700' }}
                transition={{ type: 'spring', stiffness: 300, damping: 20, duration: 0.15 }}
              >
               {/* Golden Donut Chart for Accuracy */}
               
                <div className="w-full flex-1 flex flex-col items-center">
                  <div className="w-full flex flex-col items-center mb-3">
                    <h4 className="unbounded-bold text-2xl text-white mb-1 text-center">{model.name}</h4>
                    <span
                      className={`mt-1 px-3 py-1 rounded-full text-xs inter-bold border font-semibold tracking-wide text-center
                        ${model.type.includes('Deep Learning') && model.type.includes('Text') ? 'bg-blue-900/30 text-blue-300 border-blue-400/40' : ''}
                        ${model.type.includes('Rule-Based') && model.type.includes('Text') ? 'bg-green-900/30 text-green-300 border-green-400/40' : ''}
                        ${model.type.includes('Deep Learning') && model.type.includes('Face') ? 'bg-purple-900/30 text-purple-200 border-purple-400/40' : ''}
                        ${model.type.includes('Rule-Based') && model.type.includes('Face') ? 'bg-teal-900/30 text-teal-200 border-teal-400/40' : ''}
                      `}
                    >
                      {model.type}
                    </span>
                  </div>
                  <p className="inter-regular text-sm text-white/80 mb-3 w-full" style={{ minHeight: '48px' }}>{model.description}</p>
                </div>
                <div className="flex flex-col items-center justify-end mt-auto">
                  
                  {typeof model.accuracy === 'number' ? (
                    <>
                      <GoldenDonut percent={model.accuracy} />
                      <span className="text-xs text-white/70 mb-1 tracking-wider">Accuracy</span>
                      {model.accuracyNote && (
                        <span className="text-xs text-white/50 italic mt-1">{model.accuracyNote}</span>
                      )}
                    </>
                  ) : (
                    <>
                      <span className="inline-block px-3 py-1 rounded-full bg-gray-800 text-white/80 text-xs font-semibold mb-2 mt-2 border border-gray-600">{model.accuracy}</span>
                      <span className="text-xs text-white/70 mb-1 tracking-wider">Accuracy Info</span>
                    </>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        
        
      </section>
     
      {/* 4. Recent Stats (stats cards) */}
      
      <div className="w-full my-10 flex justify-center">
          <div className="h-0.5 w-3/4 bg-gradient-to-r from-transparent via-[#FFD700] to-transparent shadow-[0_0_8px_2px_#FFD70044] rounded-full" />
        </div>
      {/* 5. Our Impact in Numbers (animated stats) */}
      <section className="w-full max-w-4xl mx-auto mb-16 px-4">
      <div
          className="unbounded-bold text-3xl md:text-4xl mb-10 tracking-widest text-[#FFD700] text-center rounded-2xl py-6 px-2 shadow-xl "
        >
          Our Impact in Numbers
        </div>
          <div className="grid grid-cols-2  md:grid-cols-4 gap-6">
            {animatedStats.map((stat, i) => (
              <motion.div
                key={stat.label}
                className="text-center rounded-2xl border border-white/20 bg-white/5 backdrop-blur-md shadow-xl p-4 transition-all focus:outline-none focus:ring-2 focus:ring-[#FFD700]"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.15 }}
                whileHover={{ scale: 1.05, boxShadow: "0 0 20px #FFD70088", borderColor: '#FFD700' }}
                aria-label={`${stat.value}${stat.suffix} ${stat.label}`}
                tabIndex={0}
              >
                <div className="flex justify-center mb-2 text-gold-400" aria-hidden="true">{statIcons[i]}</div>
                {loadingStats ? (
                  <span className="unbounded-bold text-3xl animate-pulse text-white/60">0{stat.suffix}</span>
                ) : (
                  <AnimatedCounter end={stat.value} suffix={stat.suffix} duration={2.5} decimals={stat.decimals} />
                )}
                <p className="inter-regular text-sm text-white/70">{stat.label}</p>
              </motion.div>
            ))}
          </div>
      </section>
      <div className="w-full my-10 flex justify-center">
          <div className="h-0.5 w-3/4 bg-gradient-to-r from-transparent via-[#FFD700] to-transparent shadow-[0_0_8px_2px_#FFD70044] rounded-full" />
        </div>
      {/* 6. Frequently Asked Questions (FAQ) */}
      <section className="w-full max-w-4xl mx-auto mb-16 px-4">
      <div
        className="unbounded-bold text-3xl md:text-4xl mb-10 tracking-widest text-[#FFD700] text-center rounded-2xl py-6 px-2 shadow-xl "
        >
          Frequently Asked Questions
        </div>
          <div className="space-y-4">
            {faqData.map((faq, i) => (
              <motion.div
                key={i}
                className="inter rounded-2xl overflow-hidden backdrop-blur-md shadow bg-white/2"
                whileHover={{ scale: 1.02 }}
                transition={{ type: 'spring', stiffness: 500, damping: 18 }}
              >
                <FAQItem
                  question={faq.question}
                  answer={faq.answer}
                  isOpen={openFAQ === i}
                  onToggle={() => setOpenFAQ(openFAQ === i ? null : i)}
                />
              </motion.div>
            ))}
          </div>
        
      </section>

      
      
      {/* Contact Section */}
      <section className="w-full max-w-5xl mx-auto mb-8 px-4">
        <div className="border-t border-[#FFD700]/10 py-8 flex flex-col items-center text-center">
          
          <div className="unbounded-bold text-2xl text-whitemb-2">We Love Feedback!</div>
          <div className="unbounded-regular text-white/90 text-s mb-4">
            Found a bug ? Got a killer ! idea ? shoot us at
          </div>
          <a href="mailto:singhashish9599@.com" className="inline-flex items-center gap-2 px-4 py-2   text-[#FFD700] unbounded-regular text-lg hover:text-[#fff] hover:border-[#fff] transition mb-3">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="text-[#FFD700]" xmlns="http://www.w3.org/2000/svg"><path d="M2 6.5V17.5C2 18.3284 2.67157 19 3.5 19H20.5C21.3284 19 22 18.3284 22 17.5V6.5C22 5.67157 21.3284 5 20.5 5H3.5C2.67157 5 2 5.67157 2 6.5Z" stroke="#FFD700" strokeWidth="2"/><path d="M22 6.5L12 13.5L2 6.5" stroke="#FFD700" strokeWidth="2"/></svg>
            singhashish9599@.com
          </a>
          <div className="inter-regular text-base text-white/80 mt-2 mb-1">DM at</div>
          <a href="https://www.linkedin.com/in/ashishs190100/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2  text-[#00FFD0] unbounded-regular text-lg hover:text-[#fff] hover:border-[#fff] transition">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="text-[#00FFD0]" xmlns="http://www.w3.org/2000/svg"><path d="M19 0h-14c-2.76 0-5 2.24-5 5v14c0 2.76 2.24 5 5 5h14c2.76 0 5-2.24 5-5v-14c0-2.76-2.24-5-5-5zm-11 19h-3v-9h3v9zm-1.5-10.28c-.97 0-1.75-.79-1.75-1.75s.78-1.75 1.75-1.75 1.75.79 1.75 1.75-.78 1.75-1.75 1.75zm15.5 10.28h-3v-4.5c0-1.08-.02-2.47-1.5-2.47-1.5 0-1.73 1.17-1.73 2.39v4.58h-3v-9h2.89v1.23h.04c.4-.75 1.38-1.54 2.84-1.54 3.04 0 3.6 2 3.6 4.59v4.72z" fill="currentColor"/></svg>
            LinkedIn
          </a>
        </div>
      </section>
      {/* Warning/Note Section */}
      <section className="w-full max-w-4xl mx-auto mb-10 px-2 sm:px-4">
        <div className="flex items-start gap-2 sm:gap-4 rounded-2xl border-2 border-[#FF3B3B] bg-[#181A1B]/80 shadow-xl p-3 sm:p-6 backdrop-blur-md">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="flex-shrink-0 mt-1 sm:w-7 sm:h-7">
            <circle cx="12" cy="12" r="11" stroke="#FFD700" strokeWidth="2" fill="#181A1B"/>
            <path d="M12 7v5" stroke="#FFD700" strokeWidth="2" strokeLinecap="round"/>
            <circle cx="12" cy="16" r="1.2" fill="#FFD700"/>
          </svg>
          <div>
            <div className="unbounded-bold text-[#FFD700] text-base sm:text-lg mb-1">Experimental Feature Notice</div>
            <ul className="list-disc list-inside text-white/80 inter-regular text-xs sm:text-sm space-y-2 pl-2">
              <li>This app is <span className="text-[#FFD700]">experimental</span> and under active development.</li>
              <li>Sentiment and emotion results may not be fully accurate or reliable.</li>
              <li>AI models may misinterpret sarcasm, slang, or complex emotions.</li>
              <li>Facial and voice analysis is for demonstration only and not for medical or diagnostic use.</li>
              <li>No personal data is stored, but use caution with sensitive information.</li>
              <li><span className="text-[#FFD700] font-bold">SoulSync AI Therapist:</span> SoulSync is available with limited daily usage due to API restrictions.</li>
              <li>SoulSync is an AI companion, not a licensed therapist. For urgent mental health needs, please seek help from a qualified professional.</li>
              <li>SoulSync is experimental and may not always provide accurate or appropriate responses. Please avoid sharing sensitive personal information.</li>
              <li>For feedback or issues, please contact us or open a GitHub issue.</li>
            </ul>
          </div>
        </div>
      </section>
      {/* Footer */}
      <footer className="w-full bg-[#040D12] border-t border-[#FFD700]/30 py-6 flex flex-col items-center justify-center z-10 relative">
        <div className="unbounded-bold text-base text-[#FFD700] mb-1">Multi-Sentiment Analyzer</div>
        <div className="inter-regular text-white/70 text-xs mb-2">&copy; {new Date().getFullYear()} Multi-Sentiment Analyzer. All rights reserved.</div>
        <div className="inter-regular text-xs text-white/80 mb-2">
          Created by <a href="https://www.linkedin.com/in/ashishs190100/" target="_blank" rel="noopener noreferrer" className="text-[#FFD700] hover:underline">Ashish Singh</a>
        </div>
        <div className="flex items-center gap-4 mb-2">
          <a href="https://github.com/your-repo-url" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 group">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-[#00FFD0] group-hover:scale-110 transition-transform" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C6.48 2 2 6.58 2 12.26c0 4.5 2.87 8.32 6.84 9.67.5.09.68-.22.68-.48 0-.24-.01-.87-.01-1.7-2.78.62-3.37-1.36-3.37-1.36-.45-1.18-1.1-1.5-1.1-1.5-.9-.63.07-.62.07-.62 1 .07 1.53 1.05 1.53 1.05.89 1.56 2.34 1.11 2.91.85.09-.66.35-1.11.63-1.37-2.22-.26-4.56-1.14-4.56-5.07 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.7 0 0 .84-.28 2.75 1.05A9.38 9.38 0 0 1 12 6.84c.85.004 1.71.12 2.51.35 1.91-1.33 2.75-1.05 2.75-1.05.55 1.4.2 2.44.1 2.7.64.72 1.03 1.63 1.03 2.75 0 3.94-2.34 4.81-4.57 5.07.36.32.68.94.68 1.9 0 1.37-.01 2.47-.01 2.81 0 .27.18.58.69.48A10.01 10.01 0 0 0 22 12.26C22 6.58 17.52 2 12 2Z" fill="currentColor"/>
            </svg>
            <span className="text-xs text-[#00FFD0] group-hover:underline transition">GitHub</span>
          </a>
          <a href="https://www.linkedin.com/in/ashishs190100/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 group">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-[#FFD700] group-hover:scale-110 transition-transform" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 0h-14c-2.76 0-5 2.24-5 5v14c0 2.76 2.24 5 5 5h14c2.76 0 5-2.24 5-5v-14c0-2.76-2.24-5-5-5zm-11 19h-3v-9h3v9zm-1.5-10.28c-.97 0-1.75-.79-1.75-1.75s.78-1.75 1.75-1.75 1.75.79 1.75 1.75-.78 1.75-1.75 1.75zm15.5 10.28h-3v-4.5c0-1.08-.02-2.47-1.5-2.47-1.5 0-1.73 1.17-1.73 2.39v4.58h-3v-9h2.89v1.23h.04c.4-.75 1.38-1.54 2.84-1.54 3.04 0 3.6 2 3.6 4.59v4.72z" fill="currentColor"/>
            </svg>
            <span className="text-xs text-[#FFD700] group-hover:underline transition">LinkedIn</span>
          </a>
        </div>
      </footer>
    </div>
  );
} 