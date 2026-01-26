import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { getBackendUrl } from '../utils/getBackendUrl';

export default function SoulSync() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hi, I'm SoulSync—your AI companion for emotional support. How are you feeling today?",
      timestamp: new Date().toISOString(),
    },
  ]);
  const [input, setInput] = useState("");
  const [sessionId, setSessionId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const chatContainerRef = useRef(null);
  const BACKEND_URL = getBackendUrl();
  const isFirstRender = useRef(true);


  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);


  const handleSend = async () => {
    if (!input.trim() || loading) return;
    setError("");
    const userMsg = {
      role: "user",
      content: input,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);
    try {
      const res = await axios.post(
        `${BACKEND_URL}/soulsync/chat`,
        {
          session_id: sessionId,
          message: userMsg.content,
        }
      );
      const { response, session_id } = res.data;
      setSessionId(session_id);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: response,
          timestamp: new Date().toISOString(),
        },
      ]);
    } catch (err) {
      setError("Sorry, SoulSync is having trouble connecting. Please try again.");
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "(SoulSync is having trouble connecting. Please try again.)",
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col items-center w-full min-h-screen bg-[#040D12] px-2 py-8">
      <div className="w-full max-w-5xl mx-auto flex flex-col items-center">
        <div className="w-full text-center mb-8">
          <h1 className="unbounded-bold text-4xl md:text-5xl mb-2 tracking-widest text-[#FFD700] drop-shadow-lg">SoulSync</h1>
          <p className="inter-regular text-lg text-white/90 mb-2">Your AI companion for emotional support and mindful conversation.</p>
        </div>
        <div
          ref={chatContainerRef}
          className="w-full flex-1 rounded-2xl border border-white/20 shadow-xl p-4 md:p-8 backdrop-blur-md bg-white/5 text-white flex flex-col mb-6 max-h-[60vh] overflow-y-auto"
          style={{ minHeight: 320 }}
        >
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} mb-3`}
            >
              <div
                className={`max-w-[80%] px-4 py-3 rounded-2xl shadow-md text-base md:text-lg inter-regular ${
                  msg.role === "user"
                    ? "bg-[#FFD700] text-[#181A1B] rounded-br-md"
                    : "bg-[#10151A] text-white rounded-bl-md border border-[#FFD700]/30"
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start mb-3">
              <div className="max-w-[80%] px-4 py-3 rounded-2xl shadow-md text-base md:text-lg inter-regular bg-[#10151A] text-white rounded-bl-md border border-[#FFD700]/30 opacity-80 animate-pulse">
                SoulSync is thinking...
              </div>
            </div>
          )}
        </div>
        {error && (
          <div className="w-full text-center text-red-400 mb-2 inter-regular">{error}</div>
        )}
        <form
          className="w-full flex items-center gap-2 mt-2"
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
        >
          <textarea
            className="flex-1 rounded-2xl border border-white/20 bg-[#181A1B] text-white px-4 py-3 inter-regular text-base md:text-lg shadow focus:outline-none focus:ring-2 focus:ring-[#FFD700] resize-none min-h-[48px] max-h-[120px]"
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            style={{ lineHeight: 1.5 }}
            disabled={loading}
          />
          <button
            type="submit"
            className="px-6 py-3 rounded-2xl bg-[#FFD700] text-[#181A1B] unbounded-bold text-lg shadow hover:bg-[#5fffe0] transition"
            disabled={!input.trim() || loading}
          >
            {loading ? "..." : "Send"}
          </button>
        </form>
        {/* Chat Disabled Notice */}
        <div className="w-full max-w-3xl mx-auto mt-10 mb-2">
          <div className="flex items-start gap-2 sm:gap-4 rounded-2xl border-2 border-[#FF3B3B] bg-[#181A1B]/80 shadow-xl p-3 sm:p-6 backdrop-blur-md">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="flex-shrink-0 mt-1 sm:w-7 sm:h-7">
              <circle cx="12" cy="12" r="11" stroke="#FFD700" strokeWidth="2" fill="#181A1B"/>
              <path d="M12 7v5" stroke="#FFD700" strokeWidth="2" strokeLinecap="round"/>
              <circle cx="12" cy="16" r="1.2" fill="#FFD700"/>
            </svg>
            <div>
              <div className="unbounded-bold text-[#FFD700] text-base sm:text-lg mb-1">SoulSync Chat Temporarily Unavailable</div>
              <ul className="list-disc list-inside text-white/80 inter-regular text-xs sm:text-sm space-y-2 pl-2">
                <li><span className="text-[#FFD700] font-bold">Billing Required:</span> Both Google AI Studio and Vertex AI require billing to be enabled for Gemini model access.</li>
                <li><span className="text-[#FFD700] font-bold">Academic Project:</span> As this is an academic project for resume purposes, we cannot afford paid API access at this time.</li>
                <li><span className="text-[#FFD700] font-bold">Core Features Available:</span> All sentiment analysis features (text, face, voice) remain fully functional and free to use.</li>
                <li><span className="text-[#FFD700] font-bold">Future Plans:</span> We're exploring alternative free AI providers to restore this feature.</li>
                <li>Thank you for your understanding and support!</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}