# main.py

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
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

app = FastAPI()

# CORS config for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # React frontend origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health_check():
    return {"status": "ok"}

@app.get("/version")
def version():
    return {"version": "1.0.0", "model": "VADER + TextBlob"}

@app.post("/analyze", response_model=SentimentResponse)
def analyze_sentiment_api(request: SentimentRequest) -> SentimentResponse:
    try:
        sentences = split_into_sentences(request.paragraph)
        sentence_results: list[SentenceSentiment] = []
        total_score = 0.0
        total_confidence = 0.0

        for sentence in sentences:
            cleaned = clean_text(sentence)
            if not cleaned or not is_english(cleaned):
                sentiment = "Neutral"
                avg_score = 0.0
                confidence = 0.0
            else:
                avg_score, confidence = ensemble_sentiment(cleaned)
                sentiment = classify_sentiment(avg_score)
            total_score += avg_score
            total_confidence += confidence

            sentence_results.append(SentenceSentiment(
                sentence=sentence,
                sentiment=sentiment,
                score=round(avg_score, 2),
                confidence=round(confidence, 2) if hasattr(SentenceSentiment, 'confidence') else None
            ))

        avg_paragraph_score = round(total_score / len(sentence_results), 2) if sentence_results else 0.0
        avg_paragraph_confidence = round(total_confidence / len(sentence_results), 2) if sentence_results else 0.0
        paragraph_sentiment = classify_sentiment(avg_paragraph_score)

        return SentimentResponse(
            results=sentence_results,
            paragraph_sentiment=ParagraphSentiment(
                sentiment=paragraph_sentiment,
                average_score=avg_paragraph_score,
                confidence=avg_paragraph_confidence if hasattr(ParagraphSentiment, 'confidence') else None
            )
        )

    except Exception as e:
        print(f"❌ ERROR in /analyze: {e}")
        raise e
