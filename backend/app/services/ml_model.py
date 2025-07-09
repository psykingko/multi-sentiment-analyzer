from transformers import AutoTokenizer, AutoModelForSequenceClassification
from torch.nn.functional import softmax
import torch

# Load pre-trained model and tokenizer
MODEL_NAME = "nlptown/bert-base-multilingual-uncased-sentiment"

tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
model = AutoModelForSequenceClassification.from_pretrained(MODEL_NAME)

# Function to analyze sentiment using BERT
def analyze_sentiment_bert(text: str):
    inputs = tokenizer(text, return_tensors="pt", truncation=True)
    with torch.no_grad():
        outputs = model(**inputs)
        probs = softmax(outputs.logits, dim=1)
    
    predicted_class = torch.argmax(probs).item()
    
    # Convert class to label
    # 0 → 1 star, 4 → 5 star
    stars = predicted_class + 1
    sentiment = "Negative" if stars <= 2 else "Neutral" if stars == 3 else "Positive"
    
    return sentiment, float(probs[0][predicted_class])
