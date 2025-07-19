import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { analysisHistory } from '../lib/supabase';
import { Trash2, Clock, BarChart3 } from 'lucide-react';

const RecentAnalysis = ({ onSelectAnalysis, refreshKey }) => {
  const { user } = useAuth();
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user) {
      loadRecentAnalyses();
    }
  }, [user, refreshKey]);

  const loadRecentAnalyses = async () => {
    try {
      setLoading(true);
      const data = await analysisHistory.getRecentAnalysis(user.id, 5);
      setAnalyses(data);
    } catch (err) {
      setError('Failed to load recent analyses');
      console.error('Error loading analyses:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (analysisId) => {
    try {
      await analysisHistory.deleteAnalysis(analysisId, user.id);
      setAnalyses(analyses.filter(analysis => analysis.id !== analysisId));
    } catch (err) {
      console.error('Error deleting analysis:', err);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffMins < 2) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffHours < 48) return 'Yesterday';
    return date.toLocaleDateString();
  };

  const getSentimentColor = (sentiment) => {
    switch (sentiment?.toLowerCase()) {
      case 'positive': return '#00FFCC';
      case 'negative': return '#FF6B6B';
      case 'neutral': return '#FFD700';
      default: return '#666';
    }
  };

  const getSentimentIcon = (sentiment) => {
    const color = getSentimentColor(sentiment);
    switch (sentiment?.toLowerCase()) {
      case 'positive':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <path d="M8 15s1.5 2 4 2 4-2 4-2"/>
            <line x1="9" y1="9" x2="9.01" y2="9"/>
            <line x1="15" y1="9" x2="15.01" y2="9"/>
          </svg>
        );
      case 'negative':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <path d="M16 15s-1.5-2-4-2-4 2-4 2"/>
            <line x1="9" y1="9" x2="9.01" y2="9"/>
            <line x1="15" y1="9" x2="15.01" y2="9"/>
          </svg>
        );
      default:
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="8" y1="15" x2="16" y2="15"/>
            <line x1="9" y1="9" x2="9.01" y2="9"/>
            <line x1="15" y1="9" x2="15.01" y2="9"/>
          </svg>
        );
    }
  };

  if (!user) {
    return (
      <motion.div
        className="rounded-2xl border border-white/20 shadow-xl p-6 backdrop-blur-md bg-white/5"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="text-center text-white/60">
          <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>Sign in to view your analysis history</p>
        </div>
      </motion.div>
    );
  }

  if (loading) {
    return (
      <motion.div
        className="rounded-2xl border border-white/20 shadow-xl p-6 backdrop-blur-md bg-white/5"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="text-center text-white/60">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00FFCC] mx-auto mb-4"></div>
          <p>Loading recent analyses...</p>
        </div>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div
        className="rounded-2xl border border-red-500/20 shadow-xl p-6 backdrop-blur-md bg-red-500/5"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="text-center text-red-400">
          <p>{error}</p>
          <button
            onClick={loadRecentAnalyses}
            className="mt-2 px-4 py-2 bg-red-500/20 border border-red-500/30 rounded-lg hover:bg-red-500/30 transition-colors"
          >
            Retry
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="rounded-2xl border border-white/20 shadow-xl p-6 py-6 min-h-[460px] h-auto flex flex-col justify-between backdrop-blur-md bg-white/5"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="unbounded-bold text-xl text-[#FFD700]">Recent Analyses</h3>
        <Clock className="w-5 h-5 text-white/60" />
      </div>

      <div className="flex-1 flex flex-col">
        {analyses.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center text-white/60 min-h-[220px]">
            <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No analyses yet. Start analyzing text to see your history here!</p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto space-y-2 pr-1 min-h-[340px] max-h-[350px]">
            <AnimatePresence>
              {analyses.map((analysis, index) => (
                <motion.div
                  key={analysis.id}
                  className="group relative rounded-xl border border-white/10 p-4 hover:border-[#00FFCC]/30 hover:bg-white/5 transition-all duration-200 cursor-pointer"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => onSelectAnalysis(analysis)}
                  // whileHover={{ scale: 1.02 }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        {getSentimentIcon(analysis.summary?.sentiment)}
                        <span className="text-sm text-white/80 font-medium">
                          {analysis.summary?.sentiment || 'Unknown'}
                        </span>
                        <span className="text-xs text-white/60">
                          {formatDate(analysis.created_at)}
                        </span>
                      </div>
                      <p className="text-white/90 text-sm line-clamp-2">
                        {analysis.text?.substring(0, 100)}
                        {analysis.text?.length > 100 && '...'}
                      </p>
                      {/* <div className="flex items-center gap-4 mt-2 text-xs text-white/60">
                        <span>Model: {analysis.model}</span>
                        <span>Sentences: {analysis.results?.length || 0}</span>
                      </div> */}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(analysis.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all duration-200"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default RecentAnalysis; 