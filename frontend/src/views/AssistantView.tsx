import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Send,
  Sparkles,
  User,
  ShieldAlert,
  ArrowRight,
  HelpCircle,
  Lightbulb,
  MapPin
} from 'lucide-react';
import { ChatMessage, HouseholdPreferences } from '../types';

interface AssistantViewProps {
  currentLocationName: string;
  currentAqi: number;
  dominantPollutant: string;
  preferences: HouseholdPreferences;
  onNavigateTab: (tab: string) => void;
  onSelectLocation?: (locationName: string) => void;
}

export const AssistantView: React.FC<AssistantViewProps> = ({
  currentLocationName,
  currentAqi,
  dominantPollutant,
  preferences,
  onNavigateTab,
  onSelectLocation,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: `Hello! I am your AirAware environmental health companion. Right now around ${currentLocationName}, the measured AQI is ${currentAqi} with ${dominantPollutant} dominating.\n\nYou can ask me about ANY location (e.g. "What is the air quality in Satara?", "Compare Pune and Delhi", "Is it safe to jog outside?"). How can I assist you?`,
      timestamp: 'Just now',
      pills: [
        { label: 'Air quality in Satara right now', type: 'prompt' },
        { label: 'Compare air in Pune and Mumbai', type: 'prompt' },
        { label: 'Can I go for a walk today?', type: 'prompt' },
        { label: 'Should I open my windows?', type: 'prompt' },
      ],
    },
  ]);

  const [inputVal, setInputVal] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || inputVal;
    if (!text.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: String(Date.now()),
      sender: 'user',
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputVal('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text.trim(),
          latitude: 19.0760,
          longitude: 72.8777,
          locationName: currentLocationName,
          currentAqi,
          dominantPollutant,
          householdProfiles: preferences.profiles,
          budgetPreference: preferences.budgetPreference,
        }),
      });

      const data = await res.json();
      const botMsg: ChatMessage = {
        id: String(Date.now() + 1),
        sender: 'assistant',
        text: data.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        pills: data.actionablePills,
        healthNotice: data.healthNotice,
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (e) {
      console.error(e);
      const errorMsg: ChatMessage = {
        id: String(Date.now() + 1),
        sender: 'assistant',
        text: 'Unable to reach the assistant service right now. Please verify your connection or try again shortly.',
        timestamp: 'Just now',
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-170px)] rounded-3xl bg-[#151B16] border border-[#273128] overflow-hidden shadow-2xl">
      {/* Assistant Header */}
      <div className="p-4 md:px-6 bg-[#101510] border-b border-[#273128] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#B7F56A] to-[#65C46D] flex items-center justify-center text-[#080B09]">
            <Bot className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-[#F2F5F1]">AirAware AI Companion</h3>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#1B231C] text-[#B7F56A] border border-[#344A35]">
                Multi-City Global Search
              </span>
            </div>
            <p className="text-[11px] text-[#9BA69B]">
              Active context: {currentLocationName} • AQI {currentAqi} • {dominantPollutant}
            </p>
          </div>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold ${
                  isUser
                    ? 'bg-[#1B231C] text-[#B7F56A] border border-[#344A35]'
                    : 'bg-[#B7F56A] text-[#080B09]'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div className={`space-y-2 max-w-[85%] md:max-w-xl ${isUser ? 'text-right' : 'text-left'}`}>
                <div
                  className={`p-4 rounded-2xl text-xs md:text-sm leading-relaxed whitespace-pre-wrap ${
                    isUser
                      ? 'bg-[#B7F56A] text-[#080B09] font-medium'
                      : 'bg-[#101510] border border-[#273128] text-[#F2F5F1]'
                  }`}
                >
                  {msg.text}
                </div>

                {/* Optional Pill Suggestions */}
                {msg.pills && msg.pills.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {msg.pills.map((p, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          if (p.type === 'switch_location' && onSelectLocation) {
                            const cleanName = p.label.replace('Switch to ', '').trim();
                            onSelectLocation(cleanName);
                            onNavigateTab('overview');
                          } else if (p.type === 'switch_view') {
                            if (p.label.toLowerCase().includes('routine') || p.label.toLowerCase().includes('planner')) {
                              onNavigateTab('planner');
                            } else if (p.label.toLowerCase().includes('indoor')) {
                              onNavigateTab('indoor');
                            }
                          } else {
                            handleSend(p.label);
                          }
                        }}
                        className="text-xs px-2.5 py-1 rounded-xl bg-[#1B231C] hover:bg-[#344A35]/50 text-[#B7F56A] border border-[#344A35] transition-all flex items-center gap-1"
                      >
                        {p.type === 'switch_location' && <MapPin className="w-3 h-3 text-[#B7F56A]" />}
                        <span>{p.label}</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    ))}
                  </div>
                )}

                {msg.healthNotice && (
                  <div className="text-[10px] text-[#9BA69B] italic flex items-center gap-1 pt-1">
                    <ShieldAlert className="w-3 h-3 text-[#FACC15]" />
                    <span>{msg.healthNotice}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#B7F56A] text-[#080B09] flex items-center justify-center">
              <Bot className="w-4 h-4 animate-spin" />
            </div>
            <div className="p-3.5 rounded-2xl bg-[#101510] border border-[#273128] text-xs text-[#9BA69B] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#B7F56A] animate-ping" />
              <span>Fetching real-time data & evaluating environmental metrics...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Box */}
      <div className="p-3 md:p-4 bg-[#101510] border-t border-[#273128]">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            placeholder="Ask about air in Satara, Nashik, London, or ask for routine & window advice..."
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            className="flex-1 bg-[#151B16] border border-[#273128] focus:border-[#B7F56A] rounded-xl px-4 py-2.5 text-xs md:text-sm text-[#F2F5F1] placeholder-[#9BA69B]/60 focus:outline-none transition-all"
          />
          <button
            type="submit"
            disabled={!inputVal.trim() || loading}
            className="p-2.5 rounded-xl bg-[#B7F56A] disabled:opacity-40 text-[#080B09] hover:bg-[#65C46D] transition-all font-bold shrink-0 shadow-md shadow-[#B7F56A]/20"
          >
            <Send className="w-4 h-4 stroke-[2.5]" />
          </button>
        </form>
      </div>
    </div>
  );
};
