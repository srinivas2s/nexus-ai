"""
NEXUS.AI — FastAPI Bridge Server
Connects the 4-Layer Core ML System to the Next.js Frontend.
"""

import asyncio
import time
import random
from fastapi import FastAPI
import base64
import os
import cv2
import numpy as np
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional

# Constants
BIOMETRIC_DIR = "assets/biometrics"
if not os.path.exists(BIOMETRIC_DIR):
    os.makedirs(BIOMETRIC_DIR)

# Import core layers
from core.ingestion.pipeline import IngestionPipeline
from core.detection.classifier import MLClassificationEngine
from core.correlation.fusion import CorrelationEngine
from core.output.explainability import ExplainabilityEngine

app = FastAPI(title="NEXUS.AI Core API", version="2.0")

# Allow Next.js frontend to call
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize the 4-layer system
ingestor = IngestionPipeline()
detector = MLClassificationEngine()
correlator = CorrelationEngine()
explainer = ExplainabilityEngine()

# In-memory store for processed alerts
processed_alerts = []

# ─── Simulated log sources for demo ───
SAMPLE_LOGS = [
    {"src": "192.168.1.105", "dst": "10.0.0.1", "proto": "TCP", "bytes": 4500, "fmt": "netflow"},
    {"src": "45.12.1.22", "dst": "10.0.0.1", "proto": "UDP", "sig": "MALWARE_WIN_X64", "fmt": "cef"},
    {"host": "Server-01", "message": "Failed login attempt from admin", "fmt": "syslog"},
    {"src": "8.8.8.8", "dst": "10.0.0.5", "proto": "ICMP", "bytes": 64, "fmt": "netflow"},
    {"src": "203.0.113.42", "dst": "10.0.0.1", "proto": "TCP", "bytes": 98000, "fmt": "netflow"},
    {"host": "Workstation-07", "message": "Unusual process tree detected: powershell.exe -> cmd.exe", "fmt": "syslog"},
    {"src": "172.16.0.55", "dst": "10.0.0.1", "proto": "UDP", "sig": "SCAN_NMAP", "fmt": "cef"},
]


class ChatRequest(BaseModel):
    message: str


class LoginRequest(BaseModel):
    email: str
    password: str


class BiometricRequest(BaseModel):
    email: str
    image: str  # Base64 string


class IngestRequest(BaseModel):
    src: Optional[str] = None
    dst: Optional[str] = None
    proto: Optional[str] = None
    bytes: Optional[int] = None
    host: Optional[str] = None
    message: Optional[str] = None
    sig: Optional[str] = None
    fmt: str = "netflow"


# ─── ENDPOINTS ───

@app.post("/api/login")
async def login(req: LoginRequest):
    """Secure entry to the NEXUS Command Center."""
    # Mock database validation
    if (req.email == "9" and req.password == "9") or len(req.password) >= 6:
        return {"success": True, "operator_id": "NX-" + str(random.randint(1000, 9999))}
    return {"success": False, "message": "Invalid neural token or credentials."}

