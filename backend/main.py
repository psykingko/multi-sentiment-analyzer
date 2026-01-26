# main.py
import os
from dotenv import load_dotenv
load_dotenv()
import ssl

DATABASE_URL = os.getenv("DATABASE_URL")
env_mode = os.getenv("ENV", "local").lower()
print(f"🌍 Running in {env_mode.upper()} mode")

from fastapi import FastAPI, Query, Body
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

import os
print("ENABLE_DEEP_LEARNING:", os.environ.get("ENABLE_DEEP_LEARNING"))
from collections import Counter
import nltk
import textblob.download_corpora
import asyncpg
import asyncio
from fastapi import APIRouter
from app.soulsync import SoulSyncAgent
from fastapi import Request
from pydantic import BaseModel
from typing import Optional

# In-memory session store for demo (replace with persistent store for production)
soulsync_sessions = {}

class SoulSyncChatRequest(BaseModel):
    session_id: Optional[str] = None
    message: str

class SoulSyncChatResponse(BaseModel):
    response: str
    session_id: str
    should_continue: bool

# Create a global connection pool
pool = None

def ensure_nltk_textblob_corpora():
    # Download punkt for NLTK
    try:
        nltk.data.find('tokenizers/punkt')
    except LookupError:
        nltk.download('punkt')
    # Download punkt_tab for NLTK (rare, but some TextBlob versions require it)
    try:
        nltk.data.find('tokenizers/punkt_tab')
    except LookupError:
        nltk.download('punkt_tab')
    # Download TextBlob corpora (wordnet, brown, etc.)
    try:
        textblob.download_corpora.download_all()
    except Exception as e:
        print(f"[WARN] Could not download TextBlob corpora: {e}")

# Don't run NLTK downloads at import time - move to startup event
# ensure_nltk_textblob_corpora()

app = FastAPI()

# CORS config for frontend (move this to be the very first middleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://multi-sentiment-analyzer.vercel.app",
        "https://multi-sentiment-analyzer-git-o-4e070a-ashishs-projects-b27772ae.vercel.app"
    ],  # React frontend origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add GZip compression for all responses
app.add_middleware(GZipMiddleware, minimum_size=500)



async def initialize_database():
    """Initialize database tables if they don't exist"""
    if pool is None:
        print("⚠️ [DB_INIT] Database pool is None, skipping initialization")
        return False
    
    try:
        async with pool.acquire() as conn:
            # Check if global_insights table exists and has data
            exists = await conn.fetchval("""
                SELECT EXISTS (
                    SELECT FROM information_schema.tables 
                    WHERE table_name = 'global_insights'
                )
            """)
            
            if not exists:
                print("📊 [DB_INIT] Creating global_insights table...")
                await conn.execute("""
                    CREATE TABLE IF NOT EXISTS global_insights (
                        id SERIAL PRIMARY KEY,
                        total_analyses INTEGER DEFAULT 0,
                        total_emotions INTEGER DEFAULT 0
                    )
                """)
            
            # Ensure there's at least one row in global_insights
            count = await conn.fetchval("SELECT COUNT(*) FROM global_insights")
            if count == 0:
                print("📊 [DB_INIT] Inserting initial row in global_insights...")
                await conn.execute("""
                    INSERT INTO global_insights (total_analyses, total_emotions)
                    VALUES (0, 0)
                """)
            
            print("✅ [DB_INIT] Database initialization completed successfully")
            return True
            
    except Exception as e:
        print(f"❌ [DB_INIT ERROR] Failed to initialize database: {e}")
        return False

@app.on_event("startup")
async def startup():
    global pool
    
    # Download NLTK data in background during startup
    print("📚 Downloading NLTK data...")
    try:
        ensure_nltk_textblob_corpora()
        print("✅ NLTK data downloaded successfully!")
    except Exception as e:
        print(f"⚠️ Warning: NLTK download failed: {e}")

    if not DATABASE_URL:
        print("❌ [DATABASE] DATABASE_URL is not set. Skipping DB pool creation.")
        pool = None
        return

    # Try multiple connection attempts with different SSL configurations
    connection_attempts = [
        {"ssl": "require"},
        {"ssl": ssl._create_unverified_context()},
        {"ssl": None}
    ]
    
    for attempt, ssl_config in enumerate(connection_attempts, 1):
        try:
            print(f"🔄 Database connection attempt {attempt}/3 with SSL config: {ssl_config}")
            
            pool = await asyncpg.create_pool(
                dsn=DATABASE_URL,
                min_size=1,
                max_size=5,
                command_timeout=60,
                **ssl_config
            )
            
            # Test the connection
            async with pool.acquire() as conn:
                await conn.fetchval("SELECT 1")
            
            print("✅ Connected to Supabase database successfully!")
            
            # Initialize database tables
            await initialize_database()
            return
            
        except Exception as e:
            print(f"❌ [DATABASE CONNECTION ATTEMPT {attempt}] {e}")
            if pool:
                try:
                    await pool.close()
                except:
                    pass
                pool = None
    
    print("❌ [CRITICAL] All database connection attempts failed. Running without database.")
    pool = None


