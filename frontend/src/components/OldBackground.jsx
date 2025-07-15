import React from "react";
import { motion } from "framer-motion";

const BALL_COUNT = 80;

export default function OldBackground() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none">
      {[...Array(BALL_COUNT)].map((_, i) => {
        // Randomize initial position, size, color, and blur
        const left = Math.random() * 100;
        const top = Math.random() * 100;
        const size = 10 + Math.random() * 18;
        const blur = 2 + Math.random() * 7;
        // Neon color palette
        const colors = ["#00FFD0", "#FFD700", "#FF6B6B", "#00BFFF", "#A259FF", "#fff"];
        const color = colors[Math.floor(Math.random() * colors.length)];
        return (
          <motion.span
            key={"ball-" + i}
            className="absolute rounded-full"
            style={{
              left: `${left}%`,
              top: `${top}%`,
              width: `${size}px`,
              height: `${size}px`,
              background: color,
              opacity: 0.07 + Math.random() * 0.06, // reduced opacity
              filter: `blur(${blur}px) drop-shadow(0 0 12px ${color}99)`
            }}
            animate={{
              y: [0, Math.random() * 60 - 30, 0],
              x: [0, Math.random() * 60 - 30, 0],
            }}
            transition={{
              duration: 10 + Math.random() * 8,
              repeat: Infinity,
              repeatType: "reverse"
            }}
          />
        );
      })}
    </div>
  );
}
