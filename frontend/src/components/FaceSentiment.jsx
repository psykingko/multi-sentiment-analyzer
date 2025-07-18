import React, { useRef, useState } from "react";
import { FaceMesh } from "@mediapipe/face_mesh";
import { Camera } from "@mediapipe/camera_utils";
import { getEmoji, predictEmotion, detectFaceEmotion } from "../utils/emotionUtil";
import FaceEmotionChart from './FaceEmotionChart';
import EmotionIntensityMeter from './EmotionIntensityMeter';
import humanHeadPng from '../assets/face-scanner.png';

const FaceSentiment = () => {
  const videoRef = useRef(null);
  const [timeline, setTimeline] = useState([]); // [{time, emotion, emoji, confidence}]
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState("");
  const [mode, setMode] = useState('rule'); // 'rule' or 'deep'
  const [cameraOn, setCameraOn] = useState(false);

  // Helper to stop and cleanup video
  const stopVideo = () => {
    const stream = videoRef.current?.srcObject;
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setScanning(false);
  };

  const handleAnalyzeFace = async () => {
    setTimeline([]);
    setError("");
    setScanning(true);
    setCameraOn(true);
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
        if (!currentLandmarks && mode === 'rule') {
          emotion = "No Face";
          confidence = 0;
        } else {
          const input = mode === 'deep' ? videoRef.current : currentLandmarks;
          const pred = await detectFaceEmotion(mode, input);
          if (typeof pred === "object") {
            emotion = pred.emotion || pred;
            confidence = pred.confidence || 0;
          } else {
            emotion = pred;
            confidence = 0;
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

      // Stop everything after 5 seconds
      camera.stop();
      faceMesh.close();
      stopVideo();
      setScanning(false);
      setCameraOn(false);
    } catch (err) {
      setError("Could not access camera. Please check permissions.");
      stopVideo();
      setScanning(false);
      setCameraOn(false);
    }
  };

  return (
    <div className="w-full flex flex-col items-center justify-center">
      {/* Main Card (like Text Analyzer input box) */}
      <div className="w-full max-w-5xl flex flex-col items-center justify-center rounded-2xl border border-white/20 shadow-xl p-8 md:p-10 backdrop-blur-md bg-white/5 text-white mb-10">
        {/* Model Selector and Button Row */}
        <div className="w-full flex flex-row items-center justify-center gap-6 ">
          <select
            value={mode}
            onChange={e => setMode(e.target.value)}
            className="rounded-xl bg-[#181A1B]/80 py-2 px-2 text-white shadow focus:outline-none focus:ring-2 focus:ring-[#00FFCC] border border-white/20 hover:border-[#00FFCC] transition-all duration-200 backdrop-blur-md text-base font-semibold w-full max-w-xs"
          >
            <option value="rule">Fast & Simple</option>
            <option value="deep">Advanced AI</option>
          </select>
          <button
            className="w-full max-w-xs px-4 py-2 bg-[#00FFCC] text-[#181A1B] rounded-full unbounded-bold shadow-lg hover:scale-105 border-2 border-[#00FFCC]/80 focus:outline-none focus:ring-2 focus:ring-[#00FFCC] disabled:opacity-60 text-s transition-all"
            onClick={handleAnalyzeFace}
            disabled={scanning}
          >
            {scanning ? "Scanning..." : "Start Face Scan (5s)"}
          </button>
        </div>
        {/* Camera Preview or SVG */}
        <div className="flex justify-center items-center mt-2  w-full min-h-[220px]">
          {cameraOn ? (
            <video
              ref={videoRef}
              autoPlay
              muted
              width="220"
              height="220"
              className="rounded-2xl border border-white/20 bg-[#181A1B] shadow-xl object-cover"
            />
          ) : (
            <div className="flex items-center justify-center w-[290px] h-[190px] rounded-2xl border border-white/20 bg-[#181A1B] shadow-xl">
              {/* Human Head Silhouette PNG with gold filter */}
              <img
                src={humanHeadPng}
                width={120}
                height={120}
                alt="Human Head Silhouette"
                style={{ filter: 'brightness(1.2) sepia(1) hue-rotate(10deg) saturate(8) contrast(1.2)' }}
              />
            </div>
          )}
        </div>
        {error && <div className="text-red-400 mb-2 inter-regular font-semibold">{error}</div>}
        {/* Tips/Steps for Using Face Scan */}
        <div className="w-full flex flex-wrap justify-center gap-4 mt-2">
          <ul className="list-disc list-inside flex flex-row flex-wrap gap-x-8 gap-y-1 inter-regular text-white/80 text-base text-left mx-auto max-w-2xl">
            <li>Ensure your face is well-lit and visible to the camera.</li>
            <li>Choose the analysis model above.</li>
            <li>Click <span className="text-[#FFD700] font-bold">Start Face Scan</span> and look at the camera.</li>
            <li>Hold still for 5 seconds while your emotions are analyzed.</li>
            <li>Review your emotion timeline and summary below.</li>
          </ul>
        </div>
      </div>
      {/* Results Section */}
      {timeline.length > 0 && (
        <div className="w-full max-w-3xl mx-auto flex flex-col items-center">
          <hr className="w-full my-10 border-0 h-1 bg-gradient-to-r from-transparent via-[#FFD700] to-transparent shadow-[0_0_8px_2px_#FFD70044] rounded-full" />
          <div className="w-full rounded-2xl border border-white/20 shadow-xl p-8 backdrop-blur-md bg-white/5 text-white mb-10">
            <h2 className="unbounded-bold text-3xl mb-8 text-[#FFD700] text-center">Face Scan Results</h2>
            <h3 className="unbounded-bold text-2xl mb-6 text-[#ffffff] text-center">Face Emotion Timeline (5s)</h3>
            {timeline.some(entry => entry.emotion === 'Deep model not available') && (
              <div className="mb-4 text-yellow-400 font-semibold text-base text-center">Advanced AI model is not available in this environment. Please use 'Fast & Simple (Rule-Based)' or install the deep model locally.</div>
            )}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 justify-center mb-8">
              {timeline.map((entry, i) => (
                <div
                  key={i}
                  className="p-3 rounded-2xl border border-white/10 bg-[#23272b] shadow text-center flex flex-col items-center min-w-[110px] max-w-[130px]"
                >
                  <p className="text-xs text-white/60 inter-regular mb-1">{entry.time}</p>
                  <p className="text-xl mt-1 mb-1 capitalize unbounded-medium" style={{ color: '#ffffff', wordBreak: 'break-word' }}>
                    {entry.emoji} {entry.emotion}
                  </p>
                  <p className="text-xs text-white/80 inter-regular">
                    Confidence: <span className="font-bold text-[#FFD700]">{entry.confidence}%</span>
                  </p>
                </div>
              ))}
            </div>
            <FaceEmotionChart timeline={timeline} />
            {/* Session summary and export will be added here */}
          </div>
        </div>
      )}
      {/* How to Use Section */}
      <div className="w-full rounded-2xl border border-white/20 shadow-xl p-8 min-h-[180px] flex flex-col justify-center items-center backdrop-blur-md bg-white/5 text-white mt-8 mb-10">
        <h2 className="unbounded-bold text-2xl mb-4 text-[#FFD700] text-center tracking-wider">How to Use Face Scan</h2>
        <ol className="list-decimal list-inside space-y-2 inter-regular text-white/90 text-base md:text-lg w-full text-center mx-auto max-w-lg">
          <li>Allow camera access when prompted.</li>
          <li>Position your face in the center of the frame.</li>
          <li>Choose the model and click Start Face Scan.</li>
          <li>Hold still and look at the camera for 5 seconds.</li>
          <li>Review your results and insights below.</li>
        </ol>
      </div>
    </div>
  );
};

export default FaceSentiment;
