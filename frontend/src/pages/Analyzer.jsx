import InputBox from "../components/InputBox";
import { useState } from "react";
import axios from "axios";
import Tooltip from '../components/Tooltip';
import PeekingRobo from "../components/PeekingRobo";
import SentimentResult from "../components/SentimentResult";
import Summary from "../components/Summary";
import RecentAnalysis from "../components/RecentAnalysis";
import { useAuth } from "../contexts/AuthContext";
import { analysisHistory } from "../lib/supabase";

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

  async function handleAnalyze(text, selectedModel) {
    setLoading(true);
    setCurrentText(text);
    try {
      const response = await axios.post(
        `http://127.0.0.1:8000/analyze?model=${selectedModel}`,
        { paragraph: text }
      );
      setResult(response.data.results);
      setSummary(response.data.paragraph_sentiment);
      setHasResults(true);
      setGlow(true);
      setTimeout(() => setGlow(false), 2500);

      // Save analysis to database if user is authenticated
      if (user) {
        try {
          await analysisHistory.saveAnalysis(user.id, {
            text: text,
            model: selectedModel,
            results: response.data.results,
            summary: response.data.paragraph_sentiment,
          });
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
  };

  return (
    <div className="flex flex-col items-center w-full min-h-screen bg-transparent px-2">
      <h1 className="unbounded-bold text-4xl md:text-5xl mb-4 mt-8 tracking-widest text-white text-center drop-shadow-lg">Text Analyzer</h1>
      
      <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Analysis Section - centered with even spacing */}
        <div className="w-full max-w-4xl mx-auto flex flex-col items-center lg:col-span-2">
          {/* Hero Input Section */}
          <section className="w-full">
            <InputBox model={model} setModel={setModel} onAnalyze={handleAnalyze} loading={loading} />
            {/* Sentiment Results directly below input if present */}
            <section className="w-full mt-8 mb-10">
              {hasResults && (
                <div className={`rounded-2xl border border-white/20 shadow-xl p-8 backdrop-blur-md bg-white/5 text-white transition-all duration-700 ${glow ? 'ring-4 ring-[#FFD700] ring-opacity-60 shadow-yellow-400/40' : ''}`}>
                  <h2 className="unbounded-bold text-2xl mb-4 text-[#FFD700]">Sentiment Results</h2>
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
            <div className="rounded-2xl border border-white/20 shadow-xl p-8 min-h-[260px] flex flex-col justify-center items-center backdrop-blur-md bg-white/5 text-white">
              <h2 className="unbounded-bold text-2xl mb-4 text-[#FFD700] text-center tracking-wider">How to Use</h2>
              <ol className="list-decimal list-inside space-y-2 inter-regular text-white/90 text-base md:text-lg w-full text-center mx-auto">
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
            <div className="rounded-2xl border border-white/20 shadow-xl p-8 min-h-[260px] flex flex-col justify-center items-center backdrop-blur-md bg-white/5 text-white">
              <h2 className="unbounded-bold text-2xl mb-4 text-[#FFD700]">Model Options</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-x-8 w-full items-stretch">
                <div className="rounded-2xl border border-white/20 shadow-xl p-6 flex flex-col items-center text-center backdrop-blur-md bg-white/5 w-full h-full flex-1 justify-center">
                  <h4 className="unbounded-bold text-lg mb-2 text-[#FFD700]">Fast & Simple (Recommended)</h4>
                  <p className="inter-regular text-base text-white/80">Uses VADER and TextBlob for quick, reliable sentiment analysis. Great for most users and works instantly online.</p>
                </div>
                <div className="rounded-2xl border border-white/20 shadow-xl p-6 flex flex-col items-center text-center backdrop-blur-md bg-white/5 w-full h-full flex-1 justify-center">
                  <h4 className="unbounded-bold text-lg mb-2 text-[#FFD700]">Advanced AI (Local Only)</h4>
                  <p className="inter-regular text-base text-white/80">Uses advanced AI models (BERT) for deeper emotion detection. Requires more resources and only works on your own device.</p>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Recent Analysis Sidebar (sticky, right side) */}
        <div className="lg:col-span-1">
          <div className="sticky top-24">
            <RecentAnalysis onSelectAnalysis={handleSelectAnalysis} />
          </div>
        </div>
      </div>
    </div>
  );
} 