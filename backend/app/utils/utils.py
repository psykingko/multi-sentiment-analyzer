# utils.py

import nltk
from nltk.tokenize import sent_tokenize
from textblob import TextBlob

try:
    nltk.data.find('tokenizers/punkt')
except LookupError:
    nltk.download('punkt')

def split_into_sentences(paragraph: str):
    return [str(s) for s in TextBlob(paragraph).sentences]
