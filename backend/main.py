# main.py

import os
from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from app.models.sentiments import (
    SentimentRequest,
    SentimentResponse,
    SentenceSentiment,
    ParagraphSentiment
)
from app.utils.utils import split_into_sentences
from app.services.sentiment_rule import (
    get_vader_sentiment,
    get_textblob_sentiment,
    classify_sentiment,
    ensemble_sentiment,
    clean_text,
    is_english
)
from app.services.ml_model import analyze_sentiment_bert

app = FastAPI()

# CORS config for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # React frontend origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add GZip compression for all responses
app.add_middleware(GZipMiddleware, minimum_size=500)

@app.get("/health")
def health_check():
    return {"status": "ok"}

@app.get("/version")
def version():
    return {"version": "1.0.0", "model": "VADER + TextBlob"}

@app.post("/analyze", response_model=SentimentResponse)
def analyze_sentiment_api(request: SentimentRequest, model: str = Query("rule", enum=["rule", "deep"])) -> SentimentResponse:
    enable_deep = os.getenv("ENABLE_DEEP_LEARNING", "false").lower() == "true"
    try:
        sentences = split_into_sentences(request.paragraph)
        sentence_results: list[SentenceSentiment] = []
        total_score = 0.0
        total_confidence = 0.0
        emotion_counts = {}

        for sentence in sentences:
            if model == "deep":
                if not enable_deep:
                    sentiment = "Unavailable"
                    avg_score = 0.0
                    confidence = 0.0
                    distribution = None
                else:
                    # Use deep learning emotion model
                    bert_result = analyze_sentiment_bert(sentence)
                    if bert_result is None:
                        sentiment = "Unavailable"
                        avg_score = 0.0
                        confidence = 0.0
                        distribution = None
                    else:
                        sentiment = bert_result["emotion"].capitalize()
                        avg_score = bert_result["score"]
                        confidence = bert_result["score"]
                        distribution = bert_result.get("distribution")
                        # Count emotions for summary
                        emotion_counts[sentiment] = emotion_counts.get(sentiment, 0) + 1
            else:
                # Use rule-based model
                cleaned = clean_text(sentence)
                print(f"[DEBUG] Original: {sentence} | Cleaned: {cleaned}")
                english = is_english(cleaned)
                print(f"[DEBUG] is_english: {english}")
                if not cleaned or not english:
                    sentiment = "Neutral"
                    avg_score = 0.0
                    confidence = 0.0
                    distribution = None
                else:
                    avg_score, confidence = ensemble_sentiment(cleaned)
                    print(f"[DEBUG] Score: {avg_score}, Confidence: {confidence}")
                    sentiment = classify_sentiment(avg_score)
                    print(f"[DEBUG] Classified: {sentiment}")
                    distribution = None
            total_score += avg_score
            total_confidence += confidence

            sentence_results.append(SentenceSentiment(
                sentence=sentence,
                sentiment=sentiment,
                score=round(avg_score, 2),
                confidence=round(confidence, 2),
                distribution=distribution
            ))

        avg_paragraph_score = round(total_score / len(sentence_results), 2) if sentence_results else 0.0
        avg_paragraph_confidence = round(total_confidence / len(sentence_results), 2) if sentence_results else 0.0
        if model == "deep" and emotion_counts:
            # Pick the most frequent emotion for the paragraph
            paragraph_sentiment = max(emotion_counts, key=lambda k: emotion_counts[k])
        else:
            paragraph_sentiment = classify_sentiment(avg_paragraph_score)

        return SentimentResponse(
            results=sentence_results,
            paragraph_sentiment=ParagraphSentiment(
                sentiment=paragraph_sentiment,
                average_score=avg_paragraph_score,
                confidence=avg_paragraph_confidence
            )
        )

    except ImportError as e:
        return SentimentResponse(
            results=[],
            paragraph_sentiment=ParagraphSentiment(
                sentiment="Unavailable",
                average_score=0.0,
                confidence=0.0
            )
        )
    except Exception as e:
        print(f"❌ ERROR in /analyze: {e}")
        raise e
