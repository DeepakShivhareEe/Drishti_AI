import os
import json
import httpx
import logging
from io import BytesIO
from PIL import Image
from dotenv import load_dotenv
from fastapi import FastAPI, UploadFile, File, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from google import genai

# Load environment variables
load_dotenv()

# Configure clean terminal logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("FICN_Agent")

app = FastAPI(
    title="DRISHTI - Agentic FICN Screening Core",
    description="Multimodal LLM Forensic Currency Analysis"
)

# --- CORS BLOCK ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Gemini API via the new google-genai SDK
api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    raise RuntimeError("GEMINI_API_KEY environment variable is not set. Pass it via Docker: docker run -e GEMINI_API_KEY=your_key ...")
client = genai.Client(api_key=api_key)

# Model identifier (Gemini 2.5 Flash for rapid multimodal inference)
MODEL_ID = "gemini-2.5-flash"

# Target integration endpoint when combined with DRISHTI Hub
HUB_ALERT_URL = "http://host.docker.internal:8000/api/v1/alerts/trigger"


@app.post("/analyze/session", status_code=status.HTTP_200_OK)
async def process_screening_session(
    front_flat: UploadFile = File(...), 
    back_flat: UploadFile = File(...), 
    front_tilted: UploadFile = File(...)
):
    """
    Accepts 3 key views (Front, Back, Front-Tilted) and passes them to the Gemini Forensic Agent.
    """
    logger.info("Received 3 frames. Booting DRISHTI Forensic Agent...")
    
    try:
        # 1. Read images into memory and convert to PIL format for Gemini
        def load_image(file_bytes):
            return Image.open(BytesIO(file_bytes)).convert("RGB")

        images = [
            load_image(await front_flat.read()),
            load_image(await back_flat.read()),
            load_image(await front_tilted.read())
        ]

        # 2. The Master Prompt
        forensic_prompt = """
        You are 'DRISHTI', an advanced AI forensic currency examiner for the Reserve Bank of India.
        I am providing you with 3 images of a suspected Indian Rupee banknote in this exact order:
        1. The Front of the note (Flat)
        2. The Back of the note (Flat)
        3. The Front of the note (Tilted at an angle)
        
        --- CRITICAL VIEW CHECK (Execute FIRST, before any forensic analysis) ---
        Before performing any analysis, verify that the 3 images represent genuinely distinct views:
        - Image 1 MUST show the FRONT face of the note (Gandhi portrait side).
        - Image 2 MUST show the BACK face of the note (motif/emblem side). It should look visually different from Image 1.
        - Image 3 MUST show the FRONT face again, but captured at a TILTED angle (showing light reflection or perspective distortion compared to Image 1).
        If all 3 images appear to show the same view (e.g., three photos of the Front, or three identical images), 
        you MUST immediately fail the analysis and output the error JSON specified below. Do NOT proceed with forensic checks.
        --- END VIEW CHECK ---

        Perform a strict forensic analysis:
        1. Read and extract the exact alphanumeric serial number printed on the note.
        2. Verify the presence of standard RBI currency markers (watermarks, security threads, Gandhi portrait, back motifs).
        3. Analyze color shifting. Look closely at the tilted front image compared to the flat front image. Did the OVI ink on the denomination number shift color or reflect light differently? Flat photocopies will lack this.
        4. Detect anomalies like flat digital graphics, cut-off edges, red lines drawn through the note, or watermarked stock photo traits.

        You MUST respond with ONLY a raw JSON object. Do not use markdown blocks (```json). Output exactly this structure, filling in your forensic determinations:
        {
            "source_service": "ficn-vision",
            "threat_level": "INFO", 
            "incident_type": "Currency Screening Execution",
            "payload": {
                "overall_confidence": 95.5, 
                "status_verdict": "Appears Genuine", 
                "forensic_reasoning": "YOUR_CONCISE_1_TO_2_SENTENCE_EXPLANATION_HERE",
                "detected_serial": "YOUR_EXTRACTED_SERIAL_HERE",
                "checks": {
                    "image_quality": "PASS",
                    "alignment_homography": "SUCCESS",
                    "color_consistency": "PASS"
                }
            }
        }
        
        Rules for the JSON payload:
        - Populate 'forensic_reasoning' with a concise, 1-2 sentence forensic explanation of your findings. If genuine, explain why it passed. If suspicious/error, explicitly list the anomalies seen.
        - If the note looks fake, digital, or is a stock photo, change 'threat_level' to 'CRITICAL'.
        - If fake, change 'status_verdict' to "Suspicious – Counterfeit Characteristics Detected".
        - Adjust 'overall_confidence' based on your certainty (0.0 to 99.9).
        - If the images clearly do not contain a banknote, output 'overall_confidence': 0.0 and 'status_verdict': 'Invalid Target'.
        - If the CRITICAL VIEW CHECK fails (duplicate or identical views detected), you MUST output: 'threat_level': 'WARNING', 'overall_confidence': 0.0, and 'status_verdict': "User Error: Please provide distinct Front, Back, and Tilted views for analysis."
        """

        # 3. Execute the Multimodal LLM Call via the new google-genai SDK
        logger.info("Transmitting 3-angle forensic payload to Gemini Vision Engine...")
        response = client.models.generate_content(
            model=MODEL_ID,
            contents=[forensic_prompt, images[0], images[1], images[2]]
        )
        
        # 4. Parse the AI's JSON Response
        raw_text = response.text.strip()
        # Strip markdown if the LLM disobeys the instruction
        if raw_text.startswith("```json"):
            raw_text = raw_text[7:-3]
            
        screening_report = json.loads(raw_text)
        logger.info(f"Agent analysis complete. Verdict: {screening_report['payload']['status_verdict']}")

        # 5. Dispatch Mechanism to the Main Hub (Port 8000) for Organized Ring Detection
        async with httpx.AsyncClient() as hub_client:
            try:
                hub_response = await hub_client.post(HUB_ALERT_URL, json=screening_report, timeout=3.0)
                if hub_response.status_code == 201:
                    logger.info("Successfully synced alert with DRISHTI Command Center.")
            except (httpx.ConnectError, httpx.TimeoutException):
                logger.warning("DRISHTI Main Hub is offline. Operating in Sandbox mode.")

        return screening_report

    except json.JSONDecodeError:
        logger.error("The LLM returned malformed JSON.")
        raise HTTPException(status_code=500, detail="Forensic Agent failed to generate a structured report.")
    except Exception as e:
        logger.error(f"Error processing session: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal agent error: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8001, reload=True)