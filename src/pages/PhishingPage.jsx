import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import './PhishingPage.css'

const URL_SAMPLES = [
  { label: 'Safe Link', value: 'https://www.onlinesbi.sbi/' },
  { label: 'Typosquat', value: 'http://onlinesbl.sbi-update.com/kyc' },
  { label: 'Suspicious IP', value: 'http://192.168.1.100/secure-login' },
  { label: 'Shortener', value: 'https://bit.ly/3x8Qp9' }
]

const TEXT_SAMPLES = [
  { label: 'Legitimate SMS', value: 'Dear Customer, your acct XX1234 is credited with Rs 500 on 12-Oct. Available Bal: Rs 1500. - SBI' },
  { label: 'KYC Scam', value: 'Dear customer, your SBI YONO account will be blocked today. Please complete your KYC immediately using this link: http://sbi-kyc-update.buzz/login' },
  { label: 'Lottery Bait', value: 'Congratulations! You have won Rs 50,000 cashback from Google Pay. Claim your reward immediately: https://gpay-prize.tk/claim' },
  { label: 'Digital Arrest Threat', value: 'URGENT: CBI officer Sharma here. A money laundering case (FIR 124) is registered against you. Call back immediately or police will be sent to your location.' }
]

export default function PhishingPage() {
  const [activeTab, setActiveTab] = useState('url') // 'url' or 'text'
  const [inputValue, setInputValue] = useState('')
  const [isScanning, setIsScanning] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  const handleScan = async (e) => {
    e?.preventDefault()
    if (!inputValue.trim()) return

    setIsScanning(true)
    setError(null)
    setResult(null)

    try {
      const endpoint = activeTab === 'url' ? '/api/phishing/scan-url' : '/api/phishing/scan-text'
      const payload = activeTab === 'url' ? { url: inputValue } : { text: inputValue }

      const response = await fetch(`http://127.0.0.1:8000${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        throw new Error('Failed to analyze. Make sure backend is running.')
      }

      const data = await response.json()
      setResult(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsScanning(false)
    }
  }

  const loadSample = (value) => {
    setInputValue(value)
    // Clear previous results
    setResult(null)
    setError(null)
  }

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 relative z-10">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-extrabold text-zinc-900 tracking-tight mb-4">
            Phishing & <span className="text-blue-600">SMS Scanner</span>
          </h1>
          <p className="text-xl text-zinc-500 font-medium max-w-2xl mx-auto">
            Instantly analyze suspicious links, messages, and emails using our offline AI engine. We check for typosquatting, urgency tactics, and brand impersonation.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          
          {/* LEFT PANEL: Input Area */}
          <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 p-6 md:p-8 flex flex-col">
            
            {/* Tabs */}
            <div className="flex bg-zinc-100 p-1 rounded-xl mb-6">
              <button
                onClick={() => { setActiveTab('url'); setInputValue(''); setResult(null); }}
                className={`flex-1 py-2.5 px-4 rounded-lg font-bold text-sm text-center ${activeTab === 'url' ? 'scan-tab active shadow-sm' : 'scan-tab inactive'}`}
              >
                🔗 Scan URL
              </button>
              <button
                onClick={() => { setActiveTab('text'); setInputValue(''); setResult(null); }}
                className={`flex-1 py-2.5 px-4 rounded-lg font-bold text-sm text-center ${activeTab === 'text' ? 'scan-tab active shadow-sm' : 'scan-tab inactive'}`}
              >
                💬 Scan SMS / Text
              </button>
            </div>

            {/* Input Form */}
            <form onSubmit={handleScan} className="flex flex-col">
              <div className="mb-4">
                <label className="block text-sm font-bold text-zinc-900 mb-2">
                  {activeTab === 'url' ? 'Paste Suspicious Link' : 'Paste SMS, Email or Message'}
                </label>
                {activeTab === 'url' ? (
                  <input
                    type="url"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="e.g. https://sbi-kyc-update.com/login"
                    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-mono text-sm text-zinc-900"
                    required
                  />
                ) : (
                  <textarea
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Paste the full message here..."
                    className="w-full h-48 px-4 py-3 bg-zinc-50 border border-zinc-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none text-sm text-zinc-900"
                    required
                  />
                )}
              </div>

              {/* Sample Buttons */}
              <div className="mb-6">
                <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Try a sample</p>
                <div className="flex flex-wrap gap-2">
                  {(activeTab === 'url' ? URL_SAMPLES : TEXT_SAMPLES).map((sample, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => loadSample(sample.value)}
                      className="px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-bold rounded-lg transition-colors border border-zinc-200"
                    >
                      {sample.label}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={isScanning || !inputValue.trim()}
                className="w-full py-4 bg-zinc-900 hover:bg-black text-white font-bold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md"
              >
                {isScanning ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Analyzing Engine...
                  </>
                ) : (
                  <>🔍 Run AI Scan</>
                )}
              </button>

              {error && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm font-medium">
                  {error}
                </div>
              )}
            </form>
          </div>

          {/* RIGHT PANEL: Results Area */}
          <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 flex flex-col overflow-hidden">
            {!result && !isScanning ? (
              <div className="flex-1 flex flex-col items-center justify-center p-12 text-center text-zinc-400 bg-zinc-50/50">
                <svg className="w-16 h-16 mb-4 opacity-50" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                </svg>
                <h3 className="text-lg font-bold text-zinc-600 mb-2">Awaiting Target</h3>
                <p className="text-sm">Enter a URL or message on the left to begin forensic analysis.</p>
              </div>
            ) : isScanning ? (
              <div className="flex-1 flex flex-col items-center justify-center p-12 text-center bg-zinc-50/50">
                <div className="w-24 h-24 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-6"></div>
                <h3 className="text-xl font-bold text-zinc-900 mb-2">Analyzing Patterns...</h3>
                <p className="text-sm text-zinc-500">Checking against 500+ phishing signatures</p>
              </div>
            ) : (
              <AnimatePresence>
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex-1 flex flex-col h-full"
                >
                  {/* Top: Score Gauge */}
                  <div className={`p-8 border-b border-zinc-200 flex flex-col items-center justify-center relative overflow-hidden ${
                    result.risk_level === 'safe' ? 'bg-emerald-50' : 
                    result.risk_level === 'suspicious' ? 'bg-amber-50' : 
                    result.risk_level === 'dangerous' ? 'bg-orange-50' : 'bg-red-50'
                  }`}>
                    <div className={`threat-gauge mb-4 ${result.risk_level} bg-white`}>
                      <div className="text-center">
                        <span className={`text-5xl font-extrabold block ${
                          result.risk_level === 'safe' ? 'text-emerald-600' : 
                          result.risk_level === 'suspicious' ? 'text-amber-600' : 
                          result.risk_level === 'dangerous' ? 'text-orange-600' : 'text-red-600'
                        }`}>
                          {result.threat_score}
                        </span>
                        <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest mt-1 block">Threat Score</span>
                      </div>
                    </div>
                    
                    <span className={`px-4 py-1.5 rounded-full text-sm font-bold tracking-widest uppercase border ${
                      result.risk_level === 'safe' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : 
                      result.risk_level === 'suspicious' ? 'bg-amber-100 text-amber-800 border-amber-200' : 
                      result.risk_level === 'dangerous' ? 'bg-orange-100 text-orange-800 border-orange-200' : 'bg-red-100 text-red-800 border-red-200'
                    }`}>
                      {result.risk_level}
                    </span>
                  </div>

                  {/* Extracted URLs Section (if any) */}
                  {result.extracted_urls && result.extracted_urls.length > 0 && (
                    <div className="p-5 border-b border-zinc-200 bg-zinc-50">
                      <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3">Links Found in Text</h4>
                      <div className="flex flex-col gap-2">
                        {result.extracted_urls.map((u, i) => (
                          <div key={i} className="px-3 py-2 bg-white border border-zinc-200 rounded-lg text-sm font-mono text-zinc-800 truncate">
                            {u}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Findings List */}
                  <div className="p-5 findings-list bg-white">
                    <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-4">Detailed Findings ({result.findings.length})</h4>
                    
                    <div className="flex flex-col gap-3">
                      {result.findings.map((finding, idx) => (
                        <div key={idx} className={`p-4 rounded-xl border flex gap-4 ${
                          finding.severity === 'critical' ? 'bg-red-50 border-red-100' :
                          finding.severity === 'high' ? 'bg-orange-50 border-orange-100' :
                          finding.severity === 'medium' ? 'bg-amber-50 border-amber-100' :
                          finding.severity === 'info' ? 'bg-emerald-50 border-emerald-100' :
                          'bg-zinc-50 border-zinc-200'
                        }`}>
                          <div className={`mt-0.5 shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-white ${
                            finding.severity === 'critical' ? 'bg-red-500' :
                            finding.severity === 'high' ? 'bg-orange-500' :
                            finding.severity === 'medium' ? 'bg-amber-500' :
                            finding.severity === 'info' ? 'bg-emerald-500' :
                            'bg-zinc-400'
                          }`}>
                            {finding.severity === 'info' ? (
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                            ) : (
                              <span className="text-xs font-black">!</span>
                            )}
                          </div>
                          <div>
                            <h5 className={`text-sm font-bold mb-1 ${
                              finding.severity === 'critical' ? 'text-red-900' :
                              finding.severity === 'high' ? 'text-orange-900' :
                              finding.severity === 'medium' ? 'text-amber-900' :
                              finding.severity === 'info' ? 'text-emerald-900' :
                              'text-zinc-900'
                            }`}>{finding.title}</h5>
                            <p className="text-xs text-zinc-600 leading-relaxed">{finding.description}</p>
                            
                            {finding.score > 0 && (
                              <span className="inline-block mt-2 text-[10px] font-bold px-2 py-0.5 bg-white rounded border border-zinc-200 text-zinc-500">
                                +{finding.score} pts
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
