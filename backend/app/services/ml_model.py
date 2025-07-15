# Deep learning sentiment analysis using HuggingFace Transformers (DistilBERT)
import os
from typing import Optional

try:
    from transformers import pipeline
except ImportError:
    pipeline = None

_sentiment_pipeline = None

def load_bert_pipeline():
    global _sentiment_pipeline
    if pipeline is None:
        raise ImportError("transformers library is not installed. Please install with 'pip install transformers torch'.")
    if _sentiment_pipeline is None:
        _sentiment_pipeline = pipeline(
            "text-classification",
            model="j-hartmann/emotion-english-distilroberta-base",
            return_all_scores=True
        )
    return _sentiment_pipeline

def analyze_sentiment_bert(text: str) -> Optional[dict]:
    """
    Analyze emotion using DistilRoBERTa emotion model. Returns top emotion, its score, and full distribution.
    """
    try:
        pipe = load_bert_pipeline()
        result = pipe(text)
        if result and isinstance(result, list) and len(result) > 0:
            # result[0] is a list of dicts: [{label: 'joy', score: ...}, ...]
            emotions = result[0]
            top_emotion = max(emotions, key=lambda x: x["score"])
            return {
                "emotion": top_emotion["label"],
                "score": float(top_emotion["score"]),
                "distribution": {e["label"]: float(e["score"]) for e in emotions}
            }
        return None
    except Exception as e:
        print(f"[BERT ERROR] {e}")
        return None
