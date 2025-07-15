import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { useState, useEffect } from "react";
import React from "react"; // Added for React.cloneElement
import OldBackground from '../components/OldBackground';
// import HolographicCubesBackground from '../components/HolographicCubesBackground';

const features = [
  {
    title: "Text & Paragraph Analysis",
    desc: "Analyze sentiment and emotion at sentence and paragraph level with advanced AI.",
    icon: (
      <svg width="32" height="32" fill="none" stroke="#00FFCC" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-align-left mb-2"><line x1="17" y1="10" x2="3" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="17" y1="18" x2="3" y2="18"/></svg>
    ),
  },
  {
    title: "Voice & Webcam Input",
    desc: "Real-time voice transcription and facial emotion detection using your webcam.",
    icon: (
      <svg width="32" height="32" fill="none" stroke="#FFD700" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-mic mb-2"><circle cx="12" cy="11" r="4"/><path d="M19 11v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>
    ),
  },
  {
    title: "Deep Learning & Rule-Based",
    desc: "Switch between fast rule-based and powerful deep learning models (BERT, RoBERTa).",
    icon: (
      <svg width="32" height="32" fill="none" stroke="#FF6B6B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-cpu mb-2"><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="15" x2="23" y2="15"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="15" x2="4" y2="15"/></svg>
    ),
  },
];

const aiModels = [
  {
    name: "BERT (Bidirectional Encoder Representations from Transformers)",
    description: "Advanced transformer model for deep understanding of text context and sentiment analysis with 99.2% accuracy.",
    type: "Deep Learning",
    accuracy: "99.2%"
  },
  {
    name: "RoBERTa (Robustly Optimized BERT Pretraining Approach)",
    description: "Enhanced BERT variant with improved training methodology for superior sentiment classification performance.",
    type: "Deep Learning", 
    accuracy: "99.5%"
  },
  {
    name: "VADER (Valence Aware Dictionary and sEntiment Reasoner)",
    description: "Rule-based sentiment analyzer optimized for social media text with real-time processing capabilities.",
    type: "Rule-Based",
    accuracy: "85.3%"
  },
  {
    name: "TextBlob",
    description: "Lightweight sentiment analysis library providing fast polarity and subjectivity scores for quick insights.",
    type: "Rule-Based",
    accuracy: "78.9%"
  }
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
function AnimatedCounter({ end, suffix = "", duration = 2 }) {
  const [count, setCount] = useState(0);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    if (isInView) {
      let startTime = null;
      const animate = (currentTime) => {
        if (!startTime) startTime = currentTime;
        const progress = Math.min((currentTime - startTime) / (duration * 1000), 1);
        const currentCount = Math.floor(progress * end);
        setCount(currentCount);
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };
      requestAnimationFrame(animate);
    }
  }, [isInView, end, duration]);

  return (
    <motion.span
      onViewportEnter={() => setIsInView(true)}
      className="unbounded-bold text-3xl"
    >
      {count}{suffix}
    </motion.span>
  );
}

