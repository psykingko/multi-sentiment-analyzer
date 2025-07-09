// App.jsx
import { useState } from "react";
import axios from "axios";
import Header from "./components/Header";
import InputBox from "./components/InputBox";
import SentimentResult from "./components/SentimentResult";
import Summary from "./components/Summary";

function App() {
  const [result, setResult] = useState(null);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async (text) => {
    try {
      setLoading(true);
      const response = await axios.post("http://127.0.0.1:8000/analyze", {
        paragraph: text,
      });

      const sentenceResults = response.data.results;
      const paragraphSummary = response.data.paragraph_sentiment;

      const counts = { Positive: 0, Negative: 0, Neutral: 0 };
      sentenceResults.forEach((r) => counts[r.sentiment]++);

      setResult(sentenceResults);
      setSummary({
        ...paragraphSummary,
        sentiment_counts: counts,
      });
    } catch (error) {
      console.error("Analysis failed:", error);
      alert("Something went wrong while analyzing. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white px-4 py-6">
      <div className="max-w-4xl mx-auto">
        <Header />
        <InputBox onAnalyze={handleAnalyze} loading={loading} />

        {result && (
          <div className="animate-fade-in space-y-8">
            <SentimentResult data={result} />
            <Summary summary={summary} />
          </div>
        )}
      </div>

      <footer className="mt-12 text-center text-sm text-gray-500 dark:text-gray-400">
        © {new Date().getFullYear()} Multi-Sentiment Analyzer · Made with ❤️
      </footer>
    </div>
  );
}

export default App;