@app.on_event("shutdown")
async def shutdown():
    global pool
    if pool:
        try:
            await pool.close()
            print("🧹 Connection pool closed cleanly.")
        except Exception as e:
            print(f"[WARN] Error closing pool: {e}")



@app.get("/")
def root():
    return {"message": "Multi-Sentiment Analyzer API. See /health or /analyze."}

@app.get("/health")
def health_check():
    return {"status": "ok", "pool_status": pool is not None}

@app.get("/debug/pool")
async def debug_pool():
    """Debug endpoint to check pool status"""
    return {
        "pool_exists": pool is not None,
        "pool_type": str(type(pool)),
        "database_url_set": DATABASE_URL is not None,
        "env_mode": env_mode
    }

@app.get("/version")
def version():
    return {"version": "1.0.0", "model": "VADER + TextBlob"}



# Log the database URL (partially, for debugging)
db_url = os.getenv("DATABASE_URL")
if db_url:
    print(f"[INFO] Using DATABASE_URL: {db_url[:30]}...{db_url[-15:]}")
else:
    print("[ERROR] DATABASE_URL is not set!")

async def increment_global_insights(num_emotions: int):
    if pool is None:
        print("⚠️ [INCREMENT_INSIGHTS] Database pool is None, skipping increment")
        return
    
    try:
        async with pool.acquire() as conn:
            await conn.execute("""
                UPDATE global_insights
                SET total_analyses = total_analyses + 1,
                    total_emotions = total_emotions + $1
            """, num_emotions)
            print(f"✅ [INCREMENT_INSIGHTS] Successfully incremented with {num_emotions} emotions")
    except Exception as e:
        print(f"❌ [INCREMENT_INSIGHTS ERROR] Could not update database: {e}")
        # Don't raise the exception, just log it

