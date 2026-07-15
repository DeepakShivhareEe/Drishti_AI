"""
Phishing Detection Engine
-------------------------
Hybrid analysis engine that combines:
  1. URL structural analysis (domain, TLD, path, protocol)
  2. Typosquatting & homoglyph detection
  3. SMS/text NLP pattern matching (English + Hindi/Hinglish)
  4. Brand impersonation detection
  5. Weighted scoring system with detailed breakdown

No external API keys required — fully offline capable.
"""

import json
import re
from pathlib import Path
from dataclasses import dataclass, field
from urllib.parse import urlparse, unquote

from core.config import DATA_DIR


@dataclass
class ScanFinding:
    """A single detected issue."""
    category: str        # e.g. "url_risk", "text_risk", "brand_impersonation"
    severity: str        # "critical", "high", "medium", "low", "info"
    title: str           # short label
    description: str     # human-readable explanation
    score: float         # points added to threat score


@dataclass
class ScanResult:
    """Complete scan output."""
    input_type: str               # "url" or "text"
    input_value: str
    threat_score: float = 0.0
    risk_level: str = "safe"
    findings: list = field(default_factory=list)
    extracted_urls: list = field(default_factory=list)
    url_breakdown: dict = field(default_factory=dict)
    category_scores: dict = field(default_factory=dict)


