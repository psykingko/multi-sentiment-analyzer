#!/usr/bin/env python3
"""
Download required NLTK data packages for sentiment analysis.
This script should be run after installing NLTK to download necessary corpora and models.
"""

import nltk
import ssl
import sys

def download_nltk_data():
    """Download required NLTK data packages"""
    
    # Handle SSL certificate issues
    try:
        _create_unverified_https_context = ssl._create_unverified_context
    except AttributeError:
        pass
    else:
        ssl._create_default_https_context = _create_unverified_https_context
    
    # List of required NLTK data packages
    required_packages = [
        'punkt',           # Tokenizer models
        'vader_lexicon',   # VADER sentiment lexicon
        'stopwords',       # Stop words corpus
        'wordnet',         # WordNet lexical database
        'omw-1.4',         # Open Multilingual Wordnet
        'averaged_perceptron_tagger',  # POS tagger
        'punkt_tab'        # Updated punkt tokenizer (if available)
    ]
    
    print("Downloading required NLTK data packages...")
    
    for package in required_packages:
        try:
            print(f"Downloading {package}...")
            nltk.download(package, quiet=True)
            print(f"✓ {package} downloaded successfully")
        except Exception as e:
            print(f"⚠ Warning: Could not download {package}: {e}")
            # Continue with other packages even if one fails
            continue
    
    print("\nNLTK data download completed!")
    print("You can now use NLTK-based sentiment analysis features.")

if __name__ == "__main__":
    try:
        download_nltk_data()
        sys.exit(0)
    except Exception as e:
        print(f"Error downloading NLTK data: {e}")
        sys.exit(1)