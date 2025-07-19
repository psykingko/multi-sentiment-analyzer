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
          Face Scan
        </h1>
        <FaceSentiment />
      </section>
    </div>
  );
} 