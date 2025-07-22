import { motion } from "framer-motion";
import FaceSentiment from "../components/FaceSentiment";

export default function FaceScanner() {
  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center bg-transparent px-2">
      {/* Hero Section */}
      <section
        className="w-full flex flex-col items-center justify-center flex-1 overflow-y-auto"
        
      >
        <h1 className="unbounded-bold text-4xl md:text-5xl mb-4 tracking-widest text-[#FFD700] text-center drop-shadow-lg">
          Face Analyser
        </h1>
        <FaceSentiment />
      </section>
      {/* SoulSync AI Therapist Callout */}
      <div className="w-full max-w-2xl mx-auto mt-10 mb-8">
        <div className="rounded-2xl border-2 border-[#FFD700] bg-[#181A1B]/80 shadow-xl p-5 flex flex-col items-center text-center backdrop-blur-md">
          <span className="unbounded-bold text-lg md:text-xl text-[#FFD700] mb-2">Need someone to listen?</span>
          <span className="inter-regular text-base md:text-lg text-white/90 mb-3">Try <span className="text-[#FFD700] font-bold">SoulSync</span>, our AI therapist companion, for supportive and mindful conversation.</span>
          <a href="/soulsync" className="px-6 py-2 rounded-xl bg-[#FFD700] text-[#181A1B] unbounded-bold text-base shadow hover:bg-[#5fffe0] transition">Talk to SoulSync</a>
        </div>
      </div>
    </div>
  );
} 