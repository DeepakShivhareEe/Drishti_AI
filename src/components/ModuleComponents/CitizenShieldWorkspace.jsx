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
  DANGEROUS: { bg: "bg-red-500/15", border: "border-red-500/30", text: "text-red-400", icon: "🔴", barColor: "#ef4444" },
  SUSPICIOUS: { bg: "bg-amber-500/15", border: "border-amber-500/30", text: "text-amber-400", icon: "🟡", barColor: "#f59e0b" },
  SAFE: { bg: "bg-emerald-500/15", border: "border-emerald-500/30", text: "text-emerald-400", icon: "🟢", barColor: "#10b981" },
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
  }, [messages]);

  const handleSubmit = () => {
    if (!inputText.trim() || isAnalyzing) return;
    submitMessage(inputText, contextType);
    setInputText("");
    inputRef.current?.focus();
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
    <div className="w-full bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">

      {/* ── HEADER ── */}
      <div className="flex items-center justify-between px-5 py-3 bg-zinc-50 border-b border-zinc-200">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-cyan-100 flex items-center justify-center">
            <span className="text-lg">🛡️</span>
          </div>
          <div>
            <h2 className="text-zinc-900 font-bold text-sm">Citizen Fraud Shield</h2>
            <p className="text-zinc-500 text-[11px] font-medium">
              AI-Powered Fraud Risk Assessment • Engine: {engineMode === "ai" ? "Gemini AI" : "Rules Engine"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={clearChat}
            className="px-3 py-1.5 bg-white hover:bg-zinc-100 text-zinc-600 text-xs font-bold rounded-lg border border-zinc-200 transition-colors cursor-pointer"
          >
            Clear Chat
          </button>
          <span className="px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-700 border border-emerald-200">
            ● Online
          </span>
        </div>
      </div>

      <div className="flex" style={{ height: "680px" }}>

        {/* ── MAIN CHAT AREA ── */}
        <div className="flex-1 flex flex-col">

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                {msg.role === "assistant" ? (
                  <div className="max-w-[85%]">
                    {/* AI Avatar */}
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className="w-5 h-5 rounded-full bg-cyan-100 flex items-center justify-center">
                        <span className="text-[10px]">🛡️</span>
                      </div>
                      <span className="text-zinc-500 text-[10px] font-bold uppercase tracking-wider">Drishti Shield</span>
                    </div>

                    <div className="bg-zinc-50 border border-zinc-200 rounded-2xl rounded-tl-md p-4">
                      {/* If it has assessment metadata, render rich card */}
                      {msg.metadata?.verdict ? (
                        <div>
                          {/* Verdict Badge */}
                          {(() => {
                            const vs = VERDICT_STYLES[msg.metadata.verdict] || VERDICT_STYLES.SUSPICIOUS;
                            return (
                              <div className={`flex items-center gap-2 px-3 py-2 rounded-xl mb-3 ${vs.bg} border ${vs.border}`}>
                                <span className="text-lg">{vs.icon}</span>
                                <div>
                                  <span className={`font-bold text-sm ${vs.text}`}>{msg.metadata.verdict}</span>
                                  <span className={`ml-2 text-xs ${vs.text} opacity-80`}>Risk Score: {msg.metadata.riskScore}/100</span>
                                </div>
                              </div>
                            );
                          })()}

                          {/* Risk Bar */}
                          <div className="mb-3">
                            <div className="w-full h-2 bg-zinc-200 rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full transition-all duration-700"
                                style={{
                                  width: `${msg.metadata.riskScore}%`,
                                  backgroundColor: VERDICT_STYLES[msg.metadata.verdict]?.barColor || "#6b7280",
                                }}
                              />
                            </div>
                          </div>

                          {/* Explanation */}
                          <p className="text-zinc-700 text-sm leading-relaxed mb-3">{msg.content}</p>

                          {/* Fraud Type Badge */}
                          {msg.metadata.fraudType && msg.metadata.fraudType !== "none" && (
                            <div className="mb-3">
                              <span className="px-2 py-1 bg-violet-100 text-violet-700 text-[10px] font-bold rounded-lg border border-violet-200 uppercase tracking-wider">
                                {msg.metadata.fraudType.replace(/_/g, " ")}
                              </span>
                            </div>
                          )}

                          {/* Threat Indicators */}
                          {msg.metadata.threatIndicators?.length > 0 && (
                            <div className="mb-3">
                              <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mb-1.5">Threat Indicators</p>
                              <div className="flex flex-wrap gap-1.5">
                                {msg.metadata.threatIndicators.map((ind, i) => (
                                  <span key={i} className="px-2 py-0.5 bg-red-50 text-red-700 text-[10px] font-semibold rounded border border-red-100">
                                    {ind}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Recommended Actions */}
                          {msg.metadata.recommendedActions?.length > 0 && (
                            <div className="mb-3">
                              <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mb-1.5">Recommended Actions</p>
                              <div className="space-y-1.5">
                                {msg.metadata.recommendedActions.map((action, i) => (
                                  <div key={i} className="flex items-start gap-2">
                                    <svg className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span className="text-zinc-700 text-xs">{action}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* File Report Button */}
                          {msg.metadata.assessmentId && msg.metadata.verdict !== "SAFE" && (
                            <button
                              onClick={() => generateReport(msg.metadata.assessmentId)}
                              className="mt-2 w-full py-2 bg-zinc-900 hover:bg-black text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
                            >
                              📋 Generate NCRB Complaint Template
                            </button>
                          )}
                        </div>
                      ) : (
                        /* Plain text message */
                        <p className="text-zinc-700 text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                      )}
                    </div>
                  </div>
                ) : (
                  /* User message bubble */
                  <div className="max-w-[75%]">
                    <div className="flex items-center justify-end gap-2 mb-1">
                      <span className="text-zinc-400 text-[10px] font-medium">
                        {CONTEXT_TYPES.find(c => c.key === msg.metadata?.contextType)?.icon || "📨"} {msg.metadata?.contextType || "message"}
                      </span>
                    </div>
                    <div className="bg-zinc-900 text-white rounded-2xl rounded-tr-md px-4 py-3">
                      <p className="text-sm leading-relaxed">{msg.content}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Typing indicator */}
            {isAnalyzing && (
              <div className="flex justify-start">
                <div className="bg-zinc-50 border border-zinc-200 rounded-2xl rounded-tl-md px-4 py-3 flex items-center gap-2">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <div className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <div className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                  <span className="text-zinc-500 text-xs font-medium">Analyzing for fraud signals...</span>
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Quick Actions */}
          <div className="px-5 pb-2">
            <div className="flex flex-wrap gap-1.5">
              {QUICK_ACTIONS.map((action, i) => (
                <button
                  key={i}
                  onClick={() => handleQuickAction(action)}
                  disabled={isAnalyzing}
                  className="px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-[11px] font-semibold rounded-full border border-zinc-200 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {CONTEXT_TYPES.find(c => c.key === action.contextType)?.icon} {action.label}
                </button>
              ))}
            </div>
          </div>

          {/* ── INPUT AREA ── */}
          <div className="p-4 border-t border-zinc-200 bg-zinc-50/50">
            {/* Context Type Tabs */}
            <div className="flex gap-1 mb-3">
              {CONTEXT_TYPES.map((ct) => (
                <button
                  key={ct.key}
                  onClick={() => setContextType(ct.key)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    contextType === ct.key
                      ? "bg-zinc-900 text-white shadow-sm"
                      : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 border border-zinc-200"
                  }`}
                >
                  {ct.icon} {ct.label}
                </button>
              ))}
            </div>

            {/* Text Input + Send */}
            <div className="flex gap-2">
              <textarea
                ref={inputRef}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={`Paste the suspicious ${contextType} content here...`}
                rows={2}
                className="flex-1 px-4 py-3 bg-white border border-zinc-200 rounded-xl text-sm text-zinc-900 placeholder-zinc-400 resize-none focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500/50 transition-all"
              />
              <button
                onClick={handleSubmit}
                disabled={isAnalyzing || !inputText.trim()}
                className="px-5 self-end py-3 bg-zinc-900 hover:bg-black text-white font-bold text-sm rounded-xl transition-colors disabled:opacity-50 disabled:hover:bg-zinc-900 cursor-pointer shrink-0"
              >
                {isAnalyzing ? (
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                ) : (
                  "Analyze"
                )}
              </button>
            </div>

            {/* Error */}
            {error && (
              <p className="mt-2 text-amber-600 text-xs font-medium">{error}</p>
            )}
          </div>
        </div>

        {/* ── RIGHT SIDEBAR — Shield Dashboard ── */}
        <div className="w-[260px] bg-zinc-50 border-l border-zinc-200 overflow-y-auto shrink-0 flex flex-col">

          {/* Session Stats */}
          <div className="p-4 border-b border-zinc-200">
            <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mb-3">Session Stats</p>
            <div className="grid grid-cols-3 gap-2">
              <div className="p-2.5 bg-white rounded-xl border border-zinc-200 text-center">
                <p className="text-zinc-900 text-lg font-bold">{stats.totalScans}</p>
                <p className="text-zinc-500 text-[9px] font-semibold uppercase">Scans</p>
              </div>
              <div className="p-2.5 bg-white rounded-xl border border-zinc-200 text-center">
                <p className="text-red-500 text-lg font-bold">{stats.threatsCaught}</p>
                <p className="text-zinc-500 text-[9px] font-semibold uppercase">Threats</p>
              </div>
              <div className="p-2.5 bg-white rounded-xl border border-zinc-200 text-center">
                <p className="text-emerald-500 text-lg font-bold">{stats.safeClear}</p>
                <p className="text-zinc-500 text-[9px] font-semibold uppercase">Safe</p>
              </div>
            </div>
          </div>

          {/* Recent Assessments */}
          <div className="p-4 border-b border-zinc-200 flex-1 overflow-y-auto">
            <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mb-3">Assessment History</p>
            <div className="space-y-2">
              {messages
                .filter((m) => m.role === "assistant" && m.metadata?.verdict)
                .reverse()
                .slice(0, 10)
                .map((m, i) => {
                  const vs = VERDICT_STYLES[m.metadata.verdict] || VERDICT_STYLES.SUSPICIOUS;
                  return (
                    <div key={i} className={`p-2.5 rounded-xl border ${vs.border} ${vs.bg}`}>
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-xs font-bold ${vs.text}`}>
                          {vs.icon} {m.metadata.verdict}
                        </span>
                        <span className={`text-[10px] font-mono ${vs.text} opacity-70`}>
                          {m.metadata.riskScore}/100
                        </span>
                      </div>
                      {m.metadata.fraudType && m.metadata.fraudType !== "none" && (
                        <p className="text-zinc-600 text-[10px] capitalize">
                          {m.metadata.fraudType.replace(/_/g, " ")}
                        </p>
                      )}
                    </div>
                  );
                })}
              {messages.filter((m) => m.role === "assistant" && m.metadata?.verdict).length === 0 && (
                <p className="text-zinc-400 text-xs text-center py-4">No assessments yet</p>
              )}
            </div>
          </div>

          {/* Emergency Contacts */}
          <div className="p-4 bg-red-50/50 border-t border-red-100">
            <p className="text-red-800 text-[10px] font-bold uppercase tracking-widest mb-2">🚨 Emergency Contacts</p>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 bg-white rounded-lg border border-red-100">
                <div>
                  <p className="text-zinc-900 text-xs font-bold">Cybercrime Helpline</p>
                  <p className="text-zinc-500 text-[10px]">24/7 National Helpline</p>
                </div>
                <span className="text-red-600 font-bold text-sm font-mono">1930</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-white rounded-lg border border-red-100">
                <div>
                  <p className="text-zinc-900 text-xs font-bold">NCRB Portal</p>
                  <p className="text-zinc-500 text-[10px]">File Online Complaint</p>
                </div>
                <a href="https://cybercrime.gov.in" target="_blank" rel="noopener noreferrer" className="text-cyan-600 text-[10px] font-bold hover:underline">
                  Visit →
                </a>
              </div>
              <div className="flex items-center justify-between p-2 bg-white rounded-lg border border-red-100">
                <div>
                  <p className="text-zinc-900 text-xs font-bold">Women Helpline</p>
                  <p className="text-zinc-500 text-[10px]">For women facing cyber fraud</p>
                </div>
                <span className="text-red-600 font-bold text-sm font-mono">181</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-3 bg-zinc-100 border-t border-zinc-200 text-center">
            <p className="text-zinc-400 text-[9px] font-medium">
              Powered by DRISHTI AI • MHA Cybercrime Division
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
