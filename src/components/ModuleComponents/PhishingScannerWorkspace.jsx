import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchWithAuth } from '../../utils/api';

const URL_SAMPLES = [
  { label: 'Safe Link', value: 'https://www.onlinesbi.sbi/', type: 'safe' },
  { label: 'Typosquat', value: 'http://onlinesbl.sbi-update.com/kyc', type: 'danger' },
  { label: 'Suspicious IP', value: 'http://192.168.1.100/secure-login', type: 'danger' },
  { label: 'Shortener', value: 'https://bit.ly/3x8Qp9', type: 'warning' }
];

const TEXT_SAMPLES = [
  { label: 'Legitimate SMS', value: 'Dear Customer, your acct XX1234 is credited with Rs 500 on 12-Oct. Available Bal: Rs 1500. - SBI', type: 'safe' },
  { label: 'KYC Scam', value: 'Dear customer, your SBI YONO account will be blocked today. Please complete your KYC immediately using this link: http://sbi-kyc-update.buzz/login', type: 'danger' },
  { label: 'Lottery Bait', value: 'Congratulations! You have won Rs 50,000 cashback from Google Pay. Claim your reward immediately: https://gpay-prize.tk/claim', type: 'danger' },
  { label: 'Digital Arrest Threat', value: 'URGENT: CBI officer Sharma here. A money laundering case (FIR 124) is registered against you. Call back immediately or police will be sent to your location.', type: 'danger' }
];

export default function PhishingScannerWorkspace() {
  const [activeTab, setActiveTab] = useState('url'); // 'url' or 'text'
  const [inputValue, setInputValue] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleScan = async (e) => {
    e?.preventDefault();
    if (!inputValue.trim()) return;

    setIsScanning(true);
    setError(null);
    setResult(null);

    try {
      const endpoint = activeTab === 'url' ? '/api/phishing/scan-url' : '/api/phishing/scan-text';
      const payload = activeTab === 'url' ? { url: inputValue } : { text: inputValue };

      const response = await fetchWithAuth(`http://127.0.0.1:8000${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error('Failed to analyze. Make sure backend is running.');
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsScanning(false);
    }
  };

  const loadSample = (value) => {
    setInputValue(value);
    setResult(null);
    setError(null);
  };

  return (
    <div className="fixed top-0 left-0 right-0 bottom-0 z-40 flex flex-col bg-slate-50 font-sans text-slate-900 overflow-hidden">
      {/* Workspace Header */}
      <div className="sticky top-0 z-20 flex items-center justify-between px-6 py-4 bg-white/80 backdrop-blur-md border-b border-slate-200/60 shadow-sm w-full shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1A3FA0] to-[#1A3FA0]/70 flex items-center justify-center shadow-md">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <div>
            <h2 className="text-[#1A3FA0] font-bold text-lg leading-tight tracking-tight">Phishing & SMS Scanner</h2>
            <p className="text-slate-500 text-xs font-medium mt-0.5">Instantly analyze suspicious links, messages, and emails.</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#0F9D78]/10 text-[#0F9D78] border border-[#0F9D78]/20 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-[#0F9D78] animate-pulse"></span>
            Agent Online (Port 8000)
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-hidden p-6 md:p-8 bg-zinc-50/50 flex flex-col">
        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-8 h-full min-h-0">
          
          {/* LEFT PANEL: Input Area */}
          <div className="bg-white rounded-2xl shadow-md border border-zinc-200 p-6 flex flex-col h-full relative z-10 overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-zinc-300 [&::-webkit-scrollbar-thumb]:rounded hover:[&::-webkit-scrollbar-thumb]:bg-zinc-400">
            {/* Tabs */}
            <div className="flex bg-zinc-100 p-1.5 rounded-xl mb-6 relative">
              <button
                onClick={() => { setActiveTab('url'); setInputValue(''); setResult(null); }}
                className={`relative flex-1 py-2.5 px-4 rounded-lg font-bold text-sm text-center transition-colors duration-200 z-10 ${activeTab === 'url' ? 'text-white' : 'text-zinc-500 hover:text-zinc-700 hover:-translate-y-px'}`}
              >
                {activeTab === 'url' && (
                  <motion.div layoutId="tab-bg" className="absolute inset-0 bg-zinc-900 rounded-lg shadow-sm -z-10" transition={{ type: "spring", bounce: 0.2, duration: 0.6 }} />
                )}
                🔗 Scan URL
              </button>
              <button
                onClick={() => { setActiveTab('text'); setInputValue(''); setResult(null); }}
                className={`relative flex-1 py-2.5 px-4 rounded-lg font-bold text-sm text-center transition-colors duration-200 z-10 ${activeTab === 'text' ? 'text-white' : 'text-zinc-500 hover:text-zinc-700 hover:-translate-y-px'}`}
              >
                {activeTab === 'text' && (
                  <motion.div layoutId="tab-bg" className="absolute inset-0 bg-zinc-900 rounded-lg shadow-sm -z-10" transition={{ type: "spring", bounce: 0.2, duration: 0.6 }} />
                )}
                💬 Scan SMS / Text
              </button>
            </div>

            {/* Input Form */}
            <form onSubmit={handleScan} className="flex flex-col flex-1">
              <div className="mb-6">
                <label className="block text-sm font-bold text-zinc-900 mb-2">
                  {activeTab === 'url' ? 'Paste Suspicious Link' : 'Paste SMS, Email or Message'}
                </label>
                <div className="relative group">
                  {activeTab === 'url' ? (
                    <>
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-400 group-focus-within:text-[#1A3FA0] transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                      </div>
                      <input
                        type="url"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="e.g. https://sbi-kyc-update.com/login"
                        className="w-full pl-11 pr-4 py-3.5 bg-zinc-50 border border-zinc-300 rounded-xl focus:ring-2 focus:ring-[#1A3FA0]/20 focus:border-[#1A3FA0] transition-all font-mono text-sm text-zinc-900 shadow-sm"
                        required
                      />
                    </>
                  ) : (
                    <>
                      <div className="absolute top-4 left-0 pl-4 flex items-start pointer-events-none text-zinc-400 group-focus-within:text-[#1A3FA0] transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
                      </div>
                      <textarea
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="Paste the full message here..."
                        className="w-full h-40 pl-11 pr-4 py-3.5 bg-zinc-50 border border-zinc-300 rounded-xl focus:ring-2 focus:ring-[#1A3FA0]/20 focus:border-[#1A3FA0] transition-all resize-none text-sm text-zinc-900 shadow-sm"
                        required
                      />
                    </>
                  )}
                </div>
              </div>

              {/* Sample Buttons */}
              <div className="mb-8">
                <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3">Try a sample</p>
                <div className="flex flex-wrap gap-2.5">
                  {(activeTab === 'url' ? URL_SAMPLES : TEXT_SAMPLES).map((sample, idx) => {
                    const isSafe = sample.type === 'safe';
                    const isDanger = sample.type === 'danger';
                    const isWarning = sample.type === 'warning';
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => loadSample(sample.value)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all duration-200 border bg-white shadow-sm hover:-translate-y-0.5 hover:shadow ${
                          isSafe ? 'border-[#0F9D78]/30 text-[#0F9D78] hover:border-[#0F9D78] hover:bg-[#0F9D78]/5' :
                          isDanger ? 'border-[#E5484D]/30 text-[#E5484D] hover:border-[#E5484D] hover:bg-[#E5484D]/5' :
                          isWarning ? 'border-amber-500/30 text-amber-600 hover:border-amber-500 hover:bg-amber-50' :
                          'border-zinc-200 text-zinc-700 hover:bg-zinc-50 hover:border-zinc-300'
                        }`}
                      >
                        <span className={`w-2 h-2 rounded-full ${
                          isSafe ? 'bg-[#0F9D78]' :
                          isDanger ? 'bg-[#E5484D]' :
                          isWarning ? 'bg-amber-500' : 'bg-zinc-400'
                        }`}></span>
                        {sample.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mt-auto">
                <button
                  type="submit"
                  disabled={isScanning || !inputValue.trim()}
                  className="w-full py-4 bg-gradient-to-r from-[#1A3FA0] to-indigo-600 hover:from-[#153280] hover:to-indigo-700 text-white font-bold rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-[#1A3FA0]/30 hover:shadow-xl hover:shadow-[#1A3FA0]/40 disabled:shadow-none relative overflow-hidden group"
                >
                  {isScanning && (
                    <motion.div
                      initial={{ top: '-50%' }}
                      animate={{ top: '150%' }}
                      transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
                      className="absolute left-0 right-0 h-24 bg-gradient-to-b from-transparent via-white/30 to-transparent pointer-events-none"
                    />
                  )}
                  {isScanning ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span className="relative z-10">Scanning...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                      <span className="relative z-10">Run AI Scan</span>
                    </>
                  )}
                </button>
                {error && (
                  <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm font-medium animate-in fade-in slide-in-from-top-2">
                    {error}
                  </div>
                )}
              </div>
            </form>
          </div>

          {/* RIGHT PANEL: Results Area */}
          <div className="bg-white rounded-2xl shadow-md border border-zinc-200 flex flex-col overflow-hidden relative z-0 h-full">
            {!result && !isScanning ? (
              <div className="flex-1 flex flex-col items-center justify-center p-12 text-center text-zinc-400 bg-zinc-50/50 relative overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.div
                    animate={{ scale: [1, 1.5, 2], opacity: [0.2, 0, 0] }}
                    transition={{ repeat: Infinity, duration: 2, ease: "easeOut" }}
                    className="w-32 h-32 rounded-full border-2 border-[#1A3FA0]/20 absolute"
                  />
                  <motion.div
                    animate={{ scale: [1, 1.5, 2], opacity: [0.2, 0, 0] }}
                    transition={{ repeat: Infinity, duration: 2, ease: "easeOut", delay: 0.5 }}
                    className="w-32 h-32 rounded-full border-2 border-[#1A3FA0]/20 absolute"
                  />
                </div>
                <div className="relative z-10 w-20 h-20 bg-white rounded-full shadow-md flex items-center justify-center mb-6">
                  <svg className="w-10 h-10 text-zinc-300" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-zinc-700 mb-2 relative z-10">Awaiting Target</h3>
                <p className="text-sm max-w-[250px] relative z-10">Enter a URL or message on the left to begin forensic analysis.</p>
              </div>
            ) : isScanning ? (
              <div className="flex-1 flex flex-col items-center justify-center p-12 text-center bg-zinc-50/50">
                <div className="relative w-24 h-24 mb-8">
                  <div className="absolute inset-0 border-4 border-zinc-200 rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-t-[#1A3FA0] border-r-[#1A3FA0] rounded-full animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center text-[#1A3FA0]">
                    <svg className="w-8 h-8 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-zinc-900 mb-2">Analyzing Patterns...</h3>
                <p className="text-sm text-zinc-500">Cross-referencing global threat intelligence</p>
              </div>
            ) : (
              <AnimatePresence>
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex-1 flex flex-col h-full bg-zinc-50 relative overflow-hidden"
                >
                  <div className="flex-1 overflow-y-auto pb-6 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-zinc-300 [&::-webkit-scrollbar-thumb]:rounded hover:[&::-webkit-scrollbar-thumb]:bg-zinc-400">
                    {/* Top: Score Gauge */}
                    <div className={`p-8 border-b border-zinc-200 flex flex-col items-center justify-center relative overflow-hidden ${
                      result.risk_level === 'safe' ? 'bg-emerald-50' : 
                      result.risk_level === 'suspicious' ? 'bg-amber-50' : 
                      result.risk_level === 'dangerous' ? 'bg-orange-50' : 'bg-red-50'
                    }`}>
                      <div className={`relative w-[200px] h-[200px] rounded-full flex items-center justify-center transition-all duration-500 ease-out border-8 mb-4 bg-white shadow-lg ${
                        result.risk_level === 'safe' ? 'border-emerald-500 shadow-emerald-500/20' : 
                        result.risk_level === 'suspicious' ? 'border-amber-500 shadow-amber-500/20' : 
                        result.risk_level === 'dangerous' ? 'border-orange-500 shadow-orange-500/20' : 
                        'border-red-500 shadow-red-500/20'
                      }`}>
                        <div className="text-center">
                          <span className={`text-6xl font-black block tracking-tighter ${
                            result.risk_level === 'safe' ? 'text-emerald-600' : 
                            result.risk_level === 'suspicious' ? 'text-amber-600' : 
                            result.risk_level === 'dangerous' ? 'text-orange-600' : 'text-red-600'
                          }`}>
                            {result.threat_score}
                          </span>
                          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em] mt-1 block">Threat Score</span>
                        </div>
                      </div>
                      
                      <span className={`px-5 py-2 rounded-full text-sm font-bold tracking-widest uppercase border shadow-sm ${
                        result.risk_level === 'safe' ? 'bg-emerald-500 text-white border-emerald-600' : 
                        result.risk_level === 'suspicious' ? 'bg-amber-500 text-white border-amber-600' : 
                        result.risk_level === 'dangerous' ? 'bg-orange-500 text-white border-orange-600' : 'bg-red-600 text-white border-red-700'
                      }`}>
                        {result.risk_level}
                      </span>
                    </div>

                    {/* Extracted URLs Section (if any) */}
                    {result.extracted_urls && result.extracted_urls.length > 0 && (
                      <div className="p-6 border-b border-zinc-200 bg-white">
                        <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3">Links Found in Text</h4>
                        <div className="flex flex-col gap-2">
                          {result.extracted_urls.map((u, i) => (
                            <div key={i} className="px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-lg text-sm font-mono text-zinc-800 truncate shadow-sm">
                              {u}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Findings List */}
                    <div className="p-6 bg-zinc-50">
                      <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-4">Detailed Findings ({result.findings.length})</h4>
                      
                      <div className="flex flex-col gap-3">
                        {result.findings.map((finding, idx) => (
                          <div key={idx} className={`p-4 rounded-xl border flex gap-4 bg-white shadow-sm transition-all hover:shadow-md ${
                            finding.severity === 'critical' ? 'border-red-200' :
                            finding.severity === 'high' ? 'border-orange-200' :
                            finding.severity === 'medium' ? 'border-amber-200' :
                            finding.severity === 'info' ? 'border-emerald-200' :
                            'border-zinc-200'
                          }`}>
                            <div className={`mt-0.5 shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white shadow-sm ${
                              finding.severity === 'critical' ? 'bg-red-500' :
                              finding.severity === 'high' ? 'bg-orange-500' :
                              finding.severity === 'medium' ? 'bg-amber-500' :
                              finding.severity === 'info' ? 'bg-emerald-500' :
                              'bg-zinc-400'
                            }`}>
                              {finding.severity === 'info' ? (
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                              ) : (
                                <span className="text-sm font-black">!</span>
                              )}
                            </div>
                            <div className="flex-1">
                              <h5 className={`text-sm font-bold mb-1 ${
                                finding.severity === 'critical' ? 'text-red-900' :
                                finding.severity === 'high' ? 'text-orange-900' :
                                finding.severity === 'medium' ? 'text-amber-900' :
                                finding.severity === 'info' ? 'text-emerald-900' :
                                'text-zinc-900'
                              }`}>{finding.title}</h5>
                              <p className="text-xs text-zinc-600 leading-relaxed">{finding.description}</p>
                              
                              {finding.score > 0 && (
                                <span className="inline-flex items-center gap-1 mt-2 text-[10px] font-bold px-2 py-1 bg-zinc-50 rounded border border-zinc-200 text-zinc-500">
                                  +{finding.score} <span className="font-normal">pts</span>
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Recommended Action Section */}
                  <div className="p-6 bg-white border-t border-zinc-200 mt-auto sticky bottom-0 z-10 shadow-[0_-4px_10px_rgba(0,0,0,0.02)]">
                    <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-4">Recommended Action</h4>
                    <div className="grid grid-cols-3 gap-3">
                      <button className="flex flex-col items-center justify-center p-3 rounded-xl bg-zinc-50 border border-zinc-200 hover:border-red-500 hover:bg-red-50 hover:shadow-sm transition-all group">
                        <div className="w-10 h-10 rounded-full bg-white border border-red-100 text-red-500 flex items-center justify-center mb-2 group-hover:bg-red-500 group-hover:text-white group-hover:border-red-500 transition-colors shadow-sm">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>
                        </div>
                        <span className="text-[11px] font-bold text-zinc-700 uppercase tracking-wide">Block Source</span>
                      </button>
                      <button className="flex flex-col items-center justify-center p-3 rounded-xl bg-zinc-50 border border-zinc-200 hover:border-blue-500 hover:bg-blue-50 hover:shadow-sm transition-all group">
                        <div className="w-10 h-10 rounded-full bg-white border border-blue-100 text-blue-500 flex items-center justify-center mb-2 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 transition-colors shadow-sm">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" /></svg>
                        </div>
                        <span className="text-[11px] font-bold text-zinc-700 uppercase tracking-wide">Report Phishing</span>
                      </button>
                      <button className="flex flex-col items-center justify-center p-3 rounded-xl bg-zinc-50 border border-zinc-200 hover:border-emerald-500 hover:bg-emerald-50 hover:shadow-sm transition-all group">
                        <div className="w-10 h-10 rounded-full bg-white border border-emerald-100 text-emerald-500 flex items-center justify-center mb-2 group-hover:bg-emerald-500 group-hover:text-white group-hover:border-emerald-500 transition-colors shadow-sm">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                        </div>
                        <span className="text-[11px] font-bold text-zinc-700 uppercase tracking-wide">Mark Safe</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
