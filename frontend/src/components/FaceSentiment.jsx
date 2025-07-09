import React, { useRef, useState } from "react";
import { FaceMesh } from "@mediapipe/face_mesh";
import { getEmoji, predictEmotion } from "../utils/emotionUtils";

const FaceSentiment = () => {
  const videoRef = useRef(null);
  const [expression, setExpression] = useState(null);
  const [scanning, setScanning] = useState(false);

  const stopVideo = () => {
    const stream = videoRef.current?.srcObject;
    stream?.getTracks().forEach((track) => track.stop());
    setScanning(false);
  };

  const handleAnalyzeFace = async () => {
    setScanning(true);
    setExpression(null);

    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    videoRef.current.srcObject = stream;

    const faceMesh = new FaceMesh({
      locateFile: (file) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
    });

    faceMesh.setOptions({
      maxNumFaces: 1,
      refineLandmarks: true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    let secondsPassed = 0;

    faceMesh.onResults((res) => {
      if (!res.multiFaceLandmarks || res.multiFaceLandmarks.length === 0) {
        setExpression({
          emotion: "No Face",
          emoji: getEmoji("no face"),
          confidence: "0",
        });
      } else {
        const landmarks = res.multiFaceLandmarks[0];
        const emotion = predictEmotion(landmarks);

        setExpression({
          emotion,
          emoji: getEmoji(emotion),
          confidence: "90", // heuristic, can be adjusted
        });
      }

      secondsPassed++;
      if (secondsPassed >= 10) {
        stopVideo();
        faceMesh.close();
      }
    });

    const camera = new window.Camera(videoRef.current, {
      onFrame: async () => {
        await faceMesh.send({ image: videoRef.current });
      },
      width: 320,
      height: 240,
    });

    camera.start();
  };

  return (
    <div className="mt-6 text-center">
      <button
        className="mb-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-60"
        onClick={handleAnalyzeFace}
        disabled={scanning}
      >
        {scanning ? "Scanning..." : "Analyze Face"}
      </button>

      <div className="flex justify-center">
        <video
          ref={videoRef}
          autoPlay
          muted
          width="320"
          height="240"
          className="rounded-md border"
        />
      </div>

      {expression && (
        <p className="mt-4 text-lg font-semibold">
          Detected Emotion: {expression.emoji} {expression.emotion} ({expression.confidence}%)
        </p>
      )}
    </div>
  );
};

export default FaceSentiment;
