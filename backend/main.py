"""
CryptoTrace-I4C — Main FastAPI Application
Smart India Hackathon 2026 • Problem Statement: PS26183
Ministry of Home Affairs • Indian Cyber Crime Coordination Centre (I4C)
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .api.routes import trace, vasp, cases, legal

app = FastAPI(
    title="CryptoTrace-I4C API",
    description="Real-Time Blockchain Forensics & VASP Attribution Engine for Indian Law Enforcement",
    version="1.0.0",
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
app.include_router(vasp.router, prefix="/api")
app.include_router(cases.router, prefix="/api")
app.include_router(legal.router, prefix="/api")

@app.get("/", tags=["Root"])
async def root():
    return {
        "platform": "CryptoTrace-I4C",
        "status": "OPERATIONAL",
        "hackathon": "Smart India Hackathon 2026",
        "problem_statement": "PS26183",
        "agency": "Indian Cyber Crime Coordination Centre (I4C) / MHA",
        "docs": "/docs",
        "health": "/api/health"
    }

@app.get("/api/health", tags=["Root"])
async def health_check():
    return {
        "status": "HEALTHY",
        "services": {
            "fastapi": "OK",
            "tracer_engine": "ACTIVE",
            "vasp_registry": "LOADED",
            "legal_notice_engine": "READY"
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
