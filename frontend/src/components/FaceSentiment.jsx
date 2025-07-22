import React, { useRef, useState, useEffect, useCallback, useMemo } from "react";
import { FaceMesh } from "@mediapipe/face_mesh";
import { Camera } from "@mediapipe/camera_utils";
import { getEmoji, predictEmotion, detectFaceEmotion } from "../utils/emotionUtil";
import FaceEmotionChart from './FaceEmotionChart';
import humanHeadPng from '../assets/face-scanner.png';
import humanHeadWebp from '../assets/face-scanner.webp';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { Listbox, Transition } from '@headlessui/react';
import { ChevronUpDownIcon, CheckIcon } from '@heroicons/react/24/outline';
import { Fragment } from 'react';
import { SENTIMENT_ICONS as TEXT_SENTIMENT_ICONS } from './SentimentResult';
import { EMOTION_COLORS as TEXT_EMOTION_COLORS, EMOTION_ICONS as TEXT_EMOTION_ICONS } from './Summary';
import { PDFDownloadLink } from '@react-pdf/renderer';
import FaceScanPDF from './FaceScanPDF';
import { useAuth } from '../contexts/AuthContext';

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

function SessionSummary({ timeline }) {
  if (!timeline || timeline.length === 0) return null;

  // Calculate most frequent emotion
  const emotionCounts = useMemo(() => {
    const counts = {};
    let confidenceSum = 0;
    timeline.forEach(({ emotion, confidence }) => {
      counts[emotion] = (counts[emotion] || 0) + 1;
      confidenceSum += confidence;
    });
    return counts;
  }, [timeline]);
  const mostFrequentEmotion = useMemo(() => Object.entries(emotionCounts).reduce((a, b) => (a[1] > b[1] ? a : b))[0], [emotionCounts]);
  const averageConfidence = useMemo(() => {
    if (!timeline.length) return 0;
    let sum = 0;
    timeline.forEach(({ confidence }) => { sum += confidence; });
    return (sum / timeline.length).toFixed(1);
  }, [timeline]);
  const pieData = useMemo(() => Object.entries(emotionCounts).map(([emotion, count]) => ({ name: emotion, value: count })), [emotionCounts]);
  const total = timeline.length;
  const distribution = useMemo(() => Object.entries(emotionCounts).map(([emotion, count]) => ({ name: emotion, percent: Math.round((count / total) * 100) })), [emotionCounts, total]);
  // Detect mobile
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;

  return (
    <div className="w-full flex flex-col items-center justify-center mt-10">
      <h3 className="unbounded-bold text-lg sm:text-xl md:text-2xl mb-4 text-white text-center">Session Summary</h3>
      <div className="flex flex-wrap gap-8 justify-center w-full mb-8">
        <div className="flex flex-col items-center bg-[#181A1B] border border-cyan-400/40 rounded-xl p-6 shadow-lg min-w-[160px] max-w-xs">
          <span className="text-lg font-semibold mb-1 tracking-wide text-cyan-200">Most Frequent Emotion</span>
          <span className="text-2xl font-bold mt-1" style={{ color: TEXT_EMOTION_COLORS[mostFrequentEmotion] || '#FFD700' }}>{mostFrequentEmotion}</span>
        </div>
        <div className="flex flex-col items-center bg-[#181A1B] border border-cyan-400/40 rounded-xl p-6 shadow-lg min-w-[160px] max-w-xs">
          <span className="text-lg font-semibold mb-1 tracking-wide text-cyan-200">Average Confidence</span>
          <span className="text-2xl font-bold mt-1 text-[#FFD700]">{averageConfidence}%</span>
        </div>
      </div>
      {/* Emotion Distribution Cards (match text analysis style) */}
      <div className="flex flex-wrap justify-center gap-6 mt-6 mb-8 w-full">
        {distribution.map((entry, idx) => (
          <div
            key={entry.name}
            className="flex flex-col items-center justify-center w-36 h-36 rounded-xl shadow border border-[#2e3236] bg-[#181A1B]"
            style={{ boxShadow: '0 0 8px 1px ' + (TEXT_EMOTION_COLORS[entry.name] || '#FFD700') + '44' }}
          >
            <span className="text-2xl mb-1" style={{ color: TEXT_EMOTION_COLORS[entry.name] }}>{TEXT_EMOTION_ICONS[entry.name]}</span>
            <span className="unbounded-bold text-base" style={{ color: TEXT_EMOTION_COLORS[entry.name] }}>{entry.name}</span>
            <span className="font-mono text-[#FFD700] text-lg">{entry.percent}%</span>
          </div>
        ))}
      </div>
      <div className="w-full max-w-md mx-auto">
        <ResponsiveContainer width="100%" height={260}>
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
              isAnimationActive={!isMobile}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            >
              {pieData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={TEXT_EMOTION_COLORS[entry.name] || '#FFD700'}
                  stroke="#181A1B"
                  style={{ filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.08))" }}
                />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const d = payload[0];
                  const value = d.value || 0;
                  const percent = total > 0 ? (value / total) * 100 : 0;
                  return (
                    <div className="bg-[#23272b] rounded-full shadow-lg px-4 py-2 border border-[#2e3236] animate-fade-in flex items-center gap-2 min-w-0 max-w-xs mx-auto text-base inter-semibold text-white"
                      style={{ pointerEvents: 'none', minWidth: 'unset', maxWidth: 180 }}>
                      <span className="text-xl">{TEXT_EMOTION_ICONS[d.name] || ''}</span>
                      <span>{d.name}</span>
                      <span className="ml-2 font-mono">{percent.toFixed(1)}%</span>
                    </div>
                  );
                }
                return null;
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
const MemoSessionSummary = React.memo(SessionSummary);

const modelOptions = [
  { value: 'rule', label: 'Fast & Simple (Recommended)' },
  { value: 'deep', label: 'Advanced AI' },
];

const FaceSentiment = React.memo(() => {
  const { user } = useAuth();
  const videoRef = useRef(null);
  const [timeline, setTimeline] = useState([]); // [{time, emotion, emoji, confidence}]
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState("");
  const [mode, setMode] = useState('rule'); // 'rule' or 'deep'
  const [cameraOn, setCameraOn] = useState(false);
  const [countdown, setCountdown] = useState(5); // NEW
  const resultsRef = useRef(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false); // NEW
  const [shouldScroll, setShouldScroll] = useState(false); // NEW

  // Countdown effect
  useEffect(() => {
    let timer;
    if (scanning && countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    if (!scanning) {
      setCountdown(5);
    }
    return () => clearTimeout(timer);
  }, [scanning, countdown]);

  // Helper to stop and cleanup video
  const stopVideo = useCallback(() => {
    const stream = videoRef.current?.srcObject;
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setScanning(false);
  }, []);

  const handleAnalyzeFace = useCallback(async () => {
    setTimeline([]);
    setError("");
    setScanning(true);
    setCameraOn(true);
    setCountdown(5); // Reset timer
    setIsAnalyzing(true); // NEW
    setShouldScroll(false); // NEW
    let results = [];
    let currentLandmarks = null;
    let faceMesh = null;
    let camera = null;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current.srcObject = stream;

      faceMesh = new FaceMesh({
        locateFile: (file) =>
          `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
      });
      faceMesh.setOptions({
        maxNumFaces: 1,
        refineLandmarks: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });

      faceMesh.onResults((res) => {
        if (res.multiFaceLandmarks && res.multiFaceLandmarks.length > 0) {
          currentLandmarks = res.multiFaceLandmarks[0];
        } else {
          currentLandmarks = null;
        }
      });

      camera = new Camera(videoRef.current, {
        onFrame: async () => {
          await faceMesh.send({ image: videoRef.current });
        },
        width: 320,
        height: 240,
      });
      camera.start();

      for (let second = 1; second <= 5; second++) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        let emotion, confidence;
        if (mode === 'deep') {
          // Ensure video is ready before detection
          if (videoRef.current && videoRef.current.readyState >= 2) {
            const pred = await detectFaceEmotion(mode, videoRef.current);
            if (typeof pred === "object") {
              emotion = pred.emotion || pred;
              confidence = pred.confidence || 0;
            } else {
              emotion = pred;
              confidence = 0;
            }
          } else {
            emotion = "No Face";
            confidence = 0;
          }
        } else {
          if (!currentLandmarks) {
            emotion = "No Face";
            confidence = 0;
          } else {
            const pred = await detectFaceEmotion(mode, currentLandmarks);
            if (typeof pred === "object") {
              emotion = pred.emotion || pred;
              confidence = pred.confidence || 0;
            } else {
              emotion = pred;
              confidence = 0;
            }
          }
        }
        results.push({
          time: `${second}s`,
          emotion,
          emoji: getEmoji(emotion),
          confidence: Math.round(confidence),
        });
        setTimeline([...results]);
      }
      setTimeline(results);
      setTimeout(() => setShouldScroll(true), 2000); // Scroll after 2s
      setTimeout(() => setIsAnalyzing(false), 3000); // Loader for 3s

      // Stop everything after 5 seconds
      camera.stop();
      faceMesh.close();
      stopVideo();
      setScanning(false);
      setCameraOn(false);
    } catch (err) {
      setError("Could not access camera. Please check permissions.");
      setIsAnalyzing(false);
      setShouldScroll(false);
      stopVideo();
      setScanning(false);
      setCameraOn(false);
    }
  }, [mode, stopVideo]);

  useEffect(() => {
    if (timeline.length > 0 && shouldScroll && resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [timeline, shouldScroll]);

  // Helper to map Face API emotion to SentimentResult icon key
  const mapFaceEmotionToIconKey = useCallback((emotion) => {
    switch ((emotion || '').toLowerCase()) {
      case 'happy': return 'joy';
      case 'sad': return 'sadness';
      case 'angry': return 'anger';
      case 'surprised': return 'surprise';
      case 'fearful': return 'fear';
      case 'disgusted': return 'disgust';
      case 'contempt': return 'contempt';
      case 'neutral': return 'neutral';
      case 'positive': return 'positive';
      case 'negative': return 'negative';
      default: return 'neutral';
    }
  }, []);

  return (
    <div className="w-full flex flex-col items-center justify-center">
      {/* Main Card (like Text Analyzer input box) */}
      <div className="w-full max-w-5xl flex flex-col items-center justify-center rounded-2xl border border-white/20 shadow-xl p-4 sm:p-6 md:p-10 backdrop-blur-md bg-white/5 text-white mb-6 sm:mb-10">
        {/* Model Selector and Button Row */}
        <div className="w-full flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 ">
          {/* Sleek model selector dropdown (Headless UI Listbox) */}
          <div className="w-full max-w-xs mb-3 sm:mb-0">
            <Listbox value={mode} onChange={setMode} disabled={scanning}>
              <div className="relative mt-1">
                <Listbox.Button className="relative w-full cursor-pointer rounded-xl bg-[#181A1B]/80 py-2 pl-4 pr-10 text-left text-white shadow focus:outline-none focus:ring-2 focus:ring-[#FFD700] border border-white/20 hover:border-[#FFD700] focus:border-[#FFD700] transition-all duration-200 backdrop-blur-md">
                  <span className="block truncate inter-regular">
                    {modelOptions.find((opt) => opt.value === mode)?.label}
                  </span>
                  <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                    <ChevronUpDownIcon className="h-5 w-5 text-[#FFD700]" aria-hidden="true" />
                  </span>
                </Listbox.Button>
                <Transition
                  as={Fragment}
                  leave="transition ease-in duration-100"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <Listbox.Options className="absolute z-10 mt-2 max-h-60 w-full min-w-[260px] overflow-auto rounded-xl bg-[#181A1B]/95 py-2 shadow-xl ring-1 ring-[#FFD700]/30 border border-[#FFD700]/40 focus:outline-none backdrop-blur-md">
                    {modelOptions.map((option) => (
                      <Listbox.Option
                        key={option.value}
                        className={({ active, selected }) =>
                          `relative cursor-pointer select-none py-3 pl-10 pr-4 inter-regular text-base rounded-lg transition-all duration-150
                          ${active ? 'bg-[#FFD700]/10 text-[#FFD700]' : 'text-white/90'}
                          ${selected ? 'font-bold bg-[#FFD700]/20 text-[#FFD700]' : ''}`
                        }
                        value={option.value}
                      >
                        {({ selected }) => (
                          <>
                            <span className={`block truncate ${selected ? 'font-bold' : ''}`}>{option.label}</span>
                            {selected ? (
                              <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                                <CheckIcon className="h-5 w-5 text-[#FFD700]" aria-hidden="true" />
                              </span>
                            ) : null}
                          </>
                        )}
                      </Listbox.Option>
                    ))}
                  </Listbox.Options>
                </Transition>
              </div>
            </Listbox>
          </div>
          <button
            onClick={handleAnalyzeFace}
            className={`mt-6 px-8 py-3 rounded-full unbounded-bold text-lg shadow-lg border-2 transition-all duration-200 ${isAnalyzing ? 'bg-[#181A1B] text-[#FFD700] border-[#FFD700] cursor-wait' : 'bg-[#FFD700] text-black border-[#FFD700]/80 hover:scale-105'}`}
            disabled={isAnalyzing || scanning}
            style={{ minWidth: 140, minHeight: 48 }}
          >
            {isAnalyzing ? (
              <span className="flex items-center justify-center w-full">
                <span className="inline-block w-7 h-7 align-middle">
                  <svg className="animate-spin" viewBox="0 0 50 50">
                    <circle className="opacity-20" cx="25" cy="25" r="20" fill="none" stroke="#FFD700" strokeWidth="6" />
                    <circle className="opacity-90" cx="25" cy="25" r="20" fill="none" stroke="#FFD700" strokeWidth="6" strokeDasharray="31.4 188.4" strokeLinecap="round" />
                  </svg>
                </span>
                <span className="ml-2 text-base font-semibold tracking-wide">Analyzing...</span>
              </span>
            ) : (
              'Analyze Face'
            )}
          </button>
        </div>
        {/* Camera Preview or SVG */}
        <div className="flex justify-center items-center mt-4 w-full">
          <div className="flex items-center justify-center w-[290px] h-[190px] rounded-2xl border border-white/20 bg-[#181A1B] shadow-xl">
            {cameraOn ? (
              <video
                ref={videoRef}
                autoPlay
                muted
                width={290}
                height={190}
                className="object-contain w-full h-full rounded-2xl"
              />
            ) : (
              <picture>
                <source srcSet={humanHeadWebp} type="image/webp" />
                <img src={humanHeadPng} alt="Face Scanner" loading="lazy" className="w-32 h-32 mx-auto" style={{ objectFit: 'contain' }} />
              </picture>
            )}
          </div>
        </div>
        {error && <div className="text-red-400 mb-2 inter-regular font-semibold text-sm sm:text-base">{error}</div>}
        {/* Show a user message if confidence is low or emotion is No Face */}
        {timeline.length > 0 && timeline.some(entry => (entry.emotion === 'No Face' || entry.confidence < 50)) && (
          <div className="mb-2 text-yellow-400 font-semibold text-sm sm:text-base text-center">
            Face not clearly detected. Please ensure good lighting and face the camera directly.
          </div>
        )}
        {/* Tips/Steps for Using Face Scan */}
        <div className="w-full flex flex-wrap justify-center gap-2 sm:gap-4 mt-2">
          <ul className="list-disc list-inside flex flex-col sm:flex-row flex-wrap gap-x-4 gap-y-1 inter-regular text-white/80 text-sm sm:text-base text-left mx-auto max-w-2xl">
            <li>Ensure your face is well-lit and visible to the camera.</li>
            <li>Choose the analysis model above.</li>
            <li>Click <span className="text-[#FFD700] font-bold">Analyze Face</span> and look at the camera.</li>
            <li>Hold still for 5 seconds while your emotions are analyzed.</li>
            <li>Review your emotion timeline and summary below.</li>
          </ul>
        </div>
      </div>
      {/* Results Section */}
      {timeline.length > 0 && (
        <div className="w-full max-w-5xl mx-auto flex flex-col items-center" ref={resultsRef}>
          <hr className="w-full my-8 sm:my-10 border-0 h-1 bg-gradient-to-r from-transparent via-[#FFD700] to-transparent shadow-[0_0_8px_2px_#FFD70044] rounded-full" />
          <div className="w-full rounded-2xl border border-white/20 shadow-xl p-4 sm:p-8 backdrop-blur-md bg-white/5 text-white mb-6 sm:mb-10">
            <h2 className="unbounded-bold text-2xl sm:text-3xl mb-6 sm:mb-8 text-[#FFD700] flex items-center gap-4 justify-between">
              <span>Face Analyser Results</span>
              {timeline.length > 0 && (
                <PDFDownloadLink
                  document={<FaceScanPDF timeline={timeline} user={user} model={mode === 'deep' ? 'Advanced AI' : 'Fast & Simple'} />}
                  fileName="face-scan-results.pdf"
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#FFD700] text-[#181A1B] unbounded-bold text-base shadow hover:bg-[#5fffe0] transition border-2 border-[#FFD700]"
                >
                  <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#181A1B" strokeWidth="2" className="inline-block"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v12m0 0l-4-4m4 4l4-4M4 20h16"/></svg>
                  Download Results
                </PDFDownloadLink>
              )}
            </h2>
            <h3 className="unbounded-bold text-lg sm:text-2xl mb-4 sm:mb-6 text-[#ffffff]">Face Emotion Timeline (5s)</h3>
            {timeline.some(entry => entry.emotion === 'Deep model not available') && (
              <div className="mb-4 text-yellow-400 font-semibold text-sm sm:text-base text-center">Advanced AI model is not available in this environment. Please use 'Fast & Simple (Rule-Based)' or install the deep model locally.</div>
            )}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 gap-y-3 justify-center mb-6 sm:mb-8 w-full mx-auto">
              {timeline.map((entry, i) => (
                <div
                  key={i}
                  className="p-2 sm:p-3 rounded-2xl border border-white/10 bg-[#23272b] shadow text-center flex flex-col items-center min-w-0 min-h-[90px] max-w-[110px] sm:min-w-[110px] sm:max-w-[130px] mx-auto"
                >
                  <p className="text-xs text-white/60 inter-regular mb-1">{entry.time}</p>
                  <div className="text-base sm:text-lg mt-1 mb-1 capitalize unbounded-medium flex items-center justify-center whitespace-nowrap" style={{ color: '#ffffff' }}>
                    
                    {/* Use SVG icon instead of emoji */}
                    {TEXT_SENTIMENT_ICONS[mapFaceEmotionToIconKey(entry.emotion)]}
                    <span className="ml-1">{entry.emotion}</span>
                  </div>
                  <p className="text-xs text-white/80 inter-regular">
                    Confidence: <span className="font-bold text-[#FFD700]">{entry.confidence}%</span>
                  </p>
                </div>
              ))}
            </div>
            <FaceEmotionChart timeline={timeline} />
            {/* Session summary and export will be added here */}
            {/* Session Summary */}
            <MemoSessionSummary timeline={timeline} />
          </div>
        </div>
      )}
      {/* Model Options Section (Feature Card Style) */}
      
      {/* How to Use Section */}
      <hr className="w-full my-8 sm:my-10 border-0 h-1 bg-gradient-to-r from-transparent via-[#FFD700] to-transparent shadow-[0_0_8px_2px_#FFD70044] rounded-full" />
      <div className="w-full rounded-2xl border border-white/20 shadow-xl p-4 sm:p-8 min-h-[120px] sm:min-h-[180px] flex flex-col justify-center items-center backdrop-blur-md bg-white/5 text-white mt-6 sm:mt-8 mb-6 sm:mb-10">
        <h2 className="unbounded-bold text-xl sm:text-2xl mb-3 sm:mb-4 text-[#FFD700] text-center tracking-wider">How to Use Face Analyser</h2>
        <ol className="list-decimal list-inside space-y-1 sm:space-y-2 inter-regular text-white/90 text-sm sm:text-base md:text-lg w-full text-center mx-auto max-w-xs sm:max-w-lg">
          <li>Allow camera access when prompted.</li>
          <li>Position your face in the center of the frame.</li>
          <li>Choose the model and click Analyze Face.</li>
          <li>Hold still and look at the camera for 5 seconds.</li>
          <li>Review your results and insights below.</li>
        </ol>
      </div>
      <div className="w-full my-10 flex justify-center">
          <div className="h-1 w-full bg-gradient-to-r from-transparent via-[#FFD700] to-transparent shadow-[0_0_8px_2px_#FFD70044] rounded-full" />
        </div>
      {/* Model Comparison Section */}
      <div className="w-full rounded-2xl border border-white/20 shadow-xl p-4 sm:p-8 flex flex-col justify-center items-center backdrop-blur-md bg-white/5 text-white mb-6 sm:mb-10">
        <h2 className="unbounded-bold text-xl sm:text-2xl mb-3 sm:mb-4 text-[#FFD700] text-center tracking-wider">Model Options</h2>
        <div className="w-full max-w-2xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-xl p-4 border border-white/20 flex flex-col gap-2">
              <h3 className="unbounded-bold text-lg text-white mb-1">Fast & Simple (Recommended)</h3>
              <ul className="list-disc list-inside text-sm sm:text-base text-white/80 pl-4">
                <li>Uses geometric rules on facial landmarks (MediaPipe Face Mesh).</li>
                <li>No deep learning—runs instantly in your browser.</li>
                <li>Very fast, works on all devices.</li>
                <li>Good for basic emotion detection.</li>
              </ul>
            </div>
            <div className="rounded-xl p-4 border border-white/20 flex flex-col gap-2">
              <h3 className="unbounded-bold text-lg text-white mb-1">Advanced AI</h3>
              <ul className="list-disc list-inside text-sm sm:text-base text-white/80 pl-4">
                <li>Uses deep learning models (face-api.js) for emotion recognition.</li>
                <li>More accurate for subtle/complex emotions.</li>
                <li>Runs in your browser, but loads larger model files.</li>
                <li>May be slower to start, but better for nuanced analysis.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

export default FaceSentiment;