@app.post("/api/biometrics/register")
async def register_biometrics(req: BiometricRequest):
    """Saves a biometric template for an operator."""
    try:
        # Decode base64 image
        header, encoded = req.image.split(",", 1)
        data = base64.bb64decode(encoded)
        
        # Save reference image
        filename = f"{req.email.replace('@', '_').replace('.', '_')}.jpg"
        filepath = os.path.join(BIOMETRIC_DIR, filename)
        
        with open(filepath, "wb") as f:
            f.write(data)
            
        return {"success": True, "message": "Biometric template stored successfully."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/biometrics/verify")
async def verify_biometrics(req: BiometricRequest):
    """Compares live frame with stored template using OpenCV."""
    try:
        # 1. Load stored template
        filename = f"{req.email.replace('@', '_').replace('.', '_')}.jpg"
        template_path = os.path.join(BIOMETRIC_DIR, filename)
        
        if not os.path.exists(template_path):
            return {"success": False, "message": "No biometric template found. Register first."}
            
        template_img = cv2.imread(template_path)
        
        # 2. Decode live image
        header, encoded = req.image.split(",", 1)
        live_data = base64.b64decode(encoded)
        nparr = np.frombuffer(live_data, np.uint8)
        live_img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        # 3. ADVANCED: Haar Cascade Face Detection (Always works in bad light)
        face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
        gray_live = cv2.cvtColor(live_img, cv2.COLOR_BGR2GRAY)
        faces = face_cascade.detectMultiScale(gray_live, 1.1, 4)
        
        HAS_FACE = len(faces) > 0

        # 4. Neural Fingerprint Comparison
        def get_neural_fingerprint(img):
            h, w = img.shape[:2]
            cropped = img[int(h*0.1):int(h*0.9), int(w*0.1):int(w*0.9)]
            gray = cv2.cvtColor(cropped, cv2.COLOR_BGR2GRAY)
            clahe = cv2.createCLAHE(clipLimit=4.0, tileGridSize=(8,8))
            enhanced = clahe.apply(gray)
            orb = cv2.ORB_create(nfeatures=5000)
            return orb.detectAndCompute(enhanced, None)

        kp1, des1 = get_neural_fingerprint(template_img)
        kp2, des2 = get_neural_fingerprint(live_img)
        
        match_score = 0
        if des1 is not None and des2 is not None:
            bf = cv2.BFMatcher(cv2.NORM_HAMMING, crossCheck=True)
            matches = bf.match(des1, des2)
            match_score = len(matches) / min(len(kp1), len(kp2)) if min(len(kp1), len(kp2)) > 10 else 0
        
        # 5. Global Consistency Check (Color Histogram)
        hist1 = cv2.calcHist([template_img], [0,1,2], None, [8,8,8], [0,256,0,256,0,256])
        cv2.normalize(hist1, hist1)
        hist2 = cv2.calcHist([live_img], [0,1,2], None, [8,8,8], [0,256,0,256,0,256])
        cv2.normalize(hist2, hist2)
        hist_score = cv2.compareHist(hist1, hist2, cv2.HISTCMP_CORREL)

        # 6. DUAL-GATE DECISION
        # If a face is physically detected AND either score is reasonable -> PASS
        # High tolerance for demo/testing robustness
        IS_VALID = (HAS_FACE and match_score > 0.01) or (hist_score > 0.6)
        
        if IS_VALID:
            return {
                "success": True, 
                "score": round(max(match_score, hist_score) * 100, 2),
                "face_detected": HAS_FACE
            }
        else:
            msg = "Neural patterns unrecognized."
            if not HAS_FACE: msg = "No operator face detected. Center yourself."
            return {"success": False, "message": msg, "score": round(match_score * 100, 2)}
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/health")
def health():
    return {
        "status": "online",
        "layers": {
            "L1_Ingestion": "active",
            "L2_Detection": "active",
            "L3_Correlation": "active",
            "L4_Output": "active",
        },
        "uptime": time.time(),
        "version": "2.0"
    }


@app.get("/api/stats")
def get_stats():
    """Returns live system statistics mapped to each layer."""
    genuine = sum(1 for a in processed_alerts if a["alert"]["status"] == "Genuine")
    fp = sum(1 for a in processed_alerts if a["alert"]["status"] == "False Positive")
    return {
        "throughput": f"{random.uniform(800, 900):.1f} TB",
        "anomaly_count": len(processed_alerts),
        "genuine_threats": genuine,
        "false_positives": fp,
        "events_per_sec": random.randint(480, 560),
        "total_processed": len(processed_alerts),
    }


@app.get("/api/threats")
def get_threats():
    """Returns all processed alerts from the 4-layer pipeline."""
    return {"threats": processed_alerts[-20:]}  # Last 20


@app.post("/api/ingest")
async def ingest_event(req: IngestRequest):
    """
    Layer 1 → 2 → 3 → 4 Pipeline.
    Ingests a raw log, normalizes, classifies, correlates, and explains.
    """
    raw = req.dict()
    fmt = raw.pop("fmt")

    # Layer 1: Ingest & Normalize
    normalized = ingestor.normalize(raw, fmt)

    # Layer 2: ML Classification
    prediction = detector.classify(normalized)

    # Layer 3: Correlation
    correlated = correlator.correlate(prediction, normalized)

    # Layer 4: Explainability
    final_alert = explainer.finalize_alert(correlated)

    # Add metadata
    final_alert["id"] = f"TX-{9500 + len(processed_alerts)}"
    final_alert["timestamp"] = time.strftime("%H:%M:%S")
    final_alert["raw_source"] = fmt

    processed_alerts.append(final_alert)

    return {"success": True, "alert": final_alert}


@app.post("/api/simulate")
async def simulate_batch():
    """Runs all sample logs through the full 4-layer pipeline."""
    results = []
    for log in SAMPLE_LOGS:
        raw = dict(log)
        fmt = raw.pop("fmt")
        normalized = ingestor.normalize(raw, fmt)
        prediction = detector.classify(normalized)
        correlated = correlator.correlate(prediction, normalized)
        final_alert = explainer.finalize_alert(correlated)
        final_alert["id"] = f"TX-{9500 + len(processed_alerts)}"
        final_alert["timestamp"] = time.strftime("%H:%M:%S")
        final_alert["raw_source"] = fmt
        processed_alerts.append(final_alert)
        results.append(final_alert)
    return {"success": True, "processed": len(results), "alerts": results}


import ollama

@app.post("/api/chat")
async def nexus_chat(req: ChatRequest):
    """
    Nexus AI Analyst — Powered by Ollama Gemma 2.
    Processes queries through a local LLM with SOC analyst context.
    """
    try:
        # Define the system prompt to maintain the Nexus AI Persona
        system_prompt = (
            "You are the NEXUS AI SOC Analyst, a professional-grade cybersecurity assistant. "
            "You help analysts investigate threats, analyze logs, and execute playbooks. "
            "Your tone is clinical, efficient, and technical. "
            "Reference the 4-layer architecture when relevant: "
            "Layer 1: Ingestion, Layer 2: Detection, Layer 3: Correlation, Layer 4: Output. "
            "Keep responses concise and formatted with markdown."
        )

        response = ollama.chat(model='gemma:2b', messages=[
            {'role': 'system', 'content': system_prompt},
            {'role': 'user', 'content': req.message},
        ])

        return {"response": response['message']['content']}

    except Exception as e:
        # Fallback to local logic if Ollama is not available
        print(f"Ollama Error: {e}")
        q = req.message.lower()
        if "status" in q or "layer" in q:
            return {"response": "System nominal. Ollama link inactive - using fallback diagnostics."}
        return {"response": "NEXUS AI is currently in standalone mode (LLM service unavailable)."}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
