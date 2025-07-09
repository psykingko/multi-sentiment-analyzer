# utils.py

import nltk
from nltk.tokenize import sent_tokenize

nltk.download('punkt')

def split_into_sentences(paragraph: str):
    return sent_tokenize(paragraph)