class PhishingEngine:
    """Core detection engine for URLs and SMS/email text."""

    def __init__(self):
        patterns_path = DATA_DIR / "phishing_patterns.json"
        with open(patterns_path, "r", encoding="utf-8") as f:
            self.patterns = json.load(f)

        self.known_malicious = self.patterns["phishing_domains"]["known_malicious_patterns"]
        self.legitimate_domains = self.patterns["phishing_domains"]["legitimate_domains"]
        self.brand_targets = self.patterns["phishing_domains"]["brand_targets"]
        self.suspicious_tlds = self.patterns["suspicious_tlds"]
        self.url_shorteners = self.patterns["url_shorteners"]
        self.suspicious_paths = self.patterns["suspicious_url_paths"]
        self.sms_patterns = self.patterns["sms_patterns"]

        # Common typosquatting substitutions
        self.typo_map = {
            '0': 'o', '1': 'l', '3': 'e', '4': 'a', '5': 's',
            '7': 't', '8': 'b', '9': 'g', '@': 'a',
        }

        # Homoglyph characters (Unicode lookalikes)
        self.homoglyphs = {
            'а': 'a', 'е': 'e', 'о': 'o', 'р': 'p', 'с': 'c',
            'у': 'y', 'х': 'x', 'і': 'i', 'ј': 'j', 'ѕ': 's',
            'ɡ': 'g', 'ɑ': 'a', 'ℓ': 'l',
        }

    # ─── URL ANALYSIS ───────────────────────────────────────────

    def scan_url(self, raw_url: str) -> dict:
        """Analyze a URL for phishing indicators."""
        result = ScanResult(input_type="url", input_value=raw_url)
        findings = []

        # Normalize URL
        url = raw_url.strip()
        if not url.startswith(("http://", "https://")):
            url = "http://" + url

        try:
            parsed = urlparse(url)
        except Exception:
            findings.append(ScanFinding(
                "url_risk", "critical", "Malformed URL",
                "The URL could not be parsed. This is highly suspicious.", 25.0
            ))
            result.findings = findings
            result.threat_score = 25.0
            result.risk_level = self._calc_risk_level(25.0)
            return self._to_dict(result)

        domain = (parsed.hostname or "").lower()
        path = unquote(parsed.path).lower()
        scheme = parsed.scheme

        result.url_breakdown = {
            "scheme": scheme,
            "domain": domain,
            "path": parsed.path,
            "query": parsed.query or None,
            "port": parsed.port,
        }

        # ── Check 1: Known legitimate domain ──
        if self._is_legitimate(domain):
            findings.append(ScanFinding(
                "safe", "info", "Verified Domain",
                f"'{domain}' is a known legitimate domain.", 0.0
            ))
            if scheme == "https":
                findings.append(ScanFinding(
                    "safe", "info", "Secure Connection",
                    "Uses HTTPS encrypted connection.", 0.0
                ))
            result.findings = findings
            result.threat_score = 0.0
            result.risk_level = "safe"
            result.category_scores = {"url_risk": 0, "safe_signals": 2}
            return self._to_dict(result)

        # ── Check 2: HTTP vs HTTPS ──
        if scheme == "http":
            findings.append(ScanFinding(
                "url_risk", "medium", "No HTTPS",
                "Site uses unencrypted HTTP. Legitimate banks/services always use HTTPS.", 10.0
            ))

        # ── Check 3: IP-based URL ──
        if self._is_ip_address(domain):
            findings.append(ScanFinding(
                "url_risk", "high", "IP Address URL",
                f"URL uses raw IP address ({domain}) instead of a domain name. Phishing sites often do this to avoid detection.", 20.0
            ))

        # ── Check 3.5: gov.in subdomain trick ──
        if ".gov.in" in domain and not domain.endswith(".gov.in"):
            findings.append(ScanFinding(
                "url_risk", "critical", "CRITICAL: Gov.in Subdomain Spoofing",
                f"Domain '{domain}' uses '.gov.in' as a subdomain but is NOT a real government site. This is a severe phishing tactic.",
                100.0
            ))

        # ── Check 4: Suspicious TLD ──
        for tld in self.suspicious_tlds:
            if domain.endswith(tld):
                findings.append(ScanFinding(
                    "url_risk", "high", "Suspicious TLD",
                    f"Domain uses '{tld}' which is commonly abused by phishing sites.", 50.0
                ))
                break

        # ── Check 5: Known malicious patterns ──
        for pattern in self.known_malicious:
            if pattern in domain:
                findings.append(ScanFinding(
                    "url_risk", "critical", "Known Phishing Pattern",
                    f"Domain contains '{pattern}' which matches known phishing campaigns targeting Indian users.", 30.0
                ))
                break

        # ── Check 6: URL shortener ──
        for shortener in self.url_shorteners:
            if domain == shortener or domain.endswith("." + shortener):
                findings.append(ScanFinding(
                    "url_risk", "medium", "URL Shortener Detected",
                    f"Uses '{shortener}' to hide the real destination. Phishing links frequently use URL shorteners.", 12.0
                ))
                break

        # ── Check 7: Typosquatting detection ──
        typo_finding = self._check_typosquatting(domain)
        if typo_finding:
            findings.append(typo_finding)

        # ── Check 8: Homoglyph attack ──
        homoglyph_finding = self._check_homoglyphs(domain)
        if homoglyph_finding:
            findings.append(homoglyph_finding)

        # ── Check 9: Excessive subdomains ──
        subdomain_count = domain.count('.') - 1  # minus the main TLD dot
        if subdomain_count >= 3:
            findings.append(ScanFinding(
                "url_risk", "high", "Excessive Subdomains",
                f"Domain has {subdomain_count + 1} levels of subdomains ({domain}). This is a common phishing technique to make URLs look like legitimate sites.", 15.0
            ))

        # ── Check 10: Brand impersonation in domain ──
        brand_finding = self._check_brand_in_domain(domain)
        if brand_finding:
            findings.append(brand_finding)

        # ── Check 11: Suspicious path keywords ──
        critical_path_matches = [p for p in self.patterns.get("critical_paths", []) if p in path]
        if critical_path_matches:
            findings.append(ScanFinding(
                "url_risk", "critical", "CRITICAL: Dangerous Path Keyword",
                f"Path contains direct payment/clearance demands: {', '.join(critical_path_matches)}. 'Clearance fee' links are 100% scams.",
                40.0
            ))
        else:
            path_matches = [p for p in self.suspicious_paths if p in path]
            if path_matches:
                findings.append(ScanFinding(
                    "url_risk", "high", "Suspicious URL Path",
                    f"Path contains sensitive keywords: {', '.join(path_matches)}. Suggests credential harvesting or scam funnel.",
                    20.0
                ))

        # ── Check 11.5: Dangerous query params ──
        query_str = (parsed.query or "").lower()
        if query_str:
            query_matches = [q for q in self.patterns.get("dangerous_query_params", []) if q in query_str]
            if query_matches:
                findings.append(ScanFinding(
                    "url_risk", "critical", "CRITICAL: Dangerous Query Parameters",
                    f"Query contains suspicious data requests (fees, identity, telegram): {', '.join(query_matches)}",
                    40.0
                ))

        # ── Check 12: Very long URL ──
        if len(raw_url) > 150:
            findings.append(ScanFinding(
                "url_risk", "low", "Unusually Long URL",
                f"URL is {len(raw_url)} characters long. Phishing URLs are often long to hide suspicious elements.", 5.0
            ))

        # ── Check 13: @ symbol in URL ──
        if '@' in url.split('//')[1] if '//' in url else False:
            findings.append(ScanFinding(
                "url_risk", "critical", "@ Symbol in URL",
                "URL contains '@' which can trick browsers into ignoring the preceding text and redirecting to a different site.", 25.0
            ))

        # Calculate final scores
        total = sum(f.score for f in findings)
        
        # Override for explicit combinations
        has_tld = any(f.title == "Suspicious TLD" for f in findings)
        has_brand = any(f.category == "brand_impersonation" for f in findings)
        has_path = any("Path" in f.title for f in findings)
        
        if has_tld and has_brand and has_path:
            result.threat_score = max(95.0, min(total, 100.0))
        elif has_tld and has_brand:
            result.threat_score = max(75.0, min(total, 100.0))
        elif has_tld:
            result.threat_score = max(50.0, min(total, 100.0))
        else:
            result.threat_score = min(total, 100.0)
        result.risk_level = self._calc_risk_level(result.threat_score)
        result.findings = findings
        result.category_scores = self._calc_category_scores(findings)

        return self._to_dict(result)

    # ─── TEXT / SMS ANALYSIS ────────────────────────────────────

    def scan_text(self, text: str) -> dict:
        """Analyze SMS or email text for phishing indicators."""
        result = ScanResult(input_type="text", input_value=text)
        findings = []
        text_lower = text.lower()

        # ── Step 1: Extract URLs from text ──
        url_pattern = r'https?://[^\s<>"{}|\\^`\[\]]+'
        urls = re.findall(url_pattern, text)
        # Also find domains without http
        bare_domain_pattern = r'(?<!\w)(?:www\.)?[a-zA-Z0-9][-a-zA-Z0-9]*\.[a-zA-Z]{2,}(?:/[^\s]*)?'
        bare_domains = re.findall(bare_domain_pattern, text)

        all_urls = list(set(urls + [u for u in bare_domains if '.' in u and len(u) > 5]))
        result.extracted_urls = all_urls

        # ── Step 2: Analyze each extracted URL ──
        for url in all_urls[:3]:  # limit to first 3 URLs
            url_result = self.scan_url(url)
            if url_result["threat_score"] > 0:
                findings.append(ScanFinding(
                    "embedded_url", "high", f"Suspicious Link Found",
                    f"Embedded URL '{url[:60]}...' scored {url_result['threat_score']:.0f}/100 threat level.",
                    min(url_result["threat_score"] * 0.5, 30.0)
                ))

        # ── Step 3: Check urgency phrases ──
        urgency_matches = []
        for phrase in self.sms_patterns["urgency_phrases"]:
            if phrase.lower() in text_lower:
                urgency_matches.append(phrase)
        if urgency_matches:
            findings.append(ScanFinding(
                "text_risk", "high", "Urgency/Fear Tactics",
                f"Contains pressure language: \"{', '.join(urgency_matches[:3])}\". Scammers create panic to force hasty decisions.",
                min(len(urgency_matches) * 8, 25.0)
            ))

        # ── Step 4: Check financial bait ──
        financial_matches = []
        for phrase in self.sms_patterns["financial_bait"]:
            if phrase.lower() in text_lower:
                financial_matches.append(phrase)
        if financial_matches:
            findings.append(ScanFinding(
                "text_risk", "high", "Financial Bait Detected",
                f"Contains money/reward lures: \"{', '.join(financial_matches[:3])}\". Unsolicited prizes are a classic phishing technique.",
                min(len(financial_matches) * 10, 25.0)
            ))

        # ── Step 5: Check credential harvesting ──
        cred_matches = []
        for phrase in self.sms_patterns.get("credential_harvesting", []):
            if phrase.lower() in text_lower:
                cred_matches.append(phrase)
        if cred_matches:
            findings.append(ScanFinding(
                "text_risk", "critical", "Credential Harvesting Attempt",
                f"Asks for sensitive data: \"{', '.join(cred_matches[:3])}\". Legitimate services NEVER ask for OTP/PIN via SMS.",
                min(len(cred_matches) * 12, 30.0)
            ))

        # ── Step 5.1: CRITICAL - Arrest/Warrant/CBI ──
        critical_matches = []
        for phrase in self.sms_patterns.get("critical_keywords", []):
            if phrase.lower() in text_lower:
                critical_matches.append(phrase)
        if critical_matches:
            findings.append(ScanFinding(
                "text_risk", "critical", "CRITICAL: Law Enforcement/Arrest Threat",
                f"Matches severe scam patterns: \"{', '.join(critical_matches[:3])}\". Real agencies do NOT threaten arrest or demand money over messages.",
                100.0  # Instant critical
            ))

        # ── Step 5.2: CRITICAL - Isolation Tactics ──
        isolation_matches = []
        for phrase in self.sms_patterns.get("isolation_tactics", []):
            if phrase.lower() in text_lower:
                isolation_matches.append(phrase)
        if isolation_matches:
            findings.append(ScanFinding(
                "text_risk", "critical", "CRITICAL: Isolation Tactic Detected",
                f"Scammer is trying to isolate you: \"{', '.join(isolation_matches[:2])}\". This is a hallmark of Digital Arrest scams.",
                100.0  # Instant critical
            ))

        # ── Step 5.3: CRITICAL - Fraud Links ──
        link_matches = []
        for phrase in self.sms_patterns.get("fraud_links", []):
            if phrase.lower() in text_lower:
                link_matches.append(phrase)
        if link_matches:
            findings.append(ScanFinding(
                "text_risk", "critical", "CRITICAL: Malicious Link Pattern",
                f"Contains highly suspicious links (UPI/Telegram): \"{', '.join(link_matches[:2])}\". NEVER pay or join unknown groups.",
                100.0  # Instant critical
            ))

        # ── Step 5.4: Fee Demands ──
        fee_matches = []
        for phrase in self.sms_patterns.get("fee_demands", []):
            if phrase.lower() in text_lower:
                fee_matches.append(phrase)
        if fee_matches:
            findings.append(ScanFinding(
                "text_risk", "high", "Advance Fee/Parcel Fraud",
                f"Demands money upfront: \"{', '.join(fee_matches[:2])}\". Do not pay any fees for unsolicited parcels, jobs, or prizes.",
                40.0
            ))

        # ── Step 6: Check threat phrases ──
        threat_matches = []
        for phrase in self.sms_patterns["threat_phrases"]:
            if phrase.lower() in text_lower:
                threat_matches.append(phrase)
        if threat_matches:
            findings.append(ScanFinding(
                "text_risk", "high", "Threatening Language",
                f"Contains threats: \"{', '.join(threat_matches[:3])}\". Scammers use legal/police threats to intimidate victims.",
                min(len(threat_matches) * 10, 20.0)
            ))

        # ── Step 7: Check brand impersonation ──
        impersonation_matches = []
        for phrase in self.sms_patterns["impersonation_phrases"]:
            if phrase.lower() in text_lower:
                impersonation_matches.append(phrase)
        if impersonation_matches:
            findings.append(ScanFinding(
                "brand_impersonation", "high", "Brand/Authority Impersonation",
                f"Claims to be from: \"{', '.join(impersonation_matches[:2])}\". Verify by calling the official helpline directly.",
                min(len(impersonation_matches) * 8, 20.0)
            ))

        # ── Step 8: Check for suspicious phone numbers ──
        phone_pattern = r'\+?\d{10,13}'
        phones = re.findall(phone_pattern, text)
        if phones and len(findings) > 0:
            findings.append(ScanFinding(
                "text_risk", "low", "Callback Number Included",
                f"Contains phone number(s) which may redirect to scam call centers.",
                5.0
            ))

        # ── Step 9: Check for suspicious amount patterns ──
        amount_pattern = r'(?:Rs\.?|₹|INR)\s*[\d,]+(?:\.\d+)?'
        amounts = re.findall(amount_pattern, text, re.IGNORECASE)
        if amounts and any(f.category != "safe" for f in findings):
            findings.append(ScanFinding(
                "text_risk", "medium", "Monetary Amount Mentioned",
                f"Mentions specific amounts: {', '.join(amounts[:3])}. Combined with other red flags, this suggests financial fraud.",
                8.0
            ))

        # ── If nothing found, mark as safe ──
        if not findings:
            findings.append(ScanFinding(
                "safe", "info", "No Threats Detected",
                "No phishing indicators found in this text. However, always exercise caution with unsolicited messages.",
                0.0
            ))

        # Calculate final scores
        # Implement strict threshold scoring if no instant 100-point critical triggers hit
        total = sum(f.score for f in findings)
        trigger_count = len([f for f in findings if f.category != "safe"])
        
        if any(f.score >= 100.0 for f in findings):
            result.threat_score = 95.0 + min((total - 100)/10, 5.0)  # max 100
        elif trigger_count >= 3:
            result.threat_score = max(90.0, min(total, 100.0))
        elif trigger_count >= 2:
            result.threat_score = max(70.0, min(total, 85.0))
        elif trigger_count >= 1:
            result.threat_score = max(40.0, min(total, 60.0))
        else:
            result.threat_score = min(total, 30.0)
            
        result.risk_level = self._calc_risk_level(result.threat_score)
        result.findings = findings
        result.category_scores = self._calc_category_scores(findings)

        return self._to_dict(result)

    # ─── HELPER METHODS ─────────────────────────────────────────

    def _is_legitimate(self, domain: str) -> bool:
        """Check if domain exactly matches a known legitimate domain."""
        for legit in self.legitimate_domains:
            if domain == legit or domain.endswith("." + legit):
                return True
        return False

    def _is_ip_address(self, domain: str) -> bool:
        """Check if domain is an IP address."""
        parts = domain.split('.')
        if len(parts) == 4:
            try:
                return all(0 <= int(p) <= 255 for p in parts)
            except ValueError:
                return False
        return False

    def _check_typosquatting(self, domain: str) -> ScanFinding | None:
        """Detect if domain is a typosquat of a legitimate brand."""
        base_domain = domain.split('.')[0]  # remove TLD

        # Apply typo substitutions to normalize
        normalized = base_domain
        for fake, real in self.typo_map.items():
            normalized = normalized.replace(fake, real)

        # Check against brand targets
        for brand_name, brand_variants in self.brand_targets.items():
            for variant in brand_variants:
                if variant != base_domain and normalized == variant:
                    return ScanFinding(
                        "url_risk", "critical", "Typosquatting Detected",
                        f"Domain '{domain}' uses character substitution to mimic '{variant}' ({brand_name.upper()}). This is a known phishing technique.",
                        30.0
                    )
                # Check for close misspellings (1 char diff)
                if len(variant) >= 4 and variant != base_domain:
                    if self._levenshtein_distance(base_domain, variant) == 1:
                        return ScanFinding(
                            "url_risk", "high", "Possible Typosquatting",
                            f"Domain '{base_domain}' is very similar to '{variant}' ({brand_name.upper()}) — possible intentional misspelling.",
                            20.0
                        )
        return None

    def _check_homoglyphs(self, domain: str) -> ScanFinding | None:
        """Detect Unicode homoglyph attacks."""
        has_homoglyph = False
        cleaned = domain
        for fake_char, real_char in self.homoglyphs.items():
            if fake_char in domain:
                has_homoglyph = True
                cleaned = cleaned.replace(fake_char, real_char)

        if has_homoglyph:
            return ScanFinding(
                "url_risk", "critical", "Homoglyph Attack",
                f"Domain uses Unicode lookalike characters to impersonate '{cleaned}'. These characters look identical to real letters but are different Unicode characters.",
                35.0
            )
        return None

    def _check_brand_in_domain(self, domain: str) -> ScanFinding | None:
        """Check if a brand name appears in an unofficial domain."""
        for brand_name, brand_variants in self.brand_targets.items():
            for variant in brand_variants:
                if variant in domain and not self._is_legitimate(domain):
                    # Make sure it's not just a substring false positive
                    if len(variant) >= 3:
                        return ScanFinding(
                            "brand_impersonation", "high", f"{brand_name.upper()} Brand Impersonation",
                            f"Domain '{domain}' contains '{variant}' but is NOT the official {brand_name.upper()} website. This is likely impersonation.",
                            20.0
                        )
        return None

    def _levenshtein_distance(self, s1: str, s2: str) -> int:
        """Calculate edit distance between two strings."""
        if len(s1) < len(s2):
            return self._levenshtein_distance(s2, s1)
        if len(s2) == 0:
            return len(s1)

        prev_row = range(len(s2) + 1)
        for i, c1 in enumerate(s1):
            curr_row = [i + 1]
            for j, c2 in enumerate(s2):
                insertions = prev_row[j + 1] + 1
                deletions = curr_row[j] + 1
                substitutions = prev_row[j] + (c1 != c2)
                curr_row.append(min(insertions, deletions, substitutions))
            prev_row = curr_row
        return prev_row[-1]

    def _calc_risk_level(self, score: float) -> str:
        if score >= 70:
            return "critical"
        elif score >= 45:
            return "dangerous"
        elif score >= 20:
            return "suspicious"
        return "safe"

    def _calc_category_scores(self, findings: list) -> dict:
        cats = {}
        for f in findings:
            if f.category not in cats:
                cats[f.category] = 0
            cats[f.category] += f.score
        return cats

    def _to_dict(self, result: ScanResult) -> dict:
        return {
            "input_type": result.input_type,
            "input_value": result.input_value,
            "threat_score": round(result.threat_score, 1),
            "risk_level": result.risk_level,
            "findings": [
                {
                    "category": f.category,
                    "severity": f.severity,
                    "title": f.title,
                    "description": f.description,
                    "score": f.score,
                }
                for f in result.findings
            ],
            "extracted_urls": result.extracted_urls,
            "url_breakdown": result.url_breakdown,
            "category_scores": result.category_scores,
        }


# Singleton
scanner = PhishingEngine()