@app.post("/analyze", response_model=SentimentResponse)
def analyze_sentiment_api(request: SentimentRequest, model: str = Query("rule", enum=["rule", "deep"])) -> SentimentResponse:
    enable_deep = os.getenv("ENABLE_DEEP_LEARNING", "false").lower() == "true"
    try:
        sentences = split_into_sentences(request.paragraph)
        sentence_results: list[SentenceSentiment] = []
        total_score = 0.0
        total_confidence = 0.0
        emotion_counts = {}
        all_emotions = []

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
                        all_emotions.append(sentiment)
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
                    all_emotions.append(sentiment)
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

        # --- New fields ---
        paragraph_text = request.paragraph
        word_count = len(paragraph_text.split())
        char_count = len(paragraph_text)
        # Mental state: most common emotion/sentiment
        if all_emotions:
            mental_state = Counter(all_emotions).most_common(1)[0][0]
            total = len(all_emotions)
            mental_state_distribution = {k: v / total for k, v in Counter(all_emotions).items()}
        else:
            mental_state = None
            mental_state_distribution = None

        # Do NOT increment global insights here
        return SentimentResponse(
            results=sentence_results,
            paragraph_sentiment=ParagraphSentiment(
                sentiment=paragraph_sentiment,
                average_score=avg_paragraph_score,
                confidence=avg_paragraph_confidence,
                word_count=word_count,
                char_count=char_count,
                mental_state=mental_state,
                mental_state_distribution=mental_state_distribution
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

# Add a new endpoint to increment global insights
@app.post("/increment-insights")
async def increment_insights(num_emotions: int = Body(..., embed=True)):
    print(f"[DEBUG] /increment-insights called with num_emotions={num_emotions}")
    try:
        await increment_global_insights(num_emotions)
        print("[DEBUG] increment_global_insights succeeded")
        return {"status": "ok", "message": "Insights updated successfully"}
    except Exception as e:
        print(f"[ERROR] increment_global_insights failed: {e}")
        return {"status": "error", "detail": str(e)}

@app.post("/soulsync/chat", response_model=SoulSyncChatResponse)
def soulsync_chat(request: SoulSyncChatRequest):
    # SoulSync is temporarily disabled due to Gemini API access limitations
    # Both Google AI Studio and Vertex AI require paid access
    return SoulSyncChatResponse(
        response="SoulSync chat is currently unavailable. Both Google AI Studio and Vertex AI require billing to be enabled for Gemini model access. Please use the core sentiment analysis features instead.",
        session_id=request.session_id or "disabled",
        should_continue=False
    )
    
    # Original implementation (disabled):
    # print("Received:", request)
    # import uuid
    # session_id = request.session_id or str(uuid.uuid4())
    # if session_id not in soulsync_sessions:
    #     MAX_SESSIONS = 3
    #     if len(soulsync_sessions) >= MAX_SESSIONS:
    #         soulsync_sessions.pop(next(iter(soulsync_sessions)))
    #     soulsync_sessions[session_id] = SoulSyncAgent()
    # agent = soulsync_sessions[session_id]
    # response, should_continue = agent.continue_conversation(request.message)
    # return SoulSyncChatResponse(response=response, session_id=session_id, should_continue=should_continue)

@app.get("/insights")
async def get_insights():
    print(f"🔍 [INSIGHTS DEBUG] Pool status: {pool is not None}")
    print(f"🔍 [INSIGHTS DEBUG] Pool object: {pool}")
    
    if pool is None:
        print("⚠️ [INSIGHTS] Database pool is None, returning default values")
        return {
            "error": "Database connection not available",
            "total_analyses": 0,
            "total_emotions": 0,
            "avg_confidence": 0.0,
            "sessions": 0,
            "sentiment_distribution": {
                "Positive": 0,
                "Negative": 0,
                "Neutral": 0
            }
        }
    
    try:
        print("🔍 [INSIGHTS DEBUG] Attempting to acquire connection...")
        async with pool.acquire() as conn:
            print("🔍 [INSIGHTS DEBUG] Connection acquired successfully")
            # Get global counts
            row = await conn.fetchrow("SELECT total_analyses, total_emotions FROM global_insights LIMIT 1")
            total_analyses = row["total_analyses"] if row else 0
            total_emotions = row["total_emotions"] if row else 0

            # Calculate average confidence (all-time)
            avg_conf_row = await conn.fetchrow("SELECT AVG((summary->>'confidence')::float) AS avg_confidence FROM analysis_history WHERE summary->>'confidence' IS NOT NULL")
            avg_confidence = avg_conf_row["avg_confidence"] if avg_conf_row else 0.0

            # Count all-time unique users
            sessions_row = await conn.fetchrow("SELECT COUNT(DISTINCT user_id) AS sessions FROM analysis_history")
            sessions = sessions_row["sessions"] if sessions_row else 0

            # Sentiment distribution (all-time, by paragraph_sentiment)
            sentiment_rows = await conn.fetch("SELECT summary->>'sentiment' AS sentiment, COUNT(*) AS count FROM analysis_history WHERE summary->>'sentiment' IS NOT NULL GROUP BY sentiment")
            sentiment_distribution = {row["sentiment"]: row["count"] for row in sentiment_rows}

            print("🔍 [INSIGHTS DEBUG] Database queries completed successfully")
            return {
                "total_analyses": total_analyses,
                "total_emotions": total_emotions,
                "avg_confidence": round(avg_confidence, 2) if avg_confidence else 0.0,
                "sessions": sessions,
                "sentiment_distribution": sentiment_distribution
            }
    except Exception as e:
        print(f"❌ [DATABASE ERROR in /insights] {e}")
        print(f"🔍 [INSIGHTS DEBUG] Exception type: {type(e)}")
        return {
            "error": f"Database error: {str(e)}",
            "total_analyses": 0,
            "total_emotions": 0,
            "avg_confidence": 0.0,
            "sessions": 0,
            "sentiment_distribution": {
                "Positive": 0,
                "Negative": 0,
                "Neutral": 0
            }
        }

# For local development only
# if __name__ == "__main__":
#     import uvicorn
    
#     # Get port from environment variable (Render sets this)
#     port = int(os.environ.get("PORT", 8000))
    
#     print(f"🚀 Starting server on port {port}")
    
#     # Launch FastAPI server
#     uvicorn.run("main:app", host="0.0.0.0", port=port, reload=(env_mode != "production"))
