import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BrainCircuit,
  Sparkles,
  Send,
  RotateCcw,
  ShieldAlert,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Search,
  Filter,
  Package,
  Truck,
  ExternalLink,
  ChevronRight,
  Database,
  Info,
  Calendar,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { ApiClient } from '../services/api';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';

interface ChatSource {
  type: string;
  description: string;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  sources?: ChatSource[];
  timestamp: string;
  quickAction?: { label: string; url: string };
}

interface RiskShipment {
  shipmentId: string;
  trackingNumber: string;
  status: string;
  origin: string;
  destination: string;
  expectedDelivery: string;
  actualDelivery?: string;
  riskLevel: 'Low' | 'Medium' | 'High';
  riskType: string;
  reason: string;
  calculatedAt: string;
}

export const AiAssistantPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'chatbot' | 'methodology'>('dashboard');

  // Summary state
  const [summary, setSummary] = useState<any>(null);
  const [shipments, setShipments] = useState<RiskShipment[]>([]);
  const [mlStatus, setMlStatus] = useState<any>(null);
  const [loadingRisk, setLoadingRisk] = useState(true);

  // Filters state
  const [search, setSearch] = useState('');
  const [riskFilter, setRiskFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Chatbot state
  const [inputMessage, setInputMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const initialMessage: ChatMessage = {
    id: 'welcome',
    sender: 'bot',
    text: `### 👋 Welcome to CargoPulse AI Assistant\n\nI am your intelligent supply chain intelligence copilot. Every response is grounded directly in real PostgreSQL database records.\n\nYou can query live inventory quantities, active shipment telematics, pending purchase orders, or partner suppliers.`,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    sources: [{ type: 'system', description: 'CargoPulse Controlled Data Service' }],
  };

  const [messages, setMessages] = useState<ChatMessage[]>([initialMessage]);

  const suggestedQuestions = [
    'Which products have low stock?',
    'Where is shipment SH-10234?',
    'Show shipments currently in transit',
    'Which shipments are overdue?',
    'Show pending purchase orders',
    'Show our suppliers',
  ];

  // Fetch summary and risk data
  const fetchData = async () => {
    setLoadingRisk(true);
    try {
      const [sumRes, shipRes, mlRes] = await Promise.all([
        ApiClient.get('/ai/summary'),
        ApiClient.get('/ai/risk/shipments'),
        ApiClient.get('/ai/ml-status'),
      ]);

      if (sumRes.success) setSummary(sumRes.data);
      if (shipRes.success) setShipments(shipRes.shipments);
      if (mlRes.success) setMlStatus(mlRes.data);
    } catch (e) {
      console.error('Failed to load AI data:', e);
    } finally {
      setLoadingRisk(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (activeTab === 'chatbot') {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, activeTab]);

  // Handle chat submission
  const handleSendMessage = async (text?: string) => {
    const query = text || inputMessage;
    if (!query.trim() || isSending) return;

    const userMsg: ChatMessage = {
      id: 'user-' + Date.now(),
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    if (!text) setInputMessage('');
    setIsSending(true);

    try {
      const res = await ApiClient.post('/ai/chat', { message: query });
      if (res && res.success) {
        const botMsg: ChatMessage = {
          id: 'bot-' + Date.now(),
          sender: 'bot',
          text: res.answer,
          sources: res.sources,
          timestamp: new Date(res.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          quickAction: res.quickAction,
        };
        setMessages(prev => [...prev, botMsg]);
      } else {
        const botMsg: ChatMessage = {
          id: 'bot-' + Date.now(),
          sender: 'bot',
          text: res.answer || 'No response returned from data service.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages(prev => [...prev, botMsg]);
      }
    } catch (err: any) {
      const errMsg: ChatMessage = {
        id: 'bot-err-' + Date.now(),
        sender: 'bot',
        text: '### ⚠️ Operational Error\nFailed to communicate with the controlled backend data service. Please retry.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, errMsg]);
    } finally {
      setIsSending(false);
    }
  };

  // Filtered shipments
  const filteredShipments = shipments.filter(s => {
    const matchesSearch = !search ||
      s.trackingNumber.toLowerCase().includes(search.toLowerCase()) ||
      s.shipmentId.toLowerCase().includes(search.toLowerCase()) ||
      s.origin.toLowerCase().includes(search.toLowerCase()) ||
      s.destination.toLowerCase().includes(search.toLowerCase()) ||
      s.reason.toLowerCase().includes(search.toLowerCase());

    const matchesRisk = riskFilter === 'ALL' || s.riskLevel.toUpperCase() === riskFilter;
    const matchesStatus = statusFilter === 'ALL' || s.status.toUpperCase() === statusFilter;

    return matchesSearch && matchesRisk && matchesStatus;
  });

  // Simple Markdown-style formatter
  const renderFormattedText = (raw: string) => {
    const lines = raw.split('\n');
    return (
      <div className="space-y-1.5 text-xs text-slate-800 leading-relaxed">
        {lines.map((line, i) => {
          if (!line.trim()) return <div key={i} className="h-1" />;

          if (line.startsWith('### ')) {
            return (
              <h4 key={i} className="font-bold text-slate-950 text-sm mt-1 mb-1">
                {line.replace('### ', '')}
              </h4>
            );
          }

          if (line.startsWith('#### ')) {
            return (
              <h5 key={i} className="font-bold text-slate-900 text-xs mt-1">
                {line.replace('#### ', '')}
              </h5>
            );
          }

          if (line.startsWith('* ') || line.startsWith('- ')) {
            const rawContent = line.replace(/^[*\-]\s+/, '');
            return (
              <div key={i} className="flex items-start gap-1.5 pl-1">
                <span className="text-orange-500 font-bold shrink-0 mt-0.5">•</span>
                <span dangerouslySetInnerHTML={{ __html: formatInline(rawContent) }} />
              </div>
            );
          }

          if (line.startsWith('|') && line.endsWith('|')) {
            if (line.includes('---')) return null;
            const cells = line.split('|').slice(1, -1).map(c => c.trim());
            return (
              <div key={i} className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2 bg-slate-50 p-2 rounded border border-slate-200/80 text-[11px] my-1 font-mono">
                {cells.map((c, ci) => (
                  <span key={ci} dangerouslySetInnerHTML={{ __html: formatInline(c) }} />
                ))}
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
      .replace(/`(.*?)`/g, '<code class="bg-orange-50 text-orange-600 px-1 py-0.5 rounded text-[11px] font-mono border border-orange-200 font-semibold">$1</code>');
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-500/15 border border-orange-500/30 text-orange-600">
              <BrainCircuit className="h-5 w-5" />
            </div>
            <div>
              <h1 className="font-serif text-2xl font-black tracking-tight text-slate-950 flex items-center gap-2">
                CargoPulse AI Assistant
                <span className="rounded-full bg-orange-50 px-2.5 py-0.5 text-[10px] font-extrabold text-orange-600 border border-orange-200">
                  Real Database Grounded
                </span>
              </h1>
              <p className="text-xs text-slate-500">
                Natural language data querying & transparent rule-based shipment delay prediction engine.
              </p>
            </div>
          </div>
        </div>

        {summary && (
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Clock className="h-3.5 w-3.5 text-slate-400" />
            <span>Analysis Calculated: <strong className="text-slate-800">{new Date(summary.lastAnalysisTime).toLocaleTimeString()}</strong></span>
          </div>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
            activeTab === 'dashboard'
              ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Layers className="h-3.5 w-3.5" />
          <span>Integrated Risk Dashboard</span>
        </button>

        <button
          onClick={() => setActiveTab('chatbot')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
            activeTab === 'chatbot'
              ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Sparkles className="h-3.5 w-3.5" />
          <span>AI Chatbot Console ({messages.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('methodology')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
            activeTab === 'methodology'
              ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Info className="h-3.5 w-3.5" />
          <span>Risk Rules & ML Status</span>
        </button>
      </div>

      {/* ================= TAB 1: INTEGRATED RISK DASHBOARD ================= */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          
          {/* Summary Metric Cards */}
          {summary && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="p-5 border-l-4 border-l-blue-500">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Total Analyzed</span>
                <div className="flex items-baseline justify-between mt-2">
                  <span className="text-3xl font-extrabold text-slate-900 font-mono">{summary.totalAnalyzed}</span>
                  <span className="text-xs text-blue-600 font-semibold">Active Consignments</span>
                </div>
              </Card>

              <Card className="p-5 border-l-4 border-l-rose-500">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Overdue Deliveries</span>
                <div className="flex items-baseline justify-between mt-2">
                  <span className="text-3xl font-extrabold text-rose-600 font-mono">{summary.overdueCount}</span>
                  <span className="text-xs text-rose-600 font-semibold">ETA Passed</span>
                </div>
              </Card>

              <Card className="p-5 border-l-4 border-l-amber-500">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Flagged by Risk Rules</span>
                <div className="flex items-baseline justify-between mt-2">
                  <span className="text-3xl font-extrabold text-amber-600 font-mono">{summary.flaggedRiskCount}</span>
                  <span className="text-xs text-amber-600 font-semibold">High / Medium</span>
                </div>
              </Card>

              <Card className="p-5 border-l-4 border-l-emerald-500">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Risk Distribution</span>
                <div className="flex items-center gap-2 mt-3 text-xs">
                  <span className="rounded bg-rose-100 text-rose-800 font-bold px-2 py-0.5">{summary.riskDistribution.high} High</span>
                  <span className="rounded bg-amber-100 text-amber-800 font-bold px-2 py-0.5">{summary.riskDistribution.medium} Med</span>
                  <span className="rounded bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5">{summary.riskDistribution.low} Low</span>
                </div>
              </Card>
            </div>
          )}

          {/* AI Insights Banner */}
          <div className="rounded-2xl border border-orange-200 bg-gradient-to-r from-orange-50 via-amber-50/50 to-white p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-500 text-white shadow-md shadow-orange-500/30">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-serif text-sm font-bold text-slate-950">
                  AI Operational Intelligence Insight
                </h3>
                <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                  Currently <strong>{summary?.overdueCount || 0} shipments</strong> have breached their scheduled delivery windows.
                  Highway corridor NH-44 near Krishnagiri ghat section reports severe line-haul delays due to weather waterlogging.
                </p>
              </div>
            </div>
            <Button
              size="sm"
              variant="primary"
              className="bg-orange-500 hover:bg-orange-600 text-white font-bold shrink-0"
              onClick={() => {
                setActiveTab('chatbot');
                handleSendMessage('Which shipments are overdue?');
              }}
            >
              Analyze in Chat &rarr;
            </Button>
          </div>

          {/* Risk Table Section */}
          <div className="space-y-4">
            
            {/* Filter Bar */}
            <div className="flex flex-wrap gap-3 items-center justify-between">
              <div className="relative flex-1 min-w-[260px] max-w-md">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Filter by tracking #, origin, destination or risk reason..."
                  className="w-full rounded-xl border border-slate-300 bg-white py-2 pl-10 pr-4 text-xs text-slate-900 placeholder-slate-400 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500">Risk Level:</span>
                <select
                  value={riskFilter}
                  onChange={e => setRiskFilter(e.target.value)}
                  className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-800 outline-none focus:border-orange-500"
                >
                  <option value="ALL">All Risk Levels</option>
                  <option value="HIGH">High Risk</option>
                  <option value="MEDIUM">Medium Risk</option>
                  <option value="LOW">Low Risk</option>
                </select>

                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-800 outline-none focus:border-orange-500"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="IN_TRANSIT">In-Transit</option>
                  <option value="DELAYED">Delayed</option>
                  <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
                  <option value="DELIVERED">Delivered</option>
                </select>
              </div>
            </div>

            {/* Table */}
            <Card className="overflow-hidden border border-slate-200">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                    <tr>
                      <th className="px-4 py-3">Tracking / ID</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Corridor</th>
                      <th className="px-4 py-3">Scheduled ETA</th>
                      <th className="px-4 py-3">Risk Level</th>
                      <th className="px-4 py-3">Risk Type</th>
                      <th className="px-4 py-3">Deterministic Reason</th>
                      <th className="px-4 py-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredShipments.map(s => {
                      const riskColor = s.riskLevel === 'High' ? 'bg-rose-100 text-rose-800 border-rose-200' :
                        s.riskLevel === 'Medium' ? 'bg-amber-100 text-amber-800 border-amber-200' :
                        'bg-emerald-100 text-emerald-800 border-emerald-200';

                      return (
                        <tr key={s.shipmentId} className="hover:bg-slate-50/80 transition">
                          <td className="px-4 py-3 font-mono font-bold text-slate-900">
                            {s.trackingNumber}
                          </td>
                          <td className="px-4 py-3">
                            <span className="rounded bg-slate-100 px-2 py-0.5 font-mono text-[10px] font-bold text-slate-700">
                              {s.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-slate-700 max-w-[180px] truncate" title={`${s.origin} -> ${s.destination}`}>
                            {s.origin} &rarr; {s.destination}
                          </td>
                          <td className="px-4 py-3 text-slate-600 font-mono text-[11px]">
                            {new Date(s.expectedDelivery).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-block rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${riskColor}`}>
                              {s.riskLevel}
                            </span>
                          </td>
                          <td className="px-4 py-3 font-semibold text-slate-800">
                            {s.riskType}
                          </td>
                          <td className="px-4 py-3 text-slate-600 max-w-[240px]">
                            <p className="line-clamp-2 leading-relaxed text-[11px]">{s.reason}</p>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button
                              onClick={() => {
                                setActiveTab('chatbot');
                                handleSendMessage(`Where is shipment ${s.trackingNumber}?`);
                              }}
                              className="inline-flex items-center gap-1 rounded-lg bg-slate-100 hover:bg-orange-500 hover:text-white px-2.5 py-1 text-[11px] font-bold text-slate-700 transition"
                            >
                              <span>Ask AI</span>
                              <ChevronRight className="h-3 w-3" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>

          </div>

        </div>
      )}

      {/* ================= TAB 2: AI CHATBOT CONSOLE ================= */}
      {activeTab === 'chatbot' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Main Chat Box */}
          <div className="lg:col-span-8 flex flex-col h-[650px] rounded-2xl border border-slate-200 bg-white shadow-xl overflow-hidden">
            
            {/* Chat Header */}
            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-950 px-5 py-3.5 text-white">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500/20 border border-orange-500/40">
                  <img src="/cargopulse-logo.png" alt="Logo" className="h-5 w-5 object-contain" />
                </div>
                <div>
                  <h3 className="font-serif text-sm font-bold text-white flex items-center gap-2">
                    CargoPulse Natural Language Query Console
                  </h3>
                  <p className="text-[10px] text-slate-400">
                    Direct access via parameterized backend services &bull; Zero hallucination
                  </p>
                </div>
              </div>

              <button
                onClick={() => setMessages([initialMessage])}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white transition"
                title="Restart conversation"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>

            {/* Messages Scroll Area */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-50/50">
              {messages.map(msg => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl p-4 shadow-xs text-xs ${
                      msg.sender === 'user'
                        ? 'bg-orange-500 text-white rounded-br-none'
                        : 'bg-white border border-slate-200 text-slate-900 rounded-bl-none shadow-sm'
                    }`}
                  >
                    {msg.sender === 'user' ? (
                      <p className="font-semibold whitespace-pre-wrap">{msg.text}</p>
                    ) : (
                      <>
                        {renderFormattedText(msg.text)}

                        {/* Citation Sources Badge */}
                        {msg.sources && msg.sources.length > 0 && (
                          <div className="mt-3 pt-2.5 border-t border-slate-100 flex flex-wrap items-center gap-1.5 text-[10px] text-slate-500">
                            <span className="font-bold text-slate-400">Data Source:</span>
                            {msg.sources.map((s, idx) => (
                              <span key={idx} className="rounded bg-slate-100 px-2 py-0.5 font-mono text-[9px] font-semibold text-slate-700 border border-slate-200">
                                {s.type}: {s.description}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Quick Action Button */}
                        {msg.quickAction && (
                          <div className="mt-3 pt-2 border-t border-slate-100">
                            <button
                              onClick={() => navigate(msg.quickAction!.url)}
                              className="flex items-center gap-1.5 rounded-lg bg-slate-900 text-white px-3 py-1.5 text-[11px] font-bold hover:bg-orange-600 transition shadow-xs"
                            >
                              <span>{msg.quickAction.label}</span>
                              <ChevronRight className="h-3 w-3" />
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  <span className="text-[10px] text-slate-400 mt-1 px-1">
                    {msg.timestamp}
                  </span>
                </div>
              ))}

              {isSending && (
                <div className="flex items-center gap-2 rounded-2xl bg-white border border-slate-200 p-3.5 max-w-[160px] shadow-sm">
                  <div className="flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-orange-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="h-2 w-2 rounded-full bg-orange-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="h-2 w-2 rounded-full bg-orange-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                  <span className="text-[11px] text-slate-500 font-medium">Querying database...</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <div className="border-t border-slate-200 bg-white p-3.5">
              <form
                onSubmit={e => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={inputMessage}
                  onChange={e => setInputMessage(e.target.value)}
                  placeholder="Ask about inventory, shipments, purchase orders, or suppliers..."
                  className="flex-1 rounded-xl border border-slate-300 bg-slate-50 px-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 outline-none focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-500/20"
                />
                <button
                  type="submit"
                  disabled={!inputMessage.trim() || isSending}
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-500 text-white shadow-md hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
            </div>

          </div>

          {/* Right Panel: Suggested Questions & Query Guide */}
          <div className="lg:col-span-4 space-y-4">
            
            <Card className="p-5">
              <h3 className="font-serif text-sm font-bold text-slate-900 mb-2 flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-orange-500" />
                Suggested Inquiries
              </h3>
              <p className="text-xs text-slate-500 mb-3">
                Click any prompt to execute a parameter-validated database search:
              </p>
              <div className="space-y-2">
                {suggestedQuestions.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(q)}
                    className="w-full text-left rounded-xl border border-slate-200 bg-slate-50 hover:bg-orange-50 hover:border-orange-300 p-2.5 text-xs font-semibold text-slate-800 transition flex items-center justify-between"
                  >
                    <span>{q}</span>
                    <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                  </button>
                ))}
              </div>
            </Card>

            <Card className="p-5 bg-slate-50 border-slate-200">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 flex items-center gap-1.5">
                <Database className="h-3.5 w-3.5 text-slate-500" />
                Security & Data Access Architecture
              </h3>
              <ul className="text-xs text-slate-600 space-y-2 list-disc list-inside">
                <li>No unrestricted raw SQL execution allowed.</li>
                <li>Queries route through controlled functions (e.g., <code className="text-orange-600 font-mono">getLowStockProducts()</code>).</li>
                <li>Role-based access permissions are enforced before retrieval.</li>
                <li>Answers state when data is unavailable rather than fabricating answers.</li>
              </ul>
            </Card>

          </div>

        </div>
      )}

      {/* ================= TAB 3: METHODOLOGY & ML STATUS ================= */}
      {activeTab === 'methodology' && (
        <div className="space-y-6 max-w-4xl">
          
          <Card className="p-6">
            <h2 className="font-serif text-lg font-bold text-slate-950 mb-2">
              Transparent Rule-Based Risk Detection (Active)
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              CargoPulse classifies shipment risk using 5 deterministic, fully documented rules based on verified timestamps and live telematics:
            </p>

            <div className="space-y-3">
              {summary?.rulesetDocumentation?.map((r: any, idx: number) => (
                <div key={idx} className="rounded-xl border border-slate-200 bg-white p-4">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-xs font-bold text-slate-900">{idx + 1}. {r.rule}</h4>
                    <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700 border border-slate-200">
                      Severity: {r.weight}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{r.description}</p>
                </div>
              ))}
            </div>
          </Card>

          {mlStatus && (
            <Card className="p-6 border-l-4 border-l-purple-500">
              <div className="flex items-center justify-between mb-2">
                <h2 className="font-serif text-lg font-bold text-slate-950 flex items-center gap-2">
                  <BrainCircuit className="h-5 w-5 text-purple-600" />
                  Machine Learning Feasibility Evaluation
                </h2>
                <span className="rounded-full bg-purple-100 text-purple-800 text-[10px] font-bold px-3 py-1">
                  STATUS: {mlStatus.status}
                </span>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                {mlStatus.recommendation}
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs mb-4">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <span className="text-[10px] text-slate-500 font-bold uppercase">Total Trip Records</span>
                  <p className="text-lg font-bold text-slate-900 font-mono mt-1">{mlStatus.currentRecords}</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <span className="text-[10px] text-slate-500 font-bold uppercase">Delivered Samples</span>
                  <p className="text-lg font-bold text-slate-900 font-mono mt-1">{mlStatus.labeledDeliveredSamples}</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <span className="text-[10px] text-slate-500 font-bold uppercase">Delayed Samples</span>
                  <p className="text-lg font-bold text-slate-900 font-mono mt-1">{mlStatus.labeledDelayedSamples}</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <span className="text-[10px] text-slate-500 font-bold uppercase">Target Threshold</span>
                  <p className="text-lg font-bold text-purple-700 font-mono mt-1">{mlStatus.recommendedSampleSize}+</p>
                </div>
              </div>

              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Identified Feature Space for Future Model Training:
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {mlStatus.identifiedFeatures?.map((f: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-2.5">
                    <span className="font-mono text-[11px] font-bold text-slate-900">{f.feature}</span>
                    <span className="text-[10px] text-slate-500">{f.description}</span>
                  </div>
                ))}
              </div>
            </Card>
          )}

        </div>
      )}

    </div>
  );
};
