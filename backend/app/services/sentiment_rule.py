import re
from langdetect import detect, LangDetectException
import emoji
from textblob import TextBlob
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer

vader = SentimentIntensityAnalyzer()

def clean_text(text):
    """
    Clean text by removing URLs, special characters, and converting emojis to text.
    """
    text = emoji.demojize(text, delimiters=(" ", " "))
    text = re.sub(r"http\S+|www\S+", "", text)  # Remove URLs
    text = re.sub(r"[^\w\s.,!?]", "", text)     # Remove special chars except punctuation
    text = re.sub(r"\s+", " ", text).strip()     # Remove extra whitespace
    return text

def is_english(text):
    # Bypass language detection for very short sentences
    if len(text.split()) <= 4:
        return True
    try:
        return detect(text) == 'en'
    except LangDetectException:
        return False

def get_vader_sentiment(text):
    """
    Get sentiment using VADER. Returns: compound score between -1 (negative) to 1 (positive)
    """
    if not text or not is_english(text):
        return None
    score = vader.polarity_scores(text)
    return score['compound']

def get_textblob_sentiment(text):
    """
    Get sentiment polarity using TextBlob. Returns: polarity between -1.0 (negative) and 1.0 (positive)
    """
    if not text or not is_english(text):
        return None
    return TextBlob(text).sentiment.polarity

def ensemble_sentiment(text, vader_weight=0.5, textblob_weight=0.5):
    """
    Combine VADER and TextBlob scores with optional weighting. Returns average score and confidence.
    """
    cleaned = clean_text(text)
    vader_score = get_vader_sentiment(cleaned)
    textblob_score = get_textblob_sentiment(cleaned)
    if vader_score is None and textblob_score is None:
        return 0.0, 0.0  # Neutral, low confidence
    scores = [s for s in [vader_score, textblob_score] if s is not None]
    avg_score = sum(scores) / len(scores) if scores else 0.0
    confidence = len(scores) / 2  # 1.0 if both, 0.5 if only one
    return avg_score, confidence

def classify_sentiment(score):
    """
    Convert numerical score into sentiment label.
    """
    if score >= 0.05:
        return "Positive"
    elif score <= -0.05:
        return "Negative"
    else:
        return "Neutral"
