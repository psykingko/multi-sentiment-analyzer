import InputBox from "../components/InputBox";
import { useState, useRef } from "react";
import axios from "axios";

import SentimentResult from "../components/SentimentResult";
import Summary from "../components/Summary";
import RecentAnalysis from "../components/RecentAnalysis";
import { useAuth } from "../contexts/AuthContext";
import { analysisHistory } from "../lib/supabase";
import { getBackendUrl } from '../utils/getBackendUrl';
import { PDFDownloadLink } from '@react-pdf/renderer';
import TextAnalysisPDF from '../components/TextAnalysisPDF';

const instructions = [
  "Select the analysis model (Rule-Based or Deep Learning).",
  "Type or speak your text using the input box and mic icon.",
  "Click 'Analyze' to process your text.",
  "View the sentiment and emotion results below."
];

export default function Analyzer() {
  const { user } = useAuth();
  const [hasResults, setHasResults] = useState(false);
  const [model, setModel] = useState("rule");
  const [result, setResult] = useState(null);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [glow, setGlow] = useState(false);
  const [currentText, setCurrentText] = useState("");
  const [refreshKey, setRefreshKey] = useState(0); // Add this line
  const resultsRef = useRef(null); // NEW

  const BACKEND_URL = getBackendUrl();

  async function handleAnalyze(text, selectedModel) {
    setLoading(true);
    setCurrentText(text);
    try {
      const response = await axios.post(
        `${BACKEND_URL}/analyze?model=${selectedModel}`,
        { paragraph: text }
      );
      setResult(response.data.results);
      setSummary(response.data.paragraph_sentiment);
      setHasResults(true);
      setGlow(true);
      setTimeout(() => setGlow(false), 2500);
      setTimeout(() => {
        if (resultsRef.current) {
          resultsRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 100);

      // Save analysis to database if user is authenticated
      if (user) {
        try {
          await analysisHistory.saveAnalysis(user.id, {
            text: text,
            model: selectedModel,
            results: response.data.results,
            summary: response.data.paragraph_sentiment,
          });
          setRefreshKey(prev => prev + 1); // Increment refreshKey after saving
        } catch (error) {
          console.error('Failed to save analysis:', error);
        }
      }
    } catch (error) {
      alert("Analysis failed. Please try again.");
      setHasResults(false);
    } finally {
      setLoading(false);
    }
  }

  const handleSelectAnalysis = (analysis) => {
    setResult(analysis.results);
    setSummary(analysis.summary);
    setCurrentText(analysis.text);
    setModel(analysis.model);
    setHasResults(true);
    setTimeout(() => {
      if (resultsRef.current) {
        resultsRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 100); // Wait for render
  };

  return (
    <div className="flex flex-col items-center w-full min-h-screen bg-transparent px-2">
      <h1 className="unbounded-bold text-4xl md:text-5xl mb-8 mt-2 tracking-widest text-[#FFD700] text-center drop-shadow-lg">Text Analyzer</h1>
      
      <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Analysis Section - centered with even spacing */}
        <div className="w-full max-w-4xl mx-auto flex flex-col items-center lg:col-span-2">
          {/* Hero Input Section */}
          <section className="w-full">
            <InputBox model={model} setModel={setModel} onAnalyze={handleAnalyze} loading={loading} />
            {/* Sentiment Results directly below input if present */}
            <section className="w-full mt-8 mb-10" ref={resultsRef}>
              {hasResults && (
                <div className={`rounded-2xl border border-white/20 shadow-xl p-8 backdrop-blur-md bg-white/5 text-white transition-all duration-700 ${glow ? 'ring-4 ring-[#FFD700] ring-opacity-60 shadow-yellow-400/40' : ''}`}>
                  <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                    <h2 className="unbounded-bold text-2xl text-[#FFD700]">Sentiment Results</h2>
                    {hasResults && (
                      <PDFDownloadLink
                        document={<TextAnalysisPDF analysis={result} summary={summary} userText={currentText} user={user} />}
                        fileName="text-analysis-result.pdf"
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#FFD700] text-[#181A1B] unbounded-bold text-base shadow hover:bg-[#5fffe0] transition"
                      >
                        <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#181A1B" strokeWidth="2" className="inline-block"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v12m0 0l-4-4m4 4l4-4M4 20h16"/></svg>
                        Download PDF
                      </PDFDownloadLink>
                    )}
                  </div>
                  <SentimentResult data={result} />
                  {summary && (
                    <>
                      <div className="mt-10">
                        <h2 className="unbounded-bold text-2xl mb-6 text-[#FFD700] text-left">Paragraph Mental State & Distribution</h2>
                        <Summary summary={summary} section="distribution" />
                      </div>
                      <div className="mt-10">
                        <h2 className="unbounded-bold text-2xl mb-6 text-[#FFD700] text-left">Paragraph Summary</h2>
                        <Summary summary={summary} section="summary" />
                      </div>
                    </>
                  )}
                </div>
              )}
            </section>
          </section>

          {/* Divider */}
          <hr className="w-full my-10 border-0 h-1 bg-gradient-to-r from-transparent via-[#FFD700] to-transparent shadow-[0_0_8px_2px_#FFD70044] rounded-full" />

          {/* How to Use Section */}
          <section className="w-full mb-10">
            <div className="rounded-2xl border border-white/20 shadow-xl p-8 min-h-[260px] flex flex-col justify-center  backdrop-blur-md bg-white/5 text-white">
              <h2 className="unbounded-bold text-2xl mb-4 text-[#FFD700] tracking-wider">How to Use</h2>
              <ol className="list-decimal list-inside space-y-2 inter-regular text-white/90 text-base md:text-lg w-full  mx-auto">
                <li>Select the analysis model (Rule-Based or Deep Learning).</li>
                <li>Type or speak your text using the input box and mic icon.</li>
                <li>Click 'Analyze' to process your text.</li>
                <li>View the sentiment and emotion results below.</li>
              </ol>
            </div>
          </section>

          {/* Divider */}
          <hr className="w-full my-10 border-0 h-1 bg-gradient-to-r from-transparent via-[#FFD700] to-transparent shadow-[0_0_8px_2px_#FFD70044] rounded-full" />

          {/* Model Options Section */}
          <section className="w-full mb-10">
            <div className="rounded-2xl border border-white/20 shadow-xl p-8 flex flex-col items-center backdrop-blur-md bg-white/5 text-white">
              <h2 className="unbounded-bold text-2xl mb-4 text-[#FFD700]">Model Options</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-x-8 w-full items-stretch">
                {/* Fast & Simple Card */}
                <div className="rounded-2xl border border-white/20 shadow-xl   flex flex-col items-center text-center px-6 py-8 h-full">
                  
                  <h4 className="unbounded-bold text-lg mb-2 text-white">Fast & Simple (Recommended)</h4>
                  <p className="inter-regular text-base text-white/80">Uses VADER and TextBlob for quick, reliable sentiment analysis. Great for most users and works instantly online.</p>
                </div>
                {/* Advanced AI Card */}
                <div className="rounded-2xl border border-white/20 shadow-xl flex flex-col items-center text-center px-6 py-8 h-full">
                  
                  <h4 className="unbounded-bold text-lg mb-2 text-white">Advanced AI</h4>
                  <p className="inter-regular text-base text-white/80">Uses DistilBERT for deep learning-based sentiment and emotion analysis. More accurate for nuanced text, but may be slower to start.</p>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Recent Analysis Sidebar (sticky, right side) */}
        <div className="lg:col-span-1">
          <div className="sticky top-24">
            <RecentAnalysis onSelectAnalysis={handleSelectAnalysis} refreshKey={refreshKey} />
          </div>
        </div>
      </div>
    </div>
  );
} 