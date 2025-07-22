import InputBox from "../components/InputBox";

import axios from "axios";

import SentimentResult from "../components/SentimentResult";
import Summary from "../components/Summary";
import RecentAnalysis from "../components/RecentAnalysis";
import { useAuth } from "../contexts/AuthContext";
import { analysisHistory } from "../lib/supabase";
import { getBackendUrl } from '../utils/getBackendUrl';
import { PDFDownloadLink } from '@react-pdf/renderer';
import TextAnalysisPDF from '../components/TextAnalysisPDF';
import React, { useState, useRef, useCallback, useMemo, useEffect } from "react";

// ErrorBoundary for PDFDownloadLink
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }
  componentDidCatch(error, errorInfo) {
    // Optionally log error
  }
  render() {
    if (this.state.hasError) {
      return <div className="text-red-500">Something went wrong with PDF download.</div>;
    }
    return this.props.children;
  }
}

const SentimentResultsSection = React.memo(function SentimentResultsSection({
  hasResults, glow, result, summary, currentText, user, PDFDownloadLink, TextAnalysisPDF, model
}) {
  // Defensive: Only render PDFDownloadLink if all required data is valid
  const canDownloadPDF = hasResults && Array.isArray(result) && result.length > 0 && summary && typeof currentText === 'string' && currentText.length > 0;
  return (
    <section className="w-full mt-8 mb-10">
      {hasResults && (
        <div className={`rounded-2xl border border-white/20 shadow-xl p-8 backdrop-blur-md bg-white/5 text-white transition-all duration-700 ${glow ? 'ring-4 ring-[#FFD700] ring-opacity-60 shadow-yellow-400/40' : ''}`}>
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <h2 className="unbounded-bold text-2xl text-[#FFD700]">Sentiment Results</h2>
            {canDownloadPDF && (
              <ErrorBoundary>
                <PDFDownloadLink
                  key={JSON.stringify({ result, summary, currentText, model })}
                  document={<TextAnalysisPDF analysis={result} summary={summary} userText={currentText} user={user} model={model === 'deep' ? 'Advanced AI' : 'Fast & Simple'} />}
                  fileName="text-analysis-result.pdf"
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#FFD700] text-[#181A1B] unbounded-bold text-base shadow hover:bg-[#5fffe0] transition"
                >
                  <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#181A1B" strokeWidth="2" className="inline-block"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v12m0 0l-4-4m4 4l4-4M4 20h16"/></svg>
                  Download PDF
                </PDFDownloadLink>
              </ErrorBoundary>
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
  );
});

export default function Analyzer() {
  const { user } = useAuth();
  const [hasResults, setHasResults] = useState(false);
  const [model, setModel] = useState("rule");
  const [result, setResult] = useState(null);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [glow, setGlow] = useState(false);
  const [currentText, setCurrentText] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const resultsRef = useRef(null);
  const [analysisDone, setAnalysisDone] = useState(false); // NEW
  const [shouldScroll, setShouldScroll] = useState(false); // NEW

  const BACKEND_URL = getBackendUrl();

  const handleAnalyze = useCallback(async (text, selectedModel) => {
    setLoading(true);
    setCurrentText(text);
    setGlow(true);
    setHasResults(false);
    setResult(null);
    setSummary(null);
    setAnalysisDone(false); // NEW
    setShouldScroll(false); // NEW
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
      if (user) {
        try {
          await analysisHistory.saveAnalysis(user.id, {
            text: text,
            model: selectedModel,
            results: response.data.results,
            summary: response.data.paragraph_sentiment,
          });
          setRefreshKey(prev => prev + 1);
        } catch (error) {
          console.error('Failed to save analysis:', error);
        }
      }
      // Scroll after 2s, loader after 3s
      setTimeout(() => setShouldScroll(true), 2000);
      setTimeout(() => setAnalysisDone(true), 3000);
    } catch (error) {
      alert("Analysis failed. Please try again.");
      setHasResults(false);
      setAnalysisDone(false);
      setShouldScroll(false);
    } finally {
      setLoading(false);
    }
  }, [BACKEND_URL, user]);

  useEffect(() => {
    if (hasResults && shouldScroll && resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [hasResults, shouldScroll]);

  const handleSelectAnalysis = useCallback((analysis) => {
    setResult(analysis.results);
    setSummary(analysis.summary);
    setCurrentText(analysis.text);
    setModel(analysis.model);
    setHasResults(true);
    setTimeout(() => {
      if (resultsRef.current) {
        resultsRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 100);
  }, []);

  return (
    <div className="flex flex-col items-center w-full min-h-screen bg-transparent px-2">
      <h1 className="unbounded-bold text-4xl md:text-5xl mb-8 mt-2 tracking-widest text-[#FFD700] text-center drop-shadow-lg">Text Analyzer</h1>
      
      <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Analysis Section - centered with even spacing */}
        <div className="w-full max-w-4xl mx-auto flex flex-col items-center lg:col-span-2">
          {/* Hero Input Section */}
          <section className="w-full">
            <InputBox model={model} setModel={setModel} onAnalyze={handleAnalyze} loading={loading} />
            <div ref={resultsRef} />
            <SentimentResultsSection
              hasResults={hasResults}
              glow={glow}
              result={result}
              summary={summary}
              currentText={currentText}
              user={user}
              PDFDownloadLink={PDFDownloadLink}
              TextAnalysisPDF={TextAnalysisPDF}
              model={model}
            />
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