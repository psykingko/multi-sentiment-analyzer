import os
import json
import pickle
import logging
from datetime import datetime
from typing import List, Dict, Optional
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ConversationMemory:
    """
    Manages conversation memory using TF-IDF for retrieval-augmented generation
    """
    
    def __init__(self, memory_dir: str = "emo_buddy_memory"):
        self.memory_dir = memory_dir
        self.metadata_file = os.path.join(memory_dir, "memory_metadata.json")
        self.sessions_file = os.path.join(memory_dir, "sessions.json")
        os.makedirs(memory_dir, exist_ok=True)
        self.vectorizer = TfidfVectorizer()
        self.corpus = []  # All memory contents
        self.metadata = self._load_metadata()
        self.sessions = self._load_sessions()
        self.tfidf_matrix = None
        self._rebuild_tfidf_matrix()
        logger.info("ConversationMemory (TF-IDF) initialized successfully")

    def _rebuild_tfidf_matrix(self):
        self.corpus = [entry["content"] for entry in self.metadata]
        if self.corpus:
            self.tfidf_matrix = self.vectorizer.fit_transform(self.corpus)
        else:
            self.tfidf_matrix = None

    def _load_metadata(self) -> List[Dict]:
        if os.path.exists(self.metadata_file):
            with open(self.metadata_file, 'r') as f:
                return json.load(f)
        return []

    def _load_sessions(self) -> List[Dict]:
        if os.path.exists(self.sessions_file):
            with open(self.sessions_file, 'r') as f:
                return json.load(f)
        return []

    def _save_metadata(self):
        with open(self.metadata_file, 'w') as f:
            json.dump(self.metadata, f, indent=2)

    def _save_sessions(self):
        with open(self.sessions_file, 'w') as f:
            json.dump(self.sessions, f, indent=2, default=str)

    def store_session(self, session_data: Dict, summary: str):
        logger.info("Storing session in memory...")
        session_record = {
            "session_id": len(self.sessions),
            "timestamp": datetime.now().isoformat(),
            "duration": str(session_data.get("start_time", "")),
            "summary": summary,
            "emotions_tracked": session_data.get("emotions_tracked", []),
            "techniques_used": session_data.get("techniques_used", []),
            "crisis_flags": session_data.get("crisis_flags", []),
            "key_phrases": self._extract_key_phrases(session_data),
            "initial_analysis": session_data.get("initial_analysis", {})
        }
        self.sessions.append(session_record)
        self._create_memory_entries(session_record)
        self._rebuild_tfidf_matrix()
        self._save_sessions()
        self._save_metadata()
        logger.info(f"Session stored with ID: {session_record['session_id']}")

    def _extract_key_phrases(self, session_data: Dict) -> List[str]:
        key_phrases = []
        if "initial_analysis" in session_data:
            transcript = session_data["initial_analysis"].get("transcription", "")
            if transcript:
                key_phrases.append(transcript)
        for msg in session_data.get("messages", []):
            if msg["role"] == "user" and len(msg.get("content", "")) > 20:
                key_phrases.append(msg["content"][:200])
        return key_phrases

    def _create_memory_entries(self, session_record: Dict):
        entries_to_add = []
        summary_entry = {
            "type": "session_summary",
            "content": session_record["summary"],
            "session_id": session_record["session_id"],
            "timestamp": session_record["timestamp"],
            "emotions": [e["emotions"] for e in session_record["emotions_tracked"]],
            "techniques": [t["technique"] for t in session_record["techniques_used"]]
        }
        entries_to_add.append(summary_entry)
        for i, phrase in enumerate(session_record["key_phrases"]):
            if len(phrase.strip()) > 10:
                phrase_entry = {
                    "type": "key_phrase",
                    "content": phrase,
                    "session_id": session_record["session_id"],
                    "timestamp": session_record["timestamp"],
                    "phrase_index": i
                }
                entries_to_add.append(phrase_entry)
        for crisis in session_record["crisis_flags"]:
            crisis_entry = {
                "type": "crisis_flag",
                "content": f"Crisis level {crisis['level']}: {crisis.get('text', 'N/A')}",
                "session_id": session_record["session_id"],
                "timestamp": crisis["timestamp"],
                "crisis_level": crisis["level"]
            }
            entries_to_add.append(crisis_entry)
        if entries_to_add:
            start_idx = len(self.metadata)
            for i, entry in enumerate(entries_to_add):
                entry["index_id"] = start_idx + i
                self.metadata.append(entry)

    def get_relevant_context(self, query: str, k: int = 5) -> List[str]:
        if not self.corpus or self.tfidf_matrix is None:
            return []
        try:
            query_vec = self.vectorizer.transform([query])
            similarities = cosine_similarity(self.tfidf_matrix, query_vec).flatten()
            top_indices = np.argsort(similarities)[::-1][:k]
            contexts = []
            for idx in top_indices:
                if similarities[idx] > 0:
                    entry = self.metadata[idx]
                    context = self._format_context(entry)
                    if context:
                        contexts.append(context)
            return contexts
        except Exception as e:
            logger.error(f"Error retrieving context: {e}")
            return []

    def _format_context(self, entry: Dict) -> str:
        try:
            if entry["type"] == "session_summary":
                return f"Previous session: {entry['content'][:200]}..."
            elif entry["type"] == "key_phrase":
                return f"Past conversation: {entry['content']}"
            elif entry["type"] == "crisis_flag":
                return f"Previous crisis indicator: {entry['content']}"
            return ""
        except Exception as e:
            logger.error(f"Error formatting context: {e}")
            return ""

    def get_emotion_patterns(self, lookback_days: int = 30) -> Dict:
        cutoff_date = datetime.now().timestamp() - (lookback_days * 24 * 60 * 60)
        emotions_over_time = []
        techniques_used = []
        for session in self.sessions:
            try:
                session_time = datetime.fromisoformat(session["timestamp"]).timestamp()
                if session_time > cutoff_date:
                    emotions_over_time.extend(session.get("emotions_tracked", []))
                    techniques_used.extend([t["technique"] for t in session.get("techniques_used", [])])
            except Exception as e:
                logger.error(f"Error processing session for patterns: {e}")
                continue
        return {
            "emotions_frequency": self._count_emotions(emotions_over_time),
            "techniques_frequency": self._count_items(techniques_used),
            "total_sessions": len([s for s in self.sessions 
                                 if datetime.fromisoformat(s["timestamp"]).timestamp() > cutoff_date])
        }

    def _count_emotions(self, emotion_entries: List[Dict]) -> Dict:
        emotion_counts = {}
        for entry in emotion_entries:
            for emotion in entry.get("emotions", []):
                emotion_counts[emotion] = emotion_counts.get(emotion, 0) + 1
        return emotion_counts

    def _count_items(self, items: List[str]) -> Dict:
        counts = {}
        for item in items:
            counts[item] = counts.get(item, 0) + 1
        return counts

    def get_crisis_history(self) -> List[Dict]:
        crisis_history = []
        for session in self.sessions:
            for crisis in session.get("crisis_flags", []):
                crisis_history.append({
                    "session_id": session["session_id"],
                    "timestamp": crisis["timestamp"],
                    "level": crisis["level"],
                    "type": crisis.get("type", "unknown"),
                    "session_date": session["timestamp"]
                })
        crisis_history.sort(key=lambda x: x["timestamp"], reverse=True)
        return crisis_history

    def clear_memory(self):
        logger.warning("Clearing all memory...")
        self.metadata = []
        self.sessions = []
        self.corpus = []
        self.tfidf_matrix = None
        for file_path in [self.metadata_file, self.sessions_file]:
            if os.path.exists(file_path):
                os.remove(file_path)
        logger.info("Memory cleared successfully") 