import { useState, useRef, useEffect } from "react";
import useCitizenShield from "../../hooks/useCitizenShield";

const CONTEXT_TYPES = [
  { key: "call", icon: "📞", label: "Call" },
  { key: "sms", icon: "💬", label: "SMS" },
  { key: "upi", icon: "💸", label: "UPI" },
  { key: "email", icon: "📧", label: "Email" },
];

const QUICK_ACTIONS = [
  { label: "Fake CBI Call", contextType: "call", message: 'Someone called claiming to be a CBI officer. They said my Aadhaar is linked to a money laundering case and I need to transfer Rs 50,000 to a "safe government account" immediately or I will be arrested. They told me not to disconnect the video call.' },
  { label: "UPI Scam Request", contextType: "upi", message: "Received a message: 'Your UPI ID has been selected for a cashback of Rs 5,000. Click here to claim: https://upi-reward-claim.in/verify and enter your UPI PIN to receive the amount.'" },
  { label: "OTP Phishing", contextType: "sms", message: "SMS: 'Dear Customer, Your SBI account will be blocked in 24 hours. Update KYC immediately by clicking https://sbi-kyc-update.net. Enter your OTP to verify. - SBI Team'" },
  { label: "Phishing Email", contextType: "email", message: "Subject: Urgent - Your Income Tax Refund of Rs 15,000 is pending. Click here to claim before it expires. You need to verify your PAN, Aadhaar and bank account details to process the refund. From: incometax-refund@govt-india.org" },
];

const VERDICT_STYLES = {
  DANGEROUS: { bg: "bg-[#E5484D]/5", border: "border-[#E5484D]/20", text: "text-[#E5484D]", icon: "🔴", barColor: "#E5484D", pillBg: "bg-[#E5484D]/10" },
  SUSPICIOUS: { bg: "bg-amber-500/5", border: "border-amber-500/20", text: "text-amber-600", icon: "⚠️", barColor: "#f59e0b", pillBg: "bg-amber-500/10" },
  SAFE: { bg: "bg-[#0F9D78]/5", border: "border-[#0F9D78]/20", text: "text-[#0F9D78]", icon: "✅", barColor: "#0F9D78", pillBg: "bg-[#0F9D78]/10" },
};

const renderFormattedText = (text) => {
  if (!text) return null;
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="font-semibold">{part.slice(2, -2)}</strong>;
    }
    return <span key={i}>{part}</span>;
  });
};

export default function CitizenShieldWorkspace() {
  const [inputText, setInputText] = useState("");
  const [contextType, setContextType] = useState("call");
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);

  const {
    messages,
    isAnalyzing,
    error,
    stats,
    engineMode,
    submitMessage,
    generateReport,
    clearChat,
  } = useCitizenShield();

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isAnalyzing]);

  const handleSubmit = () => {
    if (!inputText.trim() || isAnalyzing) return;
    submitMessage(inputText, contextType);
    setInputText("");
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.focus();
    }
  };

  const handleQuickAction = (action) => {
    if (isAnalyzing) return;
    setContextType(action.contextType);
    submitMessage(action.message, action.contextType);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="fixed top-0 left-0 right-0 bottom-0 z-40 flex flex-col bg-slate-50 font-sans text-slate-900 overflow-hidden">
      
      {/* ── HEADER ── */}
      <div className="sticky top-0 z-20 flex items-center justify-between px-6 py-4 bg-white/80 backdrop-blur-md border-b border-slate-200/60 shadow-sm w-full shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1A3FA0] to-[#1A3FA0]/70 flex items-center justify-center shadow-md">
            <span className="text-xl text-white">🛡️</span>
          </div>
          <div>
            <h2 className="text-[#1A3FA0] font-bold text-lg leading-tight tracking-tight">Citizen Fraud Shield</h2>
            <p className="text-slate-500 text-xs font-medium mt-0.5">
              AI-Powered Fraud Risk Assessment • Engine: {engineMode === "ai" ? "Gemini AI" : "Rules Engine"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={clearChat}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors cursor-pointer"
          >
            Clear Session
          </button>
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#0F9D78]/10 text-[#0F9D78] border border-[#0F9D78]/20">
            <span className="w-2 h-2 rounded-full bg-[#0F9D78] animate-pulse"></span>
            Online
          </span>
        </div>
      </div>

      <div className="flex flex-col md:flex-row flex-1 overflow-hidden relative bg-slate-50/50 w-full">

        {/* ── MAIN CHAT AREA ── */}
        <div className="flex-1 flex flex-col relative min-w-0 h-full">
          {/* Chat Messages Background Texture */}
          <div className="absolute inset-0 bg-[radial-gradient(#1A3FA0_1px,transparent_1px)] [background-size:24px_24px] opacity-[0.03] pointer-events-none" />

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 relative z-10 pb-4">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex w-full ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                {msg.role === "assistant" ? (
                  <div className="max-w-[85%] animate-in fade-in slide-in-from-bottom-2 duration-300">
                    {/* AI Avatar */}
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#1A3FA0] to-[#1A3FA0]/70 flex items-center justify-center shadow-sm">
                        <span className="text-[12px] text-white">🛡️</span>
                      </div>
                      <span className="text-slate-600 text-xs font-bold tracking-wide">Shield Agent</span>
                    </div>

                    <div className="bg-white border border-slate-200 shadow-sm rounded-2xl rounded-tl-sm p-5 text-slate-800 text-sm leading-relaxed">
                      {/* If it has assessment metadata, render rich card */}
                      {msg.metadata?.verdict ? (
                        <div>
                          {/* Verdict Badge */}
                          {(() => {
                            const vs = VERDICT_STYLES[msg.metadata.verdict] || VERDICT_STYLES.SUSPICIOUS;
                            return (
                              <div className={`flex items-center justify-between p-3 rounded-xl mb-4 ${vs.bg} border ${vs.border}`}>
                                <div className="flex items-center gap-3">
                                  <span className="text-2xl drop-shadow-sm">{vs.icon}</span>
                                  <div>
                                    <span className={`block font-black text-sm tracking-wide ${vs.text}`}>{msg.metadata.verdict}</span>
                                    <span className={`block text-[10px] font-bold uppercase tracking-widest ${vs.text} opacity-80 mt-0.5`}>Risk Score</span>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <span className={`block text-xl font-black ${vs.text}`}>{msg.metadata.riskScore}</span>
                                  <span className={`block text-[10px] font-bold uppercase tracking-widest ${vs.text} opacity-70`}>/ 100</span>
                                </div>
                              </div>
                            );
                          })()}

                          {/* Risk Bar */}
                          <div className="mb-5 px-1">
                            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                              <div
                                className="h-full rounded-full transition-all duration-1000 ease-out"
                                style={{
                                  width: `${msg.metadata.riskScore}%`,
                                  backgroundColor: VERDICT_STYLES[msg.metadata.verdict]?.barColor || "#6b7280",
                                }}
                              />
                            </div>
                          </div>

                          {/* Explanation */}
                          <div className="text-slate-700 text-sm leading-relaxed mb-5">{renderFormattedText(msg.content)}</div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
                            {/* Threat Indicators */}
                            {msg.metadata.threatIndicators?.length > 0 && (
                              <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-2 flex items-center gap-1.5">
                                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                  Key Threat Indicators
                                </p>
                                <div className="flex flex-wrap gap-1.5">
                                  {msg.metadata.threatIndicators.map((ind, i) => (
                                    <span key={i} className="px-2 py-1 bg-white text-slate-700 text-[11px] font-semibold rounded-md border border-slate-200 shadow-sm">
                                      {ind}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Fraud Type Badge */}
                            {msg.metadata.fraudType && msg.metadata.fraudType !== "none" && (
                              <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-2 flex items-center gap-1.5">
                                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
                                  Classification
                                </p>
                                <span className="inline-block px-2.5 py-1 bg-[#1A3FA0]/10 text-[#1A3FA0] text-[11px] font-bold rounded-lg border border-[#1A3FA0]/20 capitalize uppercase tracking-wider">
                                  {msg.metadata.fraudType.replace(/_/g, " ")}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Recommended Actions */}
                          {msg.metadata.recommendedActions?.length > 0 && (
                            <div className="mb-5 bg-[#0F9D78]/5 rounded-xl p-3 border border-[#0F9D78]/10">
                              <p className="text-[#0F9D78] text-[10px] font-bold uppercase tracking-widest mb-2.5 flex items-center gap-1.5">
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                                Recommended Actions
                              </p>
                              <div className="space-y-2">
                                {msg.metadata.recommendedActions.map((action, i) => (
                                  <div key={i} className="flex items-start gap-2.5">
                                    <div className="w-4 h-4 rounded-full bg-[#0F9D78]/20 flex items-center justify-center shrink-0 mt-0.5">
                                      <svg className="w-2.5 h-2.5 text-[#0F9D78]" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                      </svg>
                                    </div>
                                    <span className="text-slate-700 text-[13px] font-medium">{action}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* File Report Button */}
                          {msg.metadata.assessmentId && msg.metadata.verdict !== "SAFE" && (
                            <button
                              onClick={() => generateReport(msg.metadata.assessmentId)}
                              className="w-full py-3 mt-2 bg-gradient-to-r from-[#E5484D] to-red-600 hover:from-red-600 hover:to-red-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5 flex items-center justify-center gap-2 cursor-pointer"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                              Generate NCRB Complaint Template
                            </button>
                          )}
                        </div>
                      ) : (
                        /* Plain text message (e.g. Welcome message) */
                        <div>{renderFormattedText(msg.content)}</div>
                      )}
                    </div>
                  </div>
                ) : (
                  /* User message bubble */
                  <div className="max-w-[75%] animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="flex items-center justify-end gap-2 mb-1.5">
                      <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5">
                        <span className="bg-slate-200/50 p-1 rounded-md">{CONTEXT_TYPES.find(c => c.key === msg.metadata?.contextType)?.icon || "📨"}</span>
                        {msg.metadata?.contextType || "message"}
                      </span>
                    </div>
                    <div className="bg-[#1A3FA0] text-white shadow-md rounded-2xl rounded-tr-sm px-4 py-3">
                      <p className="text-sm leading-relaxed">{renderFormattedText(msg.content)}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Typing indicator */}
            {isAnalyzing && (
              <div className="flex justify-start animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="bg-white border border-slate-200 shadow-sm rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-3">
                  <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 bg-[#1A3FA0]/40 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <div className="w-1.5 h-1.5 bg-[#1A3FA0]/60 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <div className="w-1.5 h-1.5 bg-[#1A3FA0]/80 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                  <span className="text-slate-500 text-xs font-medium">Analyzing threat context...</span>
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Input & Quick Actions Area */}
          <div className="px-6 pb-6 pt-2 bg-gradient-to-t from-slate-50 via-slate-50 to-transparent relative z-20 shrink-0">
            
            {/* Quick Actions */}
            <div className="flex flex-wrap gap-2 mb-4">
              {QUICK_ACTIONS.map((action, i) => (
                <button
                  key={i}
                  onClick={() => handleQuickAction(action)}
                  disabled={isAnalyzing}
                  className="px-3 py-1.5 bg-white hover:bg-slate-100 text-[#1A3FA0] text-[11px] font-bold rounded-full border border-blue-100 shadow-sm hover:shadow hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
                >
                  <span className="opacity-80">{CONTEXT_TYPES.find(c => c.key === action.contextType)?.icon}</span>
                  {action.label}
                </button>
              ))}
            </div>

            {/* Context Type Tabs (Segmented Control) */}
            <div className="flex gap-1 p-1 mb-3 bg-slate-200/50 rounded-xl w-fit">
              {CONTEXT_TYPES.map((ct) => (
                <button
                  key={ct.key}
                  onClick={() => setContextType(ct.key)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
                    contextType === ct.key
                      ? "bg-white text-[#1A3FA0] shadow-sm"
                      : "text-slate-500 hover:text-slate-800 hover:bg-slate-200/50"
                  }`}
                >
                  <span className={contextType === ct.key ? "opacity-100" : "opacity-70"}>{ct.icon}</span>
                  {ct.label}
                </button>
              ))}
            </div>

            {/* Elevated Input Bar */}
            <div className="flex items-end gap-2 bg-white p-2 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-slate-200/80 focus-within:ring-4 focus-within:ring-[#1A3FA0]/10 focus-within:border-[#1A3FA0]/30 transition-all">
              <textarea
                ref={inputRef}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={`Paste the suspicious ${contextType} content here... (Press Enter to send)`}
                rows={1}
                className="flex-1 px-4 py-3.5 bg-transparent border-none text-slate-900 placeholder-slate-400 resize-none focus:outline-none text-sm min-h-[52px]"
                style={{ overflow: 'hidden' }}
                onInput={(e) => {
                  e.target.style.height = 'auto';
                  e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
                }}
              />
              <button
                onClick={handleSubmit}
                disabled={isAnalyzing || !inputText.trim()}
                className={`group relative flex items-center justify-center h-[52px] rounded-xl font-bold text-sm transition-all duration-300 ease-out overflow-hidden self-end shrink-0
                  ${isAnalyzing || !inputText.trim() 
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed w-[52px]' 
                    : 'bg-[#1A3FA0] hover:bg-[#153280] text-white cursor-pointer shadow-md hover:shadow-lg hover:-translate-y-0.5 w-[52px] hover:w-[120px]'
                  }`}
              >
                {isAnalyzing ? (
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                ) : (
                  <div className="flex items-center justify-center w-full h-full relative">
                    <svg className="w-5 h-5 absolute group-hover:-ml-[64px] transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <span className="absolute opacity-0 group-hover:opacity-100 group-hover:ml-[24px] transition-all duration-300 whitespace-nowrap text-sm tracking-wide">Analyze</span>
                  </div>
                )}
              </button>
            </div>

            {/* Error */}
            {error && (
              <p className="mt-3 text-[#E5484D] text-xs font-bold animate-in fade-in">{error}</p>
            )}
          </div>
        </div>

        {/* ── RIGHT SIDEBAR — Shield Dashboard ── */}
        <div className="w-full md:w-[320px] bg-white border-t md:border-t-0 md:border-l border-slate-200/70 overflow-y-auto shrink-0 flex flex-col shadow-[-8px_0_30px_rgba(0,0,0,0.02)] z-30">
          
          {/* Session Stats */}
          <div className="p-6 border-b border-slate-100">
            <h3 className="text-slate-800 font-bold text-xs uppercase tracking-wider mb-4 flex items-center gap-2">
              <svg className="w-4 h-4 text-[#1A3FA0]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
              Session Overview
            </h3>
            <div className="flex flex-col gap-3">
              <div className="group flex items-center justify-between p-3.5 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-100 hover:border-slate-200 transition-colors cursor-default border-l-4 border-l-[#1A3FA0]">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#1A3FA0]/10 flex items-center justify-center text-[#1A3FA0]">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                  </div>
                  <span className="text-slate-600 text-xs font-bold uppercase tracking-wider">Total Scans</span>
                </div>
                <span className="text-slate-900 text-xl font-black group-hover:scale-110 transition-transform">{stats.totalScans}</span>
              </div>
              
              <div className="group flex items-center justify-between p-3.5 bg-[#E5484D]/5 hover:bg-[#E5484D]/10 rounded-xl border border-[#E5484D]/10 hover:border-[#E5484D]/20 transition-colors cursor-default border-l-4 border-l-[#E5484D]">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#E5484D]/10 flex items-center justify-center text-[#E5484D]">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                  </div>
                  <span className="text-[#E5484D] text-xs font-bold uppercase tracking-wider">Threats</span>
                </div>
                <span className="text-[#E5484D] text-xl font-black group-hover:scale-110 transition-transform">{stats.threatsCaught}</span>
              </div>

              <div className="group flex items-center justify-between p-3.5 bg-[#0F9D78]/5 hover:bg-[#0F9D78]/10 rounded-xl border border-[#0F9D78]/10 hover:border-[#0F9D78]/20 transition-colors cursor-default border-l-4 border-l-[#0F9D78]">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#0F9D78]/10 flex items-center justify-center text-[#0F9D78]">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </div>
                  <span className="text-[#0F9D78] text-xs font-bold uppercase tracking-wider">Safe</span>
                </div>
                <span className="text-[#0F9D78] text-xl font-black group-hover:scale-110 transition-transform">{stats.safeClear}</span>
              </div>
            </div>
          </div>

          {/* Assessment History */}
          <div className="p-6 border-b border-slate-100 flex-1 overflow-y-auto min-h-[200px]">
            <h3 className="text-slate-800 font-bold text-xs uppercase tracking-wider mb-4 flex items-center gap-2">
              <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              Assessment Log
            </h3>
            <div className="space-y-3">
              {messages
                .filter((m) => m.role === "assistant" && m.metadata?.verdict)
                .reverse()
                .slice(0, 10)
                .map((m, i) => {
                  const vs = VERDICT_STYLES[m.metadata.verdict] || VERDICT_STYLES.SUSPICIOUS;
                  return (
                    <div key={i} className={`p-3 rounded-xl border ${vs.border} ${vs.bg} shadow-sm transition-all hover:shadow-md cursor-default`}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className={`text-xs font-bold flex items-center gap-1.5 ${vs.text}`}>
                          <span>{vs.icon}</span> {m.metadata.verdict}
                        </span>
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-md ${vs.pillBg} ${vs.text}`}>
                          Score: {m.metadata.riskScore}
                        </span>
                      </div>
                      {m.metadata.fraudType && m.metadata.fraudType !== "none" && (
                        <p className="text-slate-600 text-[10px] font-bold uppercase tracking-wider capitalize line-clamp-1 mt-2">
                          {m.metadata.fraudType.replace(/_/g, " ")}
                        </p>
                      )}
                    </div>
                  );
                })}
              {messages.filter((m) => m.role === "assistant" && m.metadata?.verdict).length === 0 && (
                <div className="py-8 text-center">
                  <p className="text-slate-400 text-xs font-medium">No assessments run yet in this session.</p>
                </div>
              )}
            </div>
          </div>

          {/* Emergency Contacts */}
          <div className="p-5 bg-gradient-to-br from-[#E5484D]/5 to-[#E5484D]/10 shrink-0">
            <h3 className="text-[#E5484D] font-bold text-[10px] uppercase tracking-widest mb-3 flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L1 21h22L12 2zm0 3.99L19.53 19H4.47L12 5.99zM11 16h2v2h-2zm0-7h2v5h-2z"/></svg>
              Emergency Response
            </h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2.5 bg-white/80 hover:bg-white rounded-xl border border-[#E5484D]/20 shadow-sm transition-all group cursor-pointer" onClick={() => window.location.href='tel:1930'}>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#E5484D]/10 flex items-center justify-center text-[#E5484D]">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                  </div>
                  <div>
                    <p className="text-slate-900 text-xs font-bold">Cyber Helpline</p>
                    <p className="text-slate-500 text-[9px] font-bold uppercase tracking-wider mt-0.5">24/7 National</p>
                  </div>
                </div>
                <span className="text-[#E5484D] font-black text-sm group-hover:scale-110 transition-transform">1930</span>
              </div>
              
              <a href="https://cybercrime.gov.in" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-2.5 bg-white/80 hover:bg-white rounded-xl border border-[#E5484D]/20 shadow-sm transition-all group">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#1A3FA0]/10 flex items-center justify-center text-[#1A3FA0]">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>
                  </div>
                  <div>
                    <p className="text-slate-900 text-xs font-bold">NCRB Portal</p>
                    <p className="text-slate-500 text-[9px] font-bold uppercase tracking-wider mt-0.5">File Complaint</p>
                  </div>
                </div>
                <svg className="w-4 h-4 text-[#1A3FA0] group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </a>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
