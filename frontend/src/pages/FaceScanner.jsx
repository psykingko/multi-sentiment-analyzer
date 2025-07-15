import { lazy, Suspense } from "react";
import { motion } from "framer-motion";

const FaceSentiment = lazy(() => import("../components/FaceSentiment"));

export default function FaceScanner() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] bg-transparent">
      <motion.div
        className="w-full max-w-2xl rounded-2xl border border-white/20 shadow-xl p-8 mt-8 mb-12 backdrop-blur-md bg-white/5"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, type: 'spring' }}
      >
        <h1 className="unbounded-black text-4xl md:text-6xl mb-6 tracking-widest text-white text-center">Face Scan</h1>
        <p className="inter-regular text-lg text-white/90 mb-6 text-center">Scan your face in real-time to detect emotions using your webcam.</p>
        <Suspense fallback={<div className="text-center p-4">Loading face sentiment...</div>}>
          <FaceSentiment />
        </Suspense>
      </motion.div>
    </div>
  );
} 