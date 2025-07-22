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
        {/* Warning/Notice Section (moved to bottom, reworded) */}
        <div className="w-full max-w-3xl mx-auto mt-10 mb-2">
          <div className="rounded-2xl border-2 border-[#FF3B3B] bg-[#181A1B]/90 shadow-xl p-5 flex flex-col items-center text-center backdrop-blur-md">
            <span className="unbounded-bold text-base md:text-lg text-[#FFD700] mb-2">Important Notice</span>
            <ul className="inter-regular text-sm md:text-base text-white/90 mb-2 list-disc list-inside text-left">
              <li><span className="text-[#FFD700] font-bold">Limited Use:</span> SoulSync is currently available with limited daily usage to ensure fair access for all users. This is due to API usage restrictions on our current plan. If you experience slow responses or temporary unavailability, please try again later.</li>
              <li><span className="text-[#FFD700] font-bold">Not a Human Therapist:</span> SoulSync is an AI companion, not a licensed therapist or counselor. For urgent mental health needs, please seek help from a qualified professional or helpline.</li>
              <li><span className="text-[#FFD700] font-bold">Privacy:</span> While your messages are not stored long-term, please avoid sharing sensitive personal information.</li>
              <li><span className="text-[#FFD700] font-bold">Experimental:</span> This feature is experimental and may not always provide accurate or appropriate responses.</li>
              <li><span className="text-[#FFD700] font-bold">Thank You:</span> Thank you for your understanding and support as we continue to improve SoulSync!</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
} 