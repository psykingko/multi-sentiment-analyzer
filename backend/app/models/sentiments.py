# models.py

from pydantic import BaseModel
from typing import List, Optional, Dict

class SentimentRequest(BaseModel):
    paragraph: str

class SentenceSentiment(BaseModel):
    sentence: str
    sentiment: str
    score: float
    confidence: Optional[float] = None
    distribution: Optional[Dict[str, float]] = None

class ParagraphSentiment(BaseModel):
    sentiment: str
    average_score: float
    confidence: Optional[float] = None
    word_count: Optional[int] = None
    char_count: Optional[int] = None
    mental_state: Optional[str] = None
    mental_state_distribution: Optional[Dict[str, float]] = None

class SentimentResponse(BaseModel):
    results: List[SentenceSentiment]
    paragraph_sentiment: ParagraphSentiment