// FAQ Item Component
function FAQItem({ question, answer, isOpen, onToggle }) {
  return (
    <motion.div
      className="border border-white/20 rounded-2xl overflow-hidden backdrop-blur-sm"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.01 }}
      whileHover={{ 
        scale: 1.02,
        boxShadow: "0 0 30px rgba(0, 255, 204, 0.2)",
        borderColor: '#FFD700'
      }}
      transition={{ duration: 0.3 }}
    >
      <button
        onClick={onToggle}
        className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-white/5 transition-colors"
      >
        <h4 className="unbounded-regular text-lg text-white font-medium">{question}</h4>
        <motion.svg
          width="20"
          height="20"
          fill="none"
          stroke="#00FFCC"
          strokeWidth="2"
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <polyline points="6,9 12,15 18,9"></polyline>
        </motion.svg>
      </button>
      <motion.div
        initial={false}
        animate={{ height: isOpen ? "auto" : 0, opacity: isOpen ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        className="overflow-hidden"
      >
        <div className="px-6 pb-4">
          <p className="inter-regular text-white/80 leading-relaxed">{answer}</p>
        </div>
      </motion.div>
    </motion.div>
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
          className="unbounded-black text-4xl md:text-6xl mb-6 tracking-widest text-white text-center"
        >
          Multi-Sentiment Analyzer
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.35 }}
          className="inter-regular text-lg md:text-2xl text-white/90 mb-10 max-w-2xl mx-auto text-center"
        >
          Analyze text, voice, and facial expressions for sentiment and emotion using state-of-the-art AI.
        </motion.p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <motion.div
            className="rounded-full"
            whileHover={{ 
              scale: 1.05,
              boxShadow: "0 0 30px rgba(255, 215, 0, 0.6)",
              borderColor: '#FFD700'
            }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.3 }}
          >
            <Link
              to="/analyze"
              className="flex items-center px-8 py-3 rounded-full unbounded-bold text-lg bg-black text-white border-2 border-[#222] hover:bg-white hover:text-black transition-all duration-300 shadow-lg border-[#FFD700]"
            >
              Try Text Analyzer
            </Link>
          </motion.div>
          <motion.div
            className="rounded-full"
            whileHover={{ 
              scale: 1.05,
              boxShadow: "0 0 30px rgba(255, 215, 0, 0.6)",
              borderColor: '#FFD700'
            }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.3 }}
          >
            <Link
              to="/face-scan"
              className="px-8 py-3 rounded-full unbounded-bold text-lg bg-black text-white border-2 border-[#222] hover:bg-white hover:text-black transition-all duration-300 shadow-lg border-[#FFD700]"
            >
              Discover Face Scan
            </Link>
          </motion.div>
        </div>
      </section>
      {/* 1. Why Choose Multi-Sentiment Analyzer? (feature cards) */}
      <section className="w-full max-w-4xl mx-auto mb-16 px-4">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.01 }}
          transition={{ duration: 0.3, type: 'spring' }}
          className="unbounded-bold text-3xl md:text-4xl mb-10 tracking-widest text-white text-center rounded-2xl py-6 px-2 shadow-xl"
        >
          Why Choose Multi-Sentiment Analyzer?
        </motion.div>
        {/* Feature cards outer box */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
          transition={{ duration: 0.3, type: 'spring' }}
        >
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              className="rounded-2xl border border-white/20 shadow-xl p-6 flex flex-col items-center text-center backdrop-blur-md bg-white/5 cursor-pointer border border-white/20"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.01 }}
              transition={{ duration: 0.3, type: 'spring' }}
              whileHover={{
                scale: 1.015,
                borderColor: '#FFD700'
              }}
              whileTap={{ scale: 0.99 }}
            >
              <motion.div 
                className="mb-4"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
              >
                {f.icon}
              </motion.div>
              <h3 className="unbounded-bold text-xl mb-2 text-white">{f.title}</h3>
              <p className="inter-regular text-base text-white/80">{f.desc}</p>
            </motion.div>
          ))}
        </motion.div>
        
      </section>
      <div className="w-full my-10 flex justify-center">
          <div className="h-0.5 w-3/4 bg-gradient-to-r from-transparent via-[#FFD700] to-transparent shadow-[0_0_8px_2px_#FFD70044] rounded-full" />
        </div>
      
      {/* 2. How it works (two cards: Text Analyzer and Face Scan) */}
      <section className="w-full max-w-4xl mx-auto mb-16 px-4">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.01 }}
          transition={{ duration: 0.3, type: 'spring' }}
            className="unbounded-bold text-3xl md:text-4xl mb-10 tracking-widest text-white text-center rounded-2xl py-6 px-2 shadow-xl"
        >
          How it works
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Text Analyzer Card */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.01 }}
            transition={{ duration: 0.3, type: 'spring' }}
            whileHover={{ scale: 1.015, borderColor: '#FFD700' }}
            className="rounded-2xl border border-white/20 shadow-xl p-8 flex flex-col bg-white/5 backdrop-blur-md"
          >
            <h3 className="unbounded-bold text-2xl mb-4 text-[#FFD700] text-center">Text Analyzer</h3>
            <ol className="list-decimal list-inside inter-regular text-white/90 space-y-2">
              <li>Select the analysis model: Rule-Based (fast, simple) or Deep Learning (advanced, local only).</li>
              <li>Type, paste, or speak your text into the input box.</li>
              <li>Click the <span className="font-bold">Analyze</span> button.</li>
              <li>View instant sentiment and emotion results for each sentence and the whole text, with clear charts and icons.</li>
            </ol>
          </motion.div>
          {/* Face Scan Card */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.01 }}
            transition={{ duration: 0.3, type: 'spring' }}
                whileHover={{ scale: 1.015, borderColor: '#FFD700' }}
            className="rounded-2xl border border-white/20 shadow-xl p-8 flex flex-col bg-white/5 backdrop-blur-md"
          >
            <h3 className="unbounded-bold text-2xl mb-4 text-[#FFD700] text-center">Face Scan</h3>
            <ol className="list-decimal list-inside inter-regular text-white/90 space-y-2">
              <li>Click <span className="font-bold">Discover Face Scan</span> on the home page or in the menu.</li>
              <li>Allow camera access when prompted (your video stays private).</li>
              <li>Click <span className="font-bold">Start Face Scan</span> and look at your webcam for a few seconds.</li>
              <li>See your detected emotions in real time, visualized as a timeline of facial expressions.</li>
            </ol>
          </motion.div>
        </div>
      </section>
      <div className="w-full my-10 flex justify-center">
          <div className="h-0.5 w-3/4 bg-gradient-to-r from-transparent via-[#FFD700] to-transparent shadow-[0_0_8px_2px_#FFD70044] rounded-full" />
        </div>
      {/* 3. AI Models Powering Our Analysis (AI model cards) */}
      <section className="w-full max-w-4xl mx-auto mb-16 px-4">
      <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.01 }}
          transition={{ duration: 0.3, type: 'spring' }}
          className="unbounded-bold text-3xl md:text-4xl mb-10 tracking-widest text-white text-center rounded-2xl py-6 px-2 shadow-xl"
        >
          AI Models Powering Our Analysis
        </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {aiModels.map((model, i) => (
              <motion.div
                key={model.name}
                className="rounded-2xl p-8 backdrop-blur-md border border-white/20 shadow-xl bg-white/5 flex flex-col justify-between items-center h-full"
                initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.01 }}
                transition={{ duration: 0.3, type: 'spring' }}
                whileHover={{ scale: 1.015, borderColor: '#FFD700' }}
              >
               {/* Golden Donut Chart for Accuracy */}
               
                <div className="w-full flex-1 flex flex-col items-center">
                  <div className="flex items-start justify-between mb-3 w-full">
                    <h4 className="unbounded-bold text-lg text-white mb-2">{model.name}</h4>
                    <span className={`px-3 py-1 rounded-full text-xs inter-bold ${
                      model.type === "Deep Learning" 
                        ? "bg-gradient-to-r from-purple-500/20 to-blue-500/20 text-purple-300 border border-purple-500/30"
                        : "bg-gradient-to-r from-green-500/20 to-teal-500/20 text-green-300 border border-green-500/30"
                    }`}>
                      {model.type}
                    </span>
                  </div>
                  <p className="inter-regular text-sm text-white/80 mb-3 w-full" style={{ minHeight: '48px' }}>{model.description}</p>
                </div>
                <div className="flex flex-col items-center justify-end mt-auto">
                  <span className="text-xs text-white/70 mb-1 tracking-wider">Accuracy</span>
                  <GoldenDonut percent={parseFloat(model.accuracy)} />
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
      <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.01 }}
          transition={{ duration: 0.3, type: 'spring' }}
          className="unbounded-bold text-3xl md:text-4xl mb-10 tracking-widest text-white text-center rounded-2xl py-6 px-2 shadow-xl "
        >
          Our Impact in Numbers
        </motion.div>
          <div className="grid grid-cols-2  md:grid-cols-4 gap-6">
            {animatedStats.map((stat, i) => (
              <motion.div
                key={stat.label}
                className="text-center rounded-2xl border border-white/20  bg-white/5 backdrop-blur-md shadow-xl p-4"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.01 }}
                transition={{smooth: true, duration: 0.3 }}
                whileHover={{ scale: 1.05, color: stat.color, borderColor: '#FFD700' }}
              >
                <div className="mb-2 ">
                  <AnimatedCounter 
                    end={stat.value} 
                    suffix={stat.suffix} 
                    duration={2.5}
                  />
                </div>
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
      <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.01 }}
          transition={{ duration: 0.3, type: 'spring' }}
          className="unbounded-bold text-3xl md:text-4xl mb-10 tracking-widest text-white text-center rounded-2xl py-6 px-2 shadow-xl "
        >
          Frequently Asked Questions
        </motion.div>
          <div className="space-y-4">
            {faqData.map((faq, i) => (
              <motion.div
                key={i}
                className="inter rounded-2xl overflow-hidden backdrop-blur-md shadow bg-white/2"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.01 }}
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
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
    </div>
  );
} 