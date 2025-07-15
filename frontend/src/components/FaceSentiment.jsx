import React, { useRef, useState } from "react";
import { FaceMesh } from "@mediapipe/face_mesh";
import { Camera } from "@mediapipe/camera_utils";
import { getEmoji, predictEmotion } from "../utils/emotionUtil";

const FaceSentiment = () => {
  const videoRef = useRef(null);
  const [timeline, setTimeline] = useState([]); // [{time, emotion, emoji, confidence}]
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState("");

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
        if (!currentLandmarks) {
          emotion = "No Face";
          confidence = 0;
        } else {
          const pred = predictEmotion(currentLandmarks);
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
          confidence: Math.round(confidence * 100),
        });
        setTimeline([...results]);
      }

      // Stop everything after 5 seconds
      camera.stop();
      faceMesh.close();
      stopVideo();
      setScanning(false);
    } catch (err) {
      setError("Could not access camera. Please check permissions.");
      stopVideo();
      setScanning(false);
    }
  };

  return (
    <div className="mt-6 text-center">
      <button
        className="mb-4 px-4 py-2 bg-[#00FFCC] text-[#181A1B] rounded font-orbitron font-bold hover:bg-[#00e6b8] disabled:opacity-60 transition"
        onClick={handleAnalyzeFace}
        disabled={scanning}
      >
        {scanning ? "Scanning..." : "Start Face Scan (5s)"}
      </button>
      {error && <div className="text-red-500 mb-2">{error}</div>}
      <div className="flex justify-center mb-4">
        <video
          ref={videoRef}
          autoPlay
          muted
          width="320"
          height="240"
          className="rounded-md border border-[#2e3236] bg-[#181A1B]"
        />
      </div>
      {timeline.length > 0 && (
        <div className="mb-10">
          <h3 className="font-orbitron text-lg font-bold mb-4 text-center text-white">Face Emotion Timeline (5s)</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 justify-center">
            {timeline.map((entry, i) => (
              <div
                key={i}
                className="p-4 rounded-2xl shadow bg-[#23272b] text-center border border-[#2e3236]"
              >
                <p className="text-sm font-semibold text-white/60 font-orbitron">{entry.time}</p>
                <p className="text-xl mt-2 capitalize text-white font-orbitron">
                  {entry.emoji} {entry.emotion}
                </p>
                <p className="text-sm text-white/80 font-roboto">
                  Confidence: {entry.confidence}%
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FaceSentiment;
