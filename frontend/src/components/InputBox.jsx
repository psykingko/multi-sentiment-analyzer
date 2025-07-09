// InputBox.jsx
import { useState, useRef } from "react";
import { Mic, Camera } from "lucide-react";
import { FaceMesh } from "@mediapipe/face_mesh";
import { Camera as MediaPipeCamera } from "@mediapipe/camera_utils";
import { getEmoji, predictEmotion } from "../utils/emotionUtil";

const InputBox = ({ onAnalyze, loading }) => {
  const [text, setText] = useState("");
  const [listening, setListening] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [faceResult, setFaceResult] = useState([]);

  const recognitionRef = useRef(null);
  const videoRef = useRef(null);
  const cameraRef = useRef(null);
  const faceMeshRef = useRef(null);

  const startListening = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech Recognition not supported.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.continuous = true;
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    let lastResultIndex = -1;
    recognition.start();
    setListening(true);

    recognition.onresult = (event) => {
      const currentIndex = event.resultIndex;
      if (currentIndex === lastResultIndex) return;
      lastResultIndex = currentIndex;

      const transcript = event.results[currentIndex][0].transcript
        .toLowerCase()
        .trim()
        .replace(/\b(full stop|period)\b/g, ".")
        .replace(/\bcomma\b/g, ",")
        .replace(/\bquestion mark\b/g, "?")
        .replace(/\bexclamation mark\b/g, "!")
        .replace(/\s+/g, " ");

      setText((prev) => prev.trim() + " " + transcript);
    };

    recognition.onerror = () => stopListening();
    recognition.onend = () => {
      if (listening) recognition.start();
    };
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    setListening(false);
    setText((prev) => prev.trim().replace(/\s+/g, " "));
  };

  const stopCamera = () => {
    const stream = videoRef.current?.srcObject;
    stream?.getTracks().forEach((track) => track.stop());
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    cameraRef.current?.stop();
    cameraRef.current = null;
    faceMeshRef.current?.close();
    faceMeshRef.current = null;
    setShowCamera(false);
    setScanning(false);
  };

  const handleCameraClick = async () => {
    try {
      setShowCamera(true);
      setFaceResult([]);
      setScanning(false);

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: 640, height: 480 },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await new Promise((resolve) => {
          videoRef.current.onloadedmetadata = resolve;
        });
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
      alert("Could not access camera. Please check permissions.");
      setShowCamera(false);
    }
  };

  const startFaceScan = async () => {
    if (!videoRef.current) return;

    setScanning(true);
    setFaceResult([]);

    try {
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

      faceMeshRef.current = faceMesh;

      const camera = new MediaPipeCamera(videoRef.current, {
        onFrame: async () => {
          await faceMesh.send({ image: videoRef.current });
        },
        width: 640,
        height: 480,
      });

      cameraRef.current = camera;

      const results = [];
      let currentLandmarks = null;

      faceMesh.onResults((res) => {
        if (res.multiFaceLandmarks && res.multiFaceLandmarks.length > 0) {
          currentLandmarks = res.multiFaceLandmarks[0];
        } else {
          currentLandmarks = null;
        }
      });

      // Start the camera
      camera.start();

      // Collect results over 5 seconds
      for (let second = 1; second <= 5; second++) {
        const time = `${second}s`;

        // Wait for 1 second
        await new Promise((resolve) => setTimeout(resolve, 1000));

        if (!currentLandmarks) {
          results.push({
            time,
            emotion: "No Face",
            emoji: getEmoji("no face"),
            confidence: "0",
          });
        } else {
          const { emotion, confidence } = predictEmotion(currentLandmarks);
          console.log(
            `🧠 Frame ${second}s → Emotion: ${emotion}, Confidence: ${confidence}`
          );

          results.push({
            time,
            emotion,
            emoji: getEmoji(emotion),
            confidence: Math.round(confidence),
          });
        }
      }

      setFaceResult(results);
      stopCamera();
    } catch (error) {
      console.error("Error during face scanning:", error);
      alert("Error during face scanning. Please try again.");
      stopCamera();
    }
  };

  const handleClick = () => {
    if (listening) stopListening();
    if (text.trim()) onAnalyze(text);
  };

  return (
    <>
      <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md mb-6 relative min-h-[280px]">
        {!showCamera ? (
          <>
            <textarea
              className="w-full h-40 p-4 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm resize-none text-black dark:text-white dark:bg-gray-900"
              placeholder="Type or speak a paragraph..."
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            <div
              className={`absolute bottom-6 right-6 w-10 h-10 z-30 cursor-pointer flex items-center justify-center rounded-full shadow-lg transition duration-300 ${
                listening ? "bg-indigo-600 animate-bounce" : "bg-[#115ba6]"
              }`}
              onClick={listening ? stopListening : startListening}
              title={listening ? "Stop Listening" : "Start Listening"}
            >
              <Mic className="text-white w-6 h-6" />
            </div>
            <div
              className="absolute bottom-6 right-20 w-10 h-10 bg-green-600 hover:bg-green-700 text-white rounded-full z-30 flex items-center justify-center cursor-pointer shadow-lg transition"
              onClick={handleCameraClick}
              title="Open Camera"
            >
              <Camera className="w-6 h-6" />
            </div>
            <button
              onClick={handleClick}
              disabled={loading}
              className="mt-4 px-6 py-2 bg-[#115ba6] text-white rounded hover:bg-[#0f4c81] flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4a4 4 0 100 8h4a8 8 0 01-8 8z"
                    />
                  </svg>
                  Analyzing...
                </>
              ) : (
                "Analyze"
              )}
            </button>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center">
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              width="320"
              height="240"
              className="rounded-md border"
            />
            {!scanning ? (
              <div className="mt-4 flex gap-2">
                <button
                  onClick={startFaceScan}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Start Face Scan (5s)
                </button>
                <button
                  onClick={stopCamera}
                  className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                >
                  Close Camera
                </button>
              </div>
            ) : (
              <p className="mt-4 text-sm text-gray-500">
                Scanning your expression...
              </p>
            )}
          </div>
        )}
      </div>

      {faceResult.length > 0 && (
        <div className="mb-10">
          <h3 className="text-lg font-semibold mb-4 text-center">
            Face Emotion Timeline (5s)
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 justify-center">
            {faceResult.map((entry, i) => (
              <div
                key={i}
                className="p-4 rounded-lg shadow bg-white dark:bg-gray-800 text-center border dark:border-gray-600"
              >
                <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">
                  {entry.time}
                </p>
                <p className="text-xl mt-2 capitalize">
                  {entry.emoji} {entry.emotion}
                </p>
                {/* <p className="text-sm text-gray-600 dark:text-gray-300">
                  Confidence: {entry.confidence}%
                </p> */}
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
};

export default InputBox;
