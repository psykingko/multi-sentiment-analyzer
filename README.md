# Multi-Sentiment Analyzer

## 🚀 Overview

Multi-Sentiment Analyzer is a cutting-edge, multi-modal platform for analyzing sentiment and emotion from text, voice, and facial expressions. It combines rule-based and deep learning AI models, offers exportable reports, and features SoulSync—an AI-powered therapeutic companion.

---

## 🌟 Features

- **Text & Paragraph Insights:** Analyze sentiment and emotion in any text, from single sentences to full paragraphs.
- **Real-Time Face Emotion Analysis:** Detect emotions from facial expressions using your webcam (rule-based and deep learning options).
- **Voice & Video Input:** Analyze spoken emotions and facial cues live.
- **Flexible AI Models:** Toggle between lightning-fast rule-based (VADER, TextBlob, geometric rules) and advanced deep learning (DistilBERT, face-api.js) models.
- **Exportable Reports:** Download detailed PDF reports of your sentiment and emotion analysis.
- **Data Privacy & Security:** All data is encrypted; no personal data is stored. Row Level Security (RLS) enforced at the database level.
- **SoulSync AI Support:** Chat with SoulSync, an AI companion for supportive, mindful conversation using evidence-based therapy techniques (CBT, DBT, ACT) and crisis detection.
- **In-Depth Analytics:** Comprehensive breakdowns and trends for every analysis, including animated stats and user insights.
- **User Authentication & History:** Secure login via Supabase, with personal analysis history and insights.
- **RESTful API:** Integrate sentiment analysis into your own apps or services.
- **Experimental Features:** Voice and face analysis for demonstration only (not for medical use). SoulSync is experimental and not a licensed therapist.

---

## 🛠️ Tech Stack

### Frontend
- **React 19** (Vite, React Router v7)
- **Tailwind CSS**, **Framer Motion**, **Lucide Icons**
- **Recharts** (analytics), **@react-pdf/renderer** (PDF export)
- **face-api.js**, **@mediapipe/face_mesh** (face analysis)
- **Web Speech API** (voice input)
- **Supabase Auth** (authentication)
- **Axios**, **@headlessui/react**, **buffer**

### Backend
- **FastAPI** (Python)
- **Rule-Based Sentiment:** VADER, TextBlob, custom emoji handling
- **Deep Learning Sentiment:** HuggingFace Transformers (DistilBERT, RoBERTa), scikit-learn
- **SoulSync AI Therapist:** Google Gemini API, TF-IDF memory, CBT/DBT/ACT logic, crisis detection
- **Database:** PostgreSQL (asyncpg), RLS, users/analysis history/global insights
- **Security:** CORS, GZip, Row Level Security
- **Other:** python-dotenv, pydantic, nltk, emoji, langdetect

---

## ⚡ Quickstart

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd multi_sentiment_analyzer
```

### 2. Backend Setup

#### a. Create and activate a virtual environment (optional but recommended)
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

#### b. Install dependencies
```bash
pip install -r requirements.txt
```

#### c. Environment Variables
- Copy `.env.example` to `.env` and fill in required values (e.g., database URL, Gemini API key).

#### d. Database Setup
- Ensure PostgreSQL is running.
- Run the schema:
```bash
psql <your-db-connection-string> -f ../database/schema.sql
```

#### e. Download NLTK and TextBlob corpora (first run only)
```bash
python download_nltk.py
```

#### f. Start the backend server
```bash
uvicorn main:app --reload
```

### 3. Frontend Setup

```bash
cd ../frontend
npm install
npm run dev
```

The app will be available at [http://localhost:5173](http://localhost:5173)

---

## 🧠 Deep Learning Text Analysis ("Deep" Mode)

By default, the deep learning model for text sentiment analysis (DistilBERT/DistilRoBERTa) is **not hosted** due to resource constraints. To use deep mode locally:

### 1. Install Additional Dependencies
These are now included in `backend/requirements.txt`:
- `transformers`
- `torch`

If you need to install manually:
```bash
pip install transformers torch sentencepiece
```

### 2. Download the Model (First Use)
The first time you run deep mode, the HuggingFace Transformers library will automatically download the model (`j-hartmann/emotion-english-distilroberta-base`). Ensure your machine has internet access and enough disk space (~500MB).

### 3. Enable Deep Learning Mode
Set the environment variable in your `.env`:
```
ENABLE_DEEP_LEARNING=true
```

Restart the backend server. Now, when you select "deep" mode in the UI, the backend will use the deep learning model for text analysis.

**Note:** Deep mode requires more RAM and CPU. For production, consider hosting the model on a GPU server or using a managed inference API.

---

## 🔒 Security & Privacy
- All user data is encrypted in transit.
- No personal data is stored unless you log in and save your analysis.
- Row Level Security (RLS) ensures users can only access their own data.
- SoulSync is an experimental AI companion, not a licensed therapist. For urgent mental health needs, seek professional help.

---

## 📦 API Usage

The backend exposes a RESTful API for integration. Example endpoints:
- `POST /analyze` — Analyze text for sentiment/emotion
- `POST /soulsync/chat` — Chat with SoulSync AI
- `GET /insights` — Get global analysis stats

See the code for request/response formats.

---

## 🧑‍💻 Contributing
Pull requests and issues are welcome! Please open an issue for bugs, feature requests, or feedback.

---

## 📄 License

This project is licensed under the MIT License.

```
MIT License

Copyright (c) 2024 Ashish Singh

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 🙏 Acknowledgements
- HuggingFace, Google Gemini, MediaPipe, face-api.js, Supabase, and all open-source contributors.
- **EmoBuddy**: The AI therapeutic companion system (integrated as SoulSync) for evidence-based, supportive conversation. 

## 🌐 Live Demo

Try it now: [https://multi-sentiment-analyzer.vercel.app/](https://multi-sentiment-analyzer.vercel.app/)

--- 