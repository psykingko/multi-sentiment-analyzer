// InputBox.jsx
import { useState, useRef, Fragment } from "react";
import { Mic, MicOff } from "lucide-react";
import { Listbox, Transition } from '@headlessui/react';
import { ChevronUpDownIcon, CheckIcon, InformationCircleIcon } from '@heroicons/react/24/outline';


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
      onSubmit={e => { if (e) e.preventDefault(); handleClick(); }}
      autoComplete="off"
    >
      {/* Model selection dropdown (Headless UI Listbox) */}
      <div className="mb-4 flex flex-col md:flex-row  items-center gap-2 w-full">
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
      <div className="relative w-full">
        <textarea
          className="w-full h-32 p-3 pr-10 border border-white/20 rounded-xl shadow-sm resize-none text-white bg-[#181A1B] inter-regular focus:ring-2 focus:ring-accent focus:border-accent transition placeholder-white/40"
          placeholder="Type or speak a paragraph..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={loading}
        />
        {text && (
          <button
            type="button"
            aria-label="Clear text"
            className="absolute top-2 right-3 text-white/60 hover:text-red-400 bg-transparent p-1 rounded-full focus:outline-none focus:ring-2 focus:ring-red-400"
            style={{ zIndex: 2 }}
            onClick={() => setText("")}
            tabIndex={0}
          >
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2"><line x1="6" y1="6" x2="14" y2="14"/><line x1="14" y1="6" x2="6" y2="14"/></svg>
          </button>
        )}
      </div>
      <div className="flex flex-col sm:flex-row items-center justify-between mt-3 w-full gap-3">
        <div className="flex w-full items-center gap-2">
          <button
            type="submit"
            className="transition-all duration-200 px-8 py-2 bg-[#FFD700] text-black rounded-full unbounded-bold shadow-lg hover:scale-105 border-2 border-[#FFD700]/80 focus:outline-none focus:ring-2 focus:ring-[#FFD700] flex-grow text-center disabled:opacity-100 "
            disabled={loading || !text.trim()}
            style={{ minWidth: 120 }}
          >
            Analyze
          </button>
          <div className="flex items-center gap-2 flex-shrink-0">
            {listening ? (
              <>
                {/* Animated mic with waves */}
                <span className="relative flex items-center ml-1 mr-1">
                  <span className="absolute inset-0 flex items-center justify-center">
                    <span className="animate-ping absolute inline-flex h-8 w-8 rounded-full bg-[#FFD700]/40 opacity-75"></span>
                    <span className="animate-pulse absolute inline-flex h-12 w-12 rounded-full border-2 border-[#FFD700]/30"></span>
                  </span>
                  <Mic className="text-[#FFD700] w-7 h-7 relative z-10" />
                </span>
                <button
                  type="button"
                  onClick={stopListening}
                  className="px-3 py-2 rounded-md text-xs font-semibold bg-[#181A1B] border border-red-400 text-red-400 hover:bg-red-500/10 hover:text-white transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-red-500 whitespace-nowrap ml-1"
                  style={{ minWidth: 90 }}
                >
                  Stop Listening
                </button>
              </>
            ) : (
              <button type="button" onClick={startListening} className="p-2 rounded-full border border-white/20 bg-white/10 hover:bg-[#FFD700]/10 transition ml-2">
                <Mic className="text-white w-6 h-6" />
              </button>
            )}
          </div>
        </div>
      </div>
      {/* Onboarding/Help Text as a bulleted list (now below controls) */}
      <div className="mt-4">
        <ul className="list-disc list-inside space-y-1 inter-regular text-white/90 text-base">
          <li>Enter or speak your text below.</li>
          <li>Choose a model for analysis.</li>
          <li>Click <span className="text-[#FFD700] font-bold">Analyze</span> to see results.</li>
          <li><span className="text-[#FFD700] font-bold">Scroll</span> down to check results.</li>
          <li><span className="text-[#FFD700] font-bold">Tip:</span> Use the mic for hands-free input!</li>
        </ul>
      </div>
    </form>
  );
};

export default InputBox;
