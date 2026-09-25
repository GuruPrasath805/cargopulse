import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Bot, 
  Send, 
  X, 
  Sparkles, 
  Minimize2, 
  ChevronRight, 
  RotateCcw, 
  ExternalLink,
  HelpCircle,
  Package,
  Truck,
  ShieldCheck,
  Building2,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { ApiClient } from '../services/api';

interface Message {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  time: string;
  suggestions?: string[];
  quickAction?: { label: string; url: string };
}

export const AiGuidanceBot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Determine current portal context based on route
  const getPortalContext = () => {
    const p = location.pathname;
    if (p.startsWith('/warehouse')) return { name: 'Warehouse Operations', code: 'WAREHOUSE', icon: Package };
    if (p.startsWith('/logistics')) return { name: 'Logistics & Fleet Control', code: 'LOGISTICS', icon: Truck };
    if (p.startsWith('/supplier')) return { name: 'Supplier Network', code: 'SUPPLIER', icon: Building2 };
    if (p.startsWith('/customer')) return { name: 'Customer & Consignee', code: 'CUSTOMER', icon: CheckCircle2 };
    if (p.startsWith('/admin')) return { name: 'Admin Console', code: 'ADMIN', icon: ShieldCheck };
    return { name: 'CargoPulse Platform', code: 'GENERAL', icon: Sparkles };
  };

  const portal = getPortalContext();
  const PortalIcon = portal.icon;

  const defaultSuggestions = [
    'Check stockout predictions',
    'Where is shipment SH-10021?',
    'Warehouse bin put-away SOP',
    'Delayed freight corridors',
    'Supplier PO SLA rules',
    'How do I file an RMA return?',
  ];

  const [activeSuggestions, setActiveSuggestions] = useState<string[]>(defaultSuggestions);

  const initialBotMessage: Message = {
    id: 'msg-welcome',
    sender: 'bot',
    text: `### 👋 Welcome to PulseAI Copilot!\n\nI am your real-time operational assistant for **${portal.name}**.\n\nAsk me anything about stockout forecasts, live truck telematics, warehouse bin layouts, supplier PO compliance, or return requests!`,
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    suggestions: activeSuggestions.slice(0, 3),
  };

  const [messages, setMessages] = useState<Message[]>([initialBotMessage]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || input;
    if (!textToSend.trim() || isLoading) return;

    const userMsg: Message = {
      id: 'user-' + Date.now(),
      sender: 'user',
      text: textToSend,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    if (!queryText) setInput('');
    setIsLoading(true);

    try {
      const res = await ApiClient.post('/ai/chat', {
        message: textToSend,
        context: {
          portal: portal.code,
          currentPath: location.pathname,
        },
      });

      const replyText = res?.answer || res?.reply;
      if (res && replyText) {
        const botMsg: Message = {
          id: 'bot-' + Date.now(),
          sender: 'bot',
          text: replyText,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          suggestions: res.suggestions,
          quickAction: res.quickAction,
        };
        setMessages(prev => [...prev, botMsg]);
        if (res.suggestions && res.suggestions.length > 0) {
          setActiveSuggestions(res.suggestions);
        }
      }
    } catch (err) {
      const errorMsg: Message = {
        id: 'bot-err-' + Date.now(),
        sender: 'bot',
        text: `### ⚠️ Connection Notice\nCould not reach the intelligence service. You can still browse portals directly or retry your query.`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setMessages([
      {
        ...initialBotMessage,
        id: 'msg-' + Date.now(),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  // Simple Markdown-style formatter for bot replies
  const renderFormattedText = (text: string) => {
    const lines = text.split('\n');
    return (
      <div className="space-y-1.5 text-xs text-slate-800 leading-relaxed">
        {lines.map((line, i) => {
          if (!line.trim()) return <div key={i} className="h-1" />;
          
          if (line.startsWith('### ')) {
            return (
              <h4 key={i} className="font-bold text-slate-950 text-sm mt-1 mb-1 flex items-center gap-1.5">
                {line.replace('### ', '')}
              </h4>
            );
          }

          if (line.startsWith('- ')) {
            const rawContent = line.replace('- ', '');
            return (
              <div key={i} className="flex items-start gap-1.5 pl-1">
                <span className="text-orange-500 font-bold shrink-0 mt-0.5">•</span>
                <span dangerouslySetInnerHTML={{ __html: formatInline(rawContent) }} />
              </div>
            );
          }

          if (/^\d+\./.test(line)) {
            return (
              <div key={i} className="pl-1">
                <span dangerouslySetInnerHTML={{ __html: formatInline(line) }} />
              </div>
            );
          }

          return (
            <p key={i} dangerouslySetInnerHTML={{ __html: formatInline(line) }} />
          );
        })}
      </div>
    );
  };

  const formatInline = (str: string) => {
    return str
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-slate-950">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="italic text-slate-600">$1</em>')
      .replace(/`(.*?)`/g, '<code class="bg-orange-50 text-orange-600 px-1 py-0.5 rounded text-[11px] font-mono border border-orange-200/60 font-semibold">$1</code>');
  };

  return (
    <>
      {/* FLOATING LAUNCHER BUTTON */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-full bg-slate-950 p-2 pr-4 shadow-2xl border border-orange-500/40 hover:border-orange-500 hover:scale-105 active:scale-95 transition-all duration-300 group"
          title="Open PulseAI Operational Copilot"
        >
          <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-tr from-orange-500 to-amber-500 shadow-lg shadow-orange-500/30">
            <img src="/cargopulse-logo.png" alt="CargoPulse" className="h-6 w-6 object-contain" />
            <span className="absolute -top-0.5 -right-0.5 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500"></span>
            </span>
          </div>
          <div className="text-left hidden sm:block">
            <div className="flex items-center gap-1.5">
              <span className="font-serif text-xs font-bold text-white tracking-wide">PulseAI</span>
              <span className="rounded bg-orange-500/20 px-1.5 py-0.2 text-[9px] font-bold text-orange-400 border border-orange-500/30">
                Copilot
              </span>
            </div>
            <p className="text-[10px] text-slate-400">Ask for live guidance &bull; 24/7</p>
          </div>
        </button>
      )}

      {/* EXPANDED CHAT PANEL */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 flex h-[580px] max-h-[calc(100vh-100px)] w-[410px] max-w-[calc(100vw-32px)] flex-col rounded-2xl bg-white border border-slate-200 shadow-2xl shadow-slate-900/20 overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-200">
          
          {/* HEADER */}
          <div className="flex items-center justify-between border-b border-slate-200 bg-slate-950 px-4 py-3 text-white">
            <div className="flex items-center gap-2.5">
              <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500/20 border border-orange-500/40">
                <img src="/cargopulse-logo.png" alt="CargoPulse" className="h-5 w-5 object-contain" />
                <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-emerald-400" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-serif text-sm font-bold text-white">PulseAI</span>
                  <span className="rounded bg-orange-500 px-1.5 py-0.5 text-[9px] font-bold text-white">
                    Operations Copilot
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-slate-400">
                  <PortalIcon className="h-2.5 w-2.5 text-orange-400" />
                  <span>{portal.name}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => {
                  setIsOpen(false);
                  navigate('/ai-assistant');
                }}
                className="rounded-lg p-1.5 text-orange-400 hover:bg-white/10 hover:text-orange-300 transition"
                title="Open Full AI & Risk Dashboard"
              >
                <ExternalLink className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={handleReset}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white transition"
                title="Restart conversation"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white transition"
                title="Minimize assistant"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* ACTIVE CONTEXT PILL */}
          <div className="flex items-center justify-between bg-orange-50/70 border-b border-orange-100 px-4 py-1.5 text-[11px] text-orange-800">
            <span className="flex items-center gap-1 font-medium">
              <span className="h-1.5 w-1.5 rounded-full bg-orange-500 animate-pulse" />
              Active Context: <strong className="font-bold">{portal.name}</strong>
            </span>
            <span className="text-[10px] text-orange-600/80 font-mono">Live DB Connected</span>
          </div>

          {/* MESSAGES LIST */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50/50">
            {messages.map(msg => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[88%] rounded-2xl p-3.5 shadow-sm text-xs ${
                    msg.sender === 'user'
                      ? 'bg-orange-500 text-white rounded-br-none'
                      : 'bg-white border border-slate-200 text-slate-900 rounded-bl-none'
                  }`}
                >
                  {msg.sender === 'user' ? (
                    <p className="font-medium whitespace-pre-wrap">{msg.text}</p>
                  ) : (
                    renderFormattedText(msg.text)
                  )}

                  {/* QUICK ACTION BUTTON */}
                  {msg.quickAction && (
                    <div className="mt-3 pt-2.5 border-t border-slate-100">
                      <button
                        onClick={() => {
                          navigate(msg.quickAction!.url);
                        }}
                        className="flex items-center gap-1.5 rounded-lg bg-slate-900 text-white px-3 py-1.5 text-[11px] font-bold hover:bg-orange-600 transition shadow-sm"
                      >
                        <span>{msg.quickAction.label}</span>
                        <ChevronRight className="h-3 w-3" />
                      </button>
                    </div>
                  )}
                </div>

                <span className="text-[9px] text-slate-400 mt-1 px-1">
                  {msg.time}
                </span>
              </div>
            ))}

            {isLoading && (
              <div className="flex items-center gap-2 rounded-2xl bg-white border border-slate-200 p-3 max-w-[140px] shadow-sm">
                <div className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-orange-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="h-2 w-2 rounded-full bg-orange-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="h-2 w-2 rounded-full bg-orange-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
                <span className="text-[10px] text-slate-500 font-medium">PulseAI thinking...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* SUGGESTIONS CHIPS */}
          <div className="border-t border-slate-200 bg-white p-2">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 px-1">
              Suggested Directives
            </p>
            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {activeSuggestions.slice(0, 4).map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(s)}
                  className="shrink-0 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-medium text-slate-700 hover:border-orange-500 hover:bg-orange-50 hover:text-orange-700 transition"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* INPUT BAR */}
          <div className="border-t border-slate-200 bg-white p-3">
            <form
              onSubmit={e => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder={`Ask PulseAI about ${portal.name}...`}
                className="flex-1 rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 outline-none focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-500/20"
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="flex h-8 w-8 items-center justify-center rounded-xl bg-orange-500 text-white shadow-md hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                <Send className="h-3.5 w-3.5" />
              </button>
            </form>
          </div>

        </div>
      )}
    </>
  );
};
