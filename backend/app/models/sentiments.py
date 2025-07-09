# models.py

from pydantic import BaseModel
from typing import List, Optional

class SentimentRequest(BaseModel):
    paragraph: str

class SentenceSentiment(BaseModel):
    sentence: str
    sentiment: str
    score: float
    confidence: Optional[float] = None

class ParagraphSentiment(BaseModel):
    sentiment: str
    average_score: float
    confidence: Optional[float] = None

class SentimentResponse(BaseModel):
    results: List[SentenceSentiment]
    paragraph_sentiment: ParagraphSentiment
