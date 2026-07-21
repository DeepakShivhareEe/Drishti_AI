import urllib.request
import base64
import zlib
import json
import os

diagrams = {
    "ficn-vision-architecture.svg": """
graph TD
    A["📸 Multi-angle Image Capture<br/>(Front, Back, Tilted)"] --> B["⚙️ FastAPI Microservice<br/>(Port 8001)"]
    B --> C["🔍 View Validation<br/>(CRITICAL VIEW CHECK)"]
    C --> D["🧠 Multimodal Inference<br/>(Gemini 2.5 Flash)"]
    D --> E["📋 Forensic Analysis<br/>(Serial, OVI, Anomalies)"]
    E --> F["📄 JSON Screening Report"]
    F --> G["📡 Dispatch to Main Hub<br/>(/alerts/trigger)"]
    F --> H["🖥️ UI Rendering<br/>(Verdict & Reasoning)"]

    style A fill:#1e3a5f,color:#67e8f9
    style D fill:#7c2d12,color:#fdba74
    style F fill:#064e3b,color:#6ee7b7
    style G fill:#4c1d95,color:#c4b5fd
"""
}

public_dir = os.path.join(os.getcwd(), 'public')
if not os.path.exists(public_dir):
    os.makedirs(public_dir)

for filename, mermaid_code in diagrams.items():
    b64 = base64.b64encode(mermaid_code.strip().encode('utf-8')).decode('utf-8')
    url = f"https://mermaid.ink/svg/{b64}"
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'})
    
    filepath = os.path.join(public_dir, filename)
    try:
        with urllib.request.urlopen(req) as response, open(filepath, 'wb') as out_file:
            out_file.write(response.read())
        print(f"Generated {filename}")
    except urllib.error.HTTPError as e:
        print(f"Error {e.code} on {filename}: {e.read().decode('utf-8')}")
