// emotionUtil.js
export const getEmoji = (emotion) => {
  const map = {
    happy: "😄",
    sad: "😢",
    angry: "😠",
    disgusted: "🤢",
    surprised: "😲",
    fearful: "😨",
    contempt: "😤",
    neutral: "😐",
    "no face": "❌",
    unknown: "🤖",
  };
  return map[emotion?.toLowerCase()] || "🤖";
};

export function predictEmotion(landmarks) {
  // Validate input
  if (!landmarks || landmarks.length < 468) {
    return { emotion: "no face", confidence: 0 };
  }

  try {
    // Key facial landmarks (MediaPipe Face Mesh indices)
    const leftMouth = landmarks[61]; // Left mouth corner
    const rightMouth = landmarks[291]; // Right mouth corner
    const topLip = landmarks[13]; // Top lip center
    const bottomLip = landmarks[14]; // Bottom lip center
    const upperLipCenter = landmarks[12];
    const lowerLipCenter = landmarks[15];

    // Eyes - using correct MediaPipe indices
    const leftEyeTop = landmarks[159]; // Left eye top
    const leftEyeBottom = landmarks[145]; // Left eye bottom
    const rightEyeTop = landmarks[386]; // Right eye top
    const rightEyeBottom = landmarks[374]; // Right eye bottom
    const leftEyeInner = landmarks[133]; // Left eye inner corner
    const leftEyeOuter = landmarks[33]; // Left eye outer corner
    const rightEyeInner = landmarks[362]; // Right eye inner corner
    const rightEyeOuter = landmarks[263]; // Right eye outer corner

    // Eyebrows
    const leftBrowInner = landmarks[70]; // Left eyebrow inner
    const leftBrowOuter = landmarks[46]; // Left eyebrow outer
    const rightBrowInner = landmarks[107]; // Right eyebrow inner
    const rightBrowOuter = landmarks[276]; // Right eyebrow outer
    const browCenter = landmarks[9]; // Forehead center

    // Nose and cheeks
    const noseTip = landmarks[1]; // Nose tip
    const noseBase = landmarks[2]; // Nose base
    const leftCheek = landmarks[234]; // Left cheek
    const rightCheek = landmarks[454]; // Right cheek
    const leftNostril = landmarks[20]; // Left nostril
    const rightNostril = landmarks[250]; // Right nostril

    // Jaw
    const chin = landmarks[18]; // Chin
    const leftJaw = landmarks[172]; // Left jaw
    const rightJaw = landmarks[397]; // Right jaw

    // Normalization - face dimensions
    const faceWidth = getDistance(leftCheek, rightCheek);
    const faceHeight = getDistance(browCenter, chin);

    if (faceWidth === 0 || faceHeight === 0) {
      return { emotion: "no face", confidence: 0 };
    }

    // === FEATURE EXTRACTION ===

    // Mouth features
    const mouthWidth = getDistance(leftMouth, rightMouth) / faceWidth;
    const mouthHeight = getDistance(topLip, bottomLip) / faceHeight;
    const mouthOpenness = mouthHeight / mouthWidth;

    // Smile detection - check mouth curvature
    const leftMouthY = leftMouth.y;
    const rightMouthY = rightMouth.y;
    const centerMouthY = (upperLipCenter.y + lowerLipCenter.y) / 2;
    const mouthCurvature =
      ((leftMouthY + rightMouthY) / 2 - centerMouthY) / faceHeight;

    // Eye features
    const leftEyeHeight = getDistance(leftEyeTop, leftEyeBottom) / faceHeight;
    const rightEyeHeight =
      getDistance(rightEyeTop, rightEyeBottom) / faceHeight;
    const eyeOpenness = (leftEyeHeight + rightEyeHeight) / 2;

    const leftEyeWidth = getDistance(leftEyeInner, leftEyeOuter) / faceWidth;
    const rightEyeWidth = getDistance(rightEyeInner, rightEyeOuter) / faceWidth;
    const eyeWidthAvg = (leftEyeWidth + rightEyeWidth) / 2;

    // Eyebrow features
    const leftBrowHeight = getDistance(leftBrowInner, leftEyeTop) / faceHeight;
    const rightBrowHeight =
      getDistance(rightBrowInner, rightEyeTop) / faceHeight;
    const browRaise = (leftBrowHeight + rightBrowHeight) / 2;

    // Eyebrow angle (for anger detection)
    const leftBrowAngle = Math.atan2(
      leftBrowOuter.y - leftBrowInner.y,
      leftBrowOuter.x - leftBrowInner.x
    );
    const rightBrowAngle = Math.atan2(
      rightBrowInner.y - rightBrowOuter.y,
      rightBrowInner.x - rightBrowOuter.x
    );
    const browAngle = Math.abs(leftBrowAngle + rightBrowAngle) / 2;

    // Nose features (for disgust)
    const nostrilFlare = getDistance(leftNostril, rightNostril) / faceWidth;
    const noseWrinkle = getDistance(noseTip, noseBase) / faceHeight;

    // Cheek features
    const leftCheekRaise = getDistance(leftCheek, leftEyeBottom) / faceHeight;
    const rightCheekRaise =
      getDistance(rightCheek, rightEyeBottom) / faceHeight;
    const cheekRaise = (leftCheekRaise + rightCheekRaise) / 2;

    // === EMOTION CLASSIFICATION ===

    const emotions = [];

    // HAPPY - smile with raised cheeks

    // HAPPY - smile, raised cheeks, eye crinkles
    if (mouthCurvature < -0.02 && mouthWidth > 0.25) {
      const confidence = Math.min(
        95,
        60 + Math.abs(mouthCurvature) * 1000 + mouthWidth * 200
      );
      emotions.push({ emotion: "happy", confidence });
      console.log("✅ Detected: HAPPY with confidence", confidence.toFixed(2));
    } else {
      console.log("❌ Not classified as happy.");
    }

    // SURPRISED - raised eyebrows, wide eyes, open mouth

    if (
      browRaise > 0.025 &&
      eyeOpenness > 0.055 &&
      mouthHeight < 0.006 &&
      browAngle < 1.2 // changed from 0.3 to 1.2 — allow surprised brow angles
    ) {
      const confidence = Math.min(
        85,
        55 + browRaise * 1500 + eyeOpenness * 1200
      );
      emotions.push({ emotion: "surprised", confidence });
      console.log(
        "✅ Detected: SURPRISED (no mouth) with confidence",
        confidence.toFixed(2)
      );
    } else if (
      browRaise > 0.02 &&
      eyeOpenness > 0.045 &&
      (mouthHeight > 0.004 || mouthCurvature < -0.01) &&
      browAngle < 1.2 // again: loosened
    ) {
      const confidence = Math.min(
        92,
        60 + browRaise * 1000 + eyeOpenness * 1000 + mouthHeight * 1000
      );
      emotions.push({ emotion: "surprised", confidence });
      console.log(
        "✅ Detected: SURPRISED (with mouth) with confidence",
        confidence.toFixed(2)
      );
    } else {
      console.log("❌ Not classified as surprised.");
      console.log(
        `   Reasons: browRaise=${browRaise.toFixed(
          3
        )} (need >0.025), eyeOpenness=${eyeOpenness.toFixed(
          3
        )} (need >0.055), browAngle=${browAngle.toFixed(3)} (was restricted)`
      );
    }
    // Additional logic: High browRaise + high browAngle → likely SURPRISE (even if failed above)
    if (browAngle > 1 && browRaise > 0.28) {
      const confidence = 88;
      emotions.push({ emotion: "surprised", confidence });
      console.log(
        "✅ Detected: SURPRISED (fallback - raised brows + wide angle) with confidence",
        confidence
      );
    }

    // ANGRY - furrowed brows, narrowed eyes, pressed lips

    // Adjusted thresholds
    // Improved anger detection logic
    // Key anger indicators:
    // - Eyebrows pulled down and together (lower brow position, higher inner brow angle)
    // - Eyes narrowed/squinted (reduced eye openness)
    // - Mouth can be tight or slightly open
    // - Overall tense facial expression

    if (
      // Strong brow furrowing/angling (key anger indicator)
      browAngle > 0.5 &&
      // Eyes narrowed/sharp (reduced openness)
      eyeOpenness < 0.15 &&
      // Eyebrows engaged (can be raised when furrowed intensely)
      browRaise > 0.1
    ) {
      // Calculate confidence based on multiple factors
      let confidence = 40; // Base confidence

      // Add confidence for strong brow indicators
      confidence += Math.min(30, browAngle * 300); // Brow angle contribution

      // Add confidence for eyebrow position
      if (browRaise < 0) {
        confidence += Math.min(20, Math.abs(browRaise) * 200);
      } else if (browRaise < 0.01) {
        confidence += 15;
      }

      // Add confidence for narrow eyes
      if (eyeOpenness < 0.08) {
        confidence += 20;
      } else if (eyeOpenness < 0.12) {
        confidence += 10;
      }

      // Bonus for very angry expressions
      if (browAngle > 0.12 && eyeOpenness < 0.06) {
        confidence += 15;
      }

      confidence = Math.min(95, Math.max(50, confidence));

      emotions.push({ emotion: "angry", confidence });
      console.log(
        `✅ Detected: ANGRY with confidence ${confidence.toFixed(2)}`
      );
      console.log(
        `   - browAngle: ${browAngle.toFixed(
          3
        )}, browRaise: ${browRaise.toFixed(3)}`
      );
      console.log(
        `   - eyeOpenness: ${eyeOpenness.toFixed(
          3
        )}, mouthHeight: ${mouthHeight.toFixed(3)}`
      );
    } else {
      console.log("❌ Not classified as angry.");
      console.log(
        `   Debug values - browAngle: ${browAngle.toFixed(
          3
        )}, browRaise: ${browRaise.toFixed(
          3
        )}, eyeOpenness: ${eyeOpenness.toFixed(3)}`
      );
    }

    // SAD - drooping mouth, droopy eyes, lowered brows
    console.log("=== sad Detection Debug ===");
    console.log("Mouth Curvature:", mouthCurvature.toFixed(5));
    console.log("Eye Openness:", eyeOpenness.toFixed(5));
    console.log("Cheek Raise (optional):", cheekRaise.toFixed(5)); // no longer required

    if (
      mouthCurvature > 0.01 && // your logs: 0.02–0.03 ✅
      eyeOpenness >= 0.065 &&
      eyeOpenness <= 0.085 // your logs: ~0.075 ✅
    ) {
      const confidence = Math.min(84, 55 + mouthCurvature * 4000);
      emotions.push({ emotion: "sad", confidence });
      console.log("✅ Detected: SAD with confidence", confidence.toFixed(2));
    } else {
      console.log("❌ Not classified as sad.");
    }

    // FEARFUL - raised eyebrows, wide eyes, tense mouth
    if (
      browRaise > 0.018 &&
      eyeOpenness > 0.013 &&
      mouthWidth < 0.032 &&
      mouthHeight < 0.005
    ) {
      const confidence = Math.min(
        78,
        40 + browRaise * 1000 + eyeOpenness * 1000
      );
      emotions.push({ emotion: "fearful", confidence });
    }

    // DISGUSTED - wrinkled nose, raised upper lip, narrowed eyes
    if (
      nostrilFlare > 0.022 &&
      eyeOpenness < 0.011 &&
      mouthCurvature > 0.0005
    ) {
      const confidence = Math.min(
        75,
        40 + nostrilFlare * 600 + noseWrinkle * 800
      );
      emotions.push({ emotion: "disgusted", confidence });
    }

    // CONTEMPT - one-sided mouth raise (asymmetrical)
    const mouthAsymmetry = Math.abs(leftMouthY - rightMouthY) / faceHeight;
    if (mouthAsymmetry > 0.002 && mouthWidth > 0.025 && eyeOpenness < 0.013) {
      const confidence = Math.min(72, 35 + mouthAsymmetry * 8000);
      emotions.push({ emotion: "contempt", confidence });
    }

    // NEUTRAL - balanced features
    if (emotions.length === 0 || emotions.every((e) => e.confidence < 40)) {
      console.log("😐 No strong emotion detected. Defaulting to NEUTRAL.");
      console.log("Emotions captured (if any):", emotions);
      emotions.push({ emotion: "neutral", confidence: 75 });
    }

    // Return highest confidence emotion
    // Return emotion using priority if multiple are detected
    if (emotions.length > 0) {
      const priority = [
        "sad",
        "happy",
        "angry",
        "surprised",
        "fearful",
        "disgusted",
        "contempt",
        "neutral",
      ];

      // Filter emotions with confidence ≥ 60
      const filtered = emotions.filter((e) => e.confidence >= 60);

      if (filtered.length > 0) {
        const sorted = filtered.sort((a, b) => {
          const priorityA = priority.indexOf(a.emotion);
          const priorityB = priority.indexOf(b.emotion);
          return priorityA - priorityB || b.confidence - a.confidence;
        });

        return sorted[0];
      }

      // Fallback to max confidence if none above threshold
      const top = emotions.reduce((prev, curr) =>
        curr.confidence > prev.confidence ? curr : prev
      );
      return top;
    } else {
      return { emotion: "neutral", confidence: 75 };
    }
  } catch (error) {
    console.error("Error in emotion prediction:", error);
    return { emotion: "unknown", confidence: 0 };
  }
}

