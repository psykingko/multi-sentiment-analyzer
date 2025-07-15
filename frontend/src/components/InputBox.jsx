// InputBox.jsx
import { useState, useRef, Fragment } from "react";
import { Mic, MicOff } from "lucide-react";
import { Listbox, Transition } from '@headlessui/react';
import { ChevronUpDownIcon, CheckIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import Tooltip from './Tooltip'; // Assume Tooltip exists or will be created

const modelOptions = [
  { value: "rule", label: "Fast & Simple (Recommended)" },
  { value: "deep", label: "Advanced AI (Local Only)" },
];

const InputBox = ({ onAnalyze, loading, model = "rule", setModel }) => {
  const [text, setText] = useState("");
  const [listening, setListening] = useState(false);
  const [deepUnavailable, setDeepUnavailable] = useState(false);
  const recognitionRef = useRef(null);

  const startListening = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech Recognition not supported.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.continuous = true;
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    let lastResultIndex = -1;
    recognition.start();
    setListening(true);
    recognition.onresult = (event) => {
      const currentIndex = event.resultIndex;
      if (currentIndex === lastResultIndex) return;
      lastResultIndex = currentIndex;
      const transcript = event.results[currentIndex][0].transcript
        .toLowerCase()
        .trim()
        .replace(/\b(full stop|period)\b/g, ".")
        .replace(/\bcomma\b/g, ",")
        .replace(/\bquestion mark\b/g, "?")
        .replace(/\bexclamation mark\b/g, "!")
        .replace(/\s+/g, " ");
      setText((prev) => prev.trim() + " " + transcript);
    };
    recognition.onerror = () => stopListening();
    recognition.onend = () => {
      if (listening) recognition.start();
    };
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    setListening(false);
    setText((prev) => prev.trim().replace(/\s+/g, " "));
  };

  const handleClick = async () => {
    if (listening) stopListening();
    if (text.trim()) {
      const result = await onAnalyze(text, model);
      if (result && result.some(r => r.sentiment === "Unavailable")) {
        setDeepUnavailable(true);
        setModel("rule");
      } else {
        setDeepUnavailable(false);
      }
    }
  };

  return (
    <form
      className="rounded-2xl border border-white/20 shadow-xl p-6 md:p-8 backdrop-blur-md bg-white/5 mb-4 relative max-w-4xl w-full mx-auto"
      onSubmit={e => { e.preventDefault(); handleClick(); }}
      autoComplete="off"
    >
      {/* Model selection dropdown (Headless UI Listbox) */}
      <div className="mb-2 flex flex-col md:flex-row items-center gap-2 w-full">
        <label htmlFor="model-select" className="inter-medium text-white/80 min-w-[70px]">
          Model:
        </label>
        <div className="w-full md:w-auto">
          <Listbox value={model} onChange={setModel} disabled={loading || deepUnavailable}>
            <div className="relative mt-1">
              <Listbox.Button className="relative w-full cursor-pointer rounded-xl bg-[#181A1B]/80 py-2 pl-4 pr-10 text-left text-white shadow focus:outline-none focus:ring-2 focus:ring-[#FFD700] border border-white/20 hover:border-[#FFD700] focus:border-[#FFD700] transition-all duration-200 backdrop-blur-md">
                <span className="block truncate inter-regular">
                  {modelOptions.find((opt) => opt.value === model)?.label}
                </span>
                <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                  <ChevronUpDownIcon className="h-5 w-5 text-[#FFD700]" aria-hidden="true" />
                </span>
              </Listbox.Button>
              {deepUnavailable && (
                <div className="absolute left-0 mt-2 text-xs text-red-400 bg-[#181A1B]/90 px-3 py-1 rounded shadow z-20">
                  Deep learning model is unavailable on this server. Only rule-based analysis is enabled.
                </div>
              )}
              <Transition
                as={Fragment}
                leave="transition ease-in duration-100"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <Listbox.Options className="absolute z-10 mt-2 max-h-60 w-full min-w-[260px] overflow-auto rounded-xl bg-[#181A1B]/95 py-2 shadow-xl ring-1 ring-[#FFD700]/30 border border-[#FFD700]/40 focus:outline-none backdrop-blur-md">
                  {modelOptions.map((option) => (
                    <Listbox.Option
                      key={option.value}
                      className={({ active, selected }) =>
                        `relative cursor-pointer select-none py-3 pl-10 pr-4 inter-regular text-base rounded-lg transition-all duration-150
                        ${active ? 'bg-[#FFD700]/10 text-[#FFD700]' : 'text-white/90'}
                        ${selected ? 'font-bold bg-[#FFD700]/20 text-[#FFD700]' : ''}`
                      }
                      value={option.value}
                    >
                      {({ selected }) => (
                        <>
                          <span className={`block truncate ${selected ? 'font-bold' : ''}`}>{option.label}</span>
                          {selected ? (
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                              <CheckIcon className="h-5 w-5 text-[#FFD700]" aria-hidden="true" />
                            </span>
                          ) : null}
                        </>
                      )}
                    </Listbox.Option>
                  ))}
                </Listbox.Options>
              </Transition>
            </div>
          </Listbox>
        </div>
        {model === "deep" && (
          <span className="text-xs text-yellow-400 ml-2 inter-regular">
            Advanced AI model will only work locally when it is installed.
          </span>
        )}
      </div>
      <textarea
        className="w-full h-32 p-3 border border-white/20 rounded-xl shadow-sm resize-none text-white bg-[#181A1B] inter-regular focus:ring-2 focus:ring-accent focus:border-accent transition placeholder-white/40"
        placeholder="Type or speak a paragraph..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        disabled={loading}
      />
      <div className="flex flex-col sm:flex-row items-center justify-between mt-3 w-full gap-3">
        <button
          type="submit"
          className="flex-1 px-6 py-2 bg-gradient-to-r from-[#FFD700] to-[#FFB300] text-black rounded-full unbounded-bold shadow hover:from-[#FFB300] hover:to-[#FFD700] hover:scale-105 transition-all duration-200 border-2 border-[#FFD700]/60 focus:outline-none focus:ring-2 focus:ring-[#FFD700] disabled:opacity-60"
          disabled={loading || !text.trim()}
        >
          Analyze
        </button>
        {listening ? (
          <div className="flex items-center gap-2">
            <span className="animate-pulse rounded-full border-2 border-[#FFD700] bg-[#FFD700]/10 p-2">
              <Mic className="text-[#FFD700] w-6 h-6" />
            </span>
            <button type="button" onClick={stopListening} className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold bg-[#181A1B] border-2 border-red-500 shadow-[0_0_8px_2px_rgba(239,68,68,0.3)] text-red-400 hover:bg-red-600/20 hover:border-red-400 hover:text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500">
              Stop Listening
            </button>
          </div>
        ) : (
          <button type="button" onClick={startListening} className="p-2 rounded-full border border-white/20 bg-white/10 hover:bg-[#FFD700]/10 transition">
            <Mic className="text-white w-6 h-6" />
          </button>
        )}
      </div>
      {/* Onboarding/Help Text as a bulleted list (now below controls) */}
      <div className="mt-4">
        <ul className="list-disc list-inside space-y-1 inter-regular text-white/80 text-base">
          <li>Enter or speak your text below.</li>
          <li>Choose a model for analysis.</li>
          <li>Click <span className="text-[#FFD700] font-bold">Analyze</span> to see results.</li>
          <li><span className="text-[#FFD700] font-bold">Tip:</span> Use the mic for hands-free input!</li>
        </ul>
      </div>
    </form>
  );
};

export default InputBox;
