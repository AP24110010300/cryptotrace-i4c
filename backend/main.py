"""
CryptoTrace-I4C — Main FastAPI Application
Smart India Hackathon 2026 • Problem Statement: PS26183
Ministry of Home Affairs • Indian Cyber Crime Coordination Centre (I4C)
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .api.routes import trace, vasp, cases, legal, risk

app = FastAPI(
    title="CryptoTrace-I4C API",
    description="Real-Time Blockchain Forensics & VASP Attribution Engine for Indian Law Enforcement",
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Enable CORS for Next.js frontend (localhost:3000) and all local development devices
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API Route modules
app.include_router(trace.router, prefix="/api")
app.include_router(vasp.router,  prefix="/api")
app.include_router(cases.router, prefix="/api")
app.include_router(legal.router, prefix="/api")
app.include_router(risk.router,  prefix="/api")   # M4: AI Risk Scoring

@app.get("/", tags=["Root"])
async def root():
    return {
        "platform":         "CryptoTrace-I4C",
        "version":          "2.0.0",
        "status":           "OPERATIONAL",
        "hackathon":        "Smart India Hackathon 2026",
        "problem_statement":"PS26183",
        "agency":           "Indian Cyber Crime Coordination Centre (I4C) / MHA",
        "modules": {
            "blockchain_clients": "ACTIVE (M3) — TronGrid + Etherscan + Blockstream",
            "risk_scorer":        "ACTIVE (M4) — Heuristic AI Risk Engine",
            "pattern_detector":   "ACTIVE (M4) — Peel Chain / Layering / Smurfing",
            "tracer_engine":      "ACTIVE (M1+M3+M4)",
            "vasp_registry":      "LOADED (M5)",
            "legal_notice_engine":"READY  (M5)",
        },
        "docs":   "/docs",
        "health": "/api/health"
    }

@app.get("/api/health", tags=["Root"])
async def health_check():
    return {
        "status": "HEALTHY",
        "services": {
            "fastapi":              "OK",
            "tracer_engine":        "ACTIVE",
            "blockchain_clients":   "ACTIVE",
            "risk_scorer":          "ACTIVE",
            "pattern_detector":     "ACTIVE",
            "vasp_registry":        "LOADED",
            "legal_notice_engine":  "READY"
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
