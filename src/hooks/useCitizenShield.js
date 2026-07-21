import { useState, useCallback } from "react";
import { fetchWithAuth } from "../utils/api";

const API_BASE = "http://localhost:8000/api/v1/citizen-shield";

export default function useCitizenShield() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Welcome to **Drishti Shield** 🛡️\n\nI'm your AI-powered cybercrime analysis engine. Paste any suspicious message, describe a call scenario, or input a UPI payment request — and I'll instantly assess the fraud risk.\n\n**How to use:**\n• Select the context type (Call, SMS, UPI, Email)\n• Type or paste the suspicious content\n• I'll give you an instant verdict with recommended actions",
      metadata: null,
    },
  ]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalScans: 0,
    threatsCaught: 0,
    safeClear: 0,
  });
  const [engineMode, setEngineMode] = useState("rules");

  // ── Fetch stats ──
  const refreshStats = useCallback(async () => {
    try {
      const res = await fetchWithAuth(`${API_BASE}/stats`);
      if (res.ok) {
        const data = await res.json();
        setStats({
          totalScans: data.total_assessments || 0,
          threatsCaught: data.threats_blocked || 0,
          safeClear: data.safe_count || 0,
        });
        setEngineMode(data.engine_mode || "rules");
      }
    } catch {
      // Silently fail — stats are non-critical
    }
  }, []);

  // ── Submit message for fraud assessment ──
  const submitMessage = useCallback(
    async (message, contextType = "call") => {
      if (!message.trim()) return;
      setError(null);

      // Add user message to chat
      const userMsg = {
        role: "user",
        content: message,
        metadata: { contextType },
      };
      setMessages((prev) => [...prev, userMsg]);
      setIsAnalyzing(true);

      try {
        const res = await fetchWithAuth(`${API_BASE}/assess`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message, context_type: contextType }),
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.detail || "Assessment failed");
        }

        const result = await res.json();

        // Add AI response to chat
        const aiMsg = {
          role: "assistant",
          content: result.explanation || "Analysis complete.",
          metadata: {
            verdict: result.verdict,
            riskScore: result.risk_score,
            riskLevel: result.risk_level,
            threatIndicators: result.threat_indicators || [],
            recommendedActions: result.recommended_actions || [],
            fraudType: result.fraud_type,
            assessmentId: result.assessment_id,
            engineMode: result.engine_mode,
          },
        };
        setMessages((prev) => [...prev, aiMsg]);
        setEngineMode(result.engine_mode || "rules");

        // Update local stats
        setStats((prev) => ({
          totalScans: prev.totalScans + 1,
          threatsCaught:
            prev.threatsCaught +
            (result.verdict === "DANGEROUS" || result.verdict === "SUSPICIOUS" ? 1 : 0),
          safeClear: prev.safeClear + (result.verdict === "SAFE" ? 1 : 0),
        }));
      } catch (err) {
        // Fallback to client-side basic analysis if backend is down
        const fallbackResult = clientSideFallback(message, contextType);
        const aiMsg = {
          role: "assistant",
          content: fallbackResult.explanation,
          metadata: {
            verdict: fallbackResult.verdict,
            riskScore: fallbackResult.riskScore,
            riskLevel: fallbackResult.riskLevel,
            threatIndicators: fallbackResult.threatIndicators,
            recommendedActions: fallbackResult.recommendedActions,
            fraudType: fallbackResult.fraudType,
            assessmentId: null,
            engineMode: "client-fallback",
          },
        };
        setMessages((prev) => [...prev, aiMsg]);
        setStats((prev) => ({
          totalScans: prev.totalScans + 1,
          threatsCaught:
            prev.threatsCaught +
            (fallbackResult.verdict !== "SAFE" ? 1 : 0),
          safeClear: prev.safeClear + (fallbackResult.verdict === "SAFE" ? 1 : 0),
        }));
        setError("Backend offline — using client-side analysis");
      } finally {
        setIsAnalyzing(false);
      }
    },
    []
  );

  // ── Generate NCRB report ──
  const generateReport = useCallback(async (assessmentId) => {
    if (!assessmentId) return;
    try {
      const res = await fetchWithAuth(`${API_BASE}/report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assessment_id: assessmentId }),
      });
      if (!res.ok) throw new Error("Report generation failed");
      const data = await res.json();

      // Trigger JSON download
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `NCRB_Complaint_${data.reference_number?.replace(/\//g, "-") || "report"}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setError("Report generation failed — is backend running?");
    }
  }, []);

  // ── Clear chat ──
  const clearChat = useCallback(() => {
    setMessages([
      {
        role: "assistant",
        content: "Chat cleared. Ready for a new assessment. 🛡️",
        metadata: null,
      },
    ]);
    setError(null);
  }, []);

  return {
    messages,
    isAnalyzing,
    error,
    stats,
    engineMode,
    submitMessage,
    generateReport,
    clearChat,
    refreshStats,
  };
}


// ── Client-side basic fallback (when backend is unreachable) ──
function clientSideFallback(message, contextType) {
  const text = message.toLowerCase();
  let score = 0;
  const indicators = [];

  const checks = [
    { patterns: ["cbi", "ed ", "customs", "police", "arrest", "warrant", "fir"], weight: 30, label: "Authority impersonation" },
    { patterns: ["immediately", "urgent", "right now", "account frozen", "legal action"], weight: 15, label: "Urgency pressure" },
    { patterns: ["transfer", "upi", "neft", "send money", "payment", "rtgs"], weight: 25, label: "Financial extraction" },
    { patterns: ["aadhaar", "pan", "otp", "password", "cvv", "bank details"], weight: 20, label: "Information harvesting" },
    { patterns: ["anydesk", "teamviewer", "screen share", "digital arrest", "video call"], weight: 20, label: "Technical deception" },
    { patterns: ["congratulations", "winner", "lottery", "prize", "cashback"], weight: 15, label: "Reward bait" },
  ];

  for (const check of checks) {
    if (check.patterns.some((p) => text.includes(p))) {
      score += check.weight;
      indicators.push(check.label);
    }
  }

  if (contextType === "call") score += 10;
  if (contextType === "upi") score += 15;

  score = Math.min(score, 100);

  const verdict = score >= 60 ? "DANGEROUS" : score >= 30 ? "SUSPICIOUS" : "SAFE";
  const riskLevel = score >= 60 ? "Critical" : score >= 30 ? "High" : "Low";

  const actions =
    verdict === "DANGEROUS"
      ? [
          "Do NOT transfer any money or share OTPs",
          "Hang up immediately",
          "Block this number",
          "File complaint at cybercrime.gov.in or call 1930",
        ]
      : verdict === "SUSPICIOUS"
      ? [
          "Do NOT share personal information",
          "Verify independently via official helpline",
          "Report if you suspect fraud",
        ]
      : ["This appears safe, but stay alert", "Never share OTPs with anyone"];

  return {
    verdict,
    riskScore: score,
    riskLevel,
    threatIndicators: indicators,
    recommendedActions: actions,
    fraudType: indicators.length > 2 ? "digital_arrest" : indicators.length > 0 ? "phishing" : "none",
    explanation:
      verdict === "DANGEROUS"
        ? `⚠️ HIGH RISK: This ${contextType} shows ${indicators.length} strong fraud signals. This is very likely a scam.`
        : verdict === "SUSPICIOUS"
        ? `⚡ CAUTION: This ${contextType} contains some suspicious patterns. Verify before proceeding.`
        : `✅ This ${contextType} does not show significant fraud indicators.`,
  };
}
