import React, { useRef } from "react";
import { motion } from "framer-motion";

const BALL_COUNT = 80;

export default function OldBackground() {
  // Generate ball properties only once
  const ballsRef = useRef(null);
  if (!ballsRef.current) {
    ballsRef.current = Array.from({ length: BALL_COUNT }).map(() => {
      const left = Math.random() * 100;
      const top = Math.random() * 100;
      const size = 10 + Math.random() * 18;
      const blur = 2 + Math.random() * 7;
      const colors = ["#00FFD0", "#FFD700", "#FF6B6B", "#00BFFF", "#A259FF", "#fff"];
      const color = colors[Math.floor(Math.random() * colors.length)];
      const opacity = 0.07 + Math.random() * 0.06;
      // Animation deltas
      const deltaY = Math.random() * 60 - 30;
      const deltaX = Math.random() * 60 - 30;
      const duration = 10 + Math.random() * 8;
      return { left, top, size, blur, color, opacity, deltaY, deltaX, duration };
    });
  }
  const balls = ballsRef.current;

  return (
    <div className="fixed top-0 left-0 w-full h-full z-0 pointer-events-none">
      {balls.map((props, i) => (
        <motion.span
          key={"ball-" + i}
          className="absolute rounded-full"
          style={{
            left: `${props.left}%`,
            top: `${props.top}%`,
            width: `${props.size}px`,
            height: `${props.size}px`,
            background: props.color,
            opacity: props.opacity,
            filter: `blur(${props.blur}px) drop-shadow(0 0 12px ${props.color}99)`
          }}
          animate={{
            y: [0, props.deltaY, 0],
            x: [0, props.deltaX, 0],
          }}
          transition={{
            duration: props.duration,
            repeat: Infinity,
            repeatType: "reverse"
          }}
        />
      ))}
    </div>
  );
}