// Enhanced distance calculation with validation
function getDistance(p1, p2) {
  if (
    !p1 ||
    !p2 ||
    typeof p1.x !== "number" ||
    typeof p1.y !== "number" ||
    typeof p2.x !== "number" ||
    typeof p2.y !== "number"
  ) {
    return 0;
  }

  const dx = p1.x - p2.x;
  const dy = p1.y - p2.y;
  return Math.sqrt(dx * dx + dy * dy);
}

// Optional: Get detailed emotion analysis
export function getDetailedEmotionAnalysis(landmarks) {
  const result = predictEmotion(landmarks);

  if (result.emotion === "no face" || result.emotion === "unknown") {
    return result;
  }

  // Add some additional context
  const details = {
    ...result,
    emoji: getEmoji(result.emotion),
    description: getEmotionDescription(result.emotion),
    intensity: getIntensity(result.confidence),
  };

  return details;
}

function getEmotionDescription(emotion) {
  const descriptions = {
    happy: "Showing joy and positive feelings",
    sad: "Expressing sorrow or disappointment",
    angry: "Displaying anger or frustration",
    surprised: "Reacting with surprise or shock",
    fearful: "Showing fear or anxiety",
    disgusted: "Expressing disgust or distaste",
    contempt: "Showing contempt or disdain",
    neutral: "Calm and composed expression",
  };
  return descriptions[emotion] || "Unknown emotional state";
}

function getIntensity(confidence) {
  if (confidence >= 80) return "High";
  if (confidence >= 60) return "Medium";
  if (confidence >= 40) return "Low";
  return "Very Low";
}
