# 🛡️ CryptoTrace-I4C

> **AI-Powered Real-Time Blockchain Forensics & VASP Attribution Platform for Indian Law Enforcement**  
> **Smart India Hackathon (SIH) 2026 • Problem Statement ID: PS26183**  
> **Ministry of Home Affairs (MHA) • Indian Cyber Crime Coordination Centre (I4C)**

---

## 📌 Executive Summary
India suffers ₹1,750+ crore in annual crypto fraud losses. Cybercriminals exploit automated "peel chains" and cross-chain hopping to off-ramp stolen assets to crypto exchanges (VASPs) within 30–60 minutes, while manual investigation takes weeks. 

**CryptoTrace-I4C** provides:
1. **Multi-Hop Automated Tracer**: Sub-second heuristic graph de-layering across TRON (USDT-TRC20), Ethereum, and Bitcoin.
2. **FIU-IND VASP Registry**: Automatic identification of recipient exchange hot wallets (Binance, CoinDCX, WazirX, Mudrex, Bybit).
3. **Automated Legal Notice Engine**: 1-click generation of court-admissible Section 91 & 102 CrPC (BNSS 94/106) freezing directives with cryptographic SHA-256 evidence logs.
4. **Interactive Forensic Graph**: React Flow canvas showing the live money flow from victim to suspect mules to exchange cash-out point.

---

## 👥 Team Roles & Responsibilities

| Role | Member | Focus Area | Branch |
|---|---|---|---|
| **Member 1 (Lead)** | You | Backend Lead, FastAPI, Data Models, Orchestration | `member1/backend-tracer` |
| **Member 2** | Frontend Lead | Next.js 15, React Flow Canvas, Cyber Police UI | `member2/frontend-ui` |
| **Member 3** | Blockchain Dev | Web3.py, RPCs, TronGrid/Etherscan, VASP DB | `member3/blockchain-apis` |
| **Member 4** | AI/ML Dev | Risk Scoring Engine, Peel Chain & Mixer Detection | `member4/ai-risk-scoring` |
| **Member 5** | Legal & Domain | Sec 91 CrPC Notice Generator, FIR Parser, Demo Cases | `member5/legal-templates` |
| **Member 6** | DevOps & Floater | Docker Compose, Git Coordination, Pitch Deck Lead | `member6/devops-setup` |

---

## 🏗️ Repository Structure

```
cryptotrace-i4c/
├── backend/                    ← FastAPI Core (Members 1, 3, 4, 5)
│   ├── main.py                 ← Application entry point & CORS
│   ├── requirements.txt        ← Python dependencies
│   ├── api/routes/
│   │   ├── trace.py            ← POST /api/trace, GET /api/trace/{case_id}
│   │   ├── vasp.py             ← GET /api/vasp/{address}, GET /api/vasp/list
│   │   ├── cases.py            ← Case management & intake
│   │   └── legal.py            ← Section 91 CrPC notice endpoints
│   ├── core/
│   │   ├── models.py           ← Pydantic schemas
│   │   ├── tracer.py           ← Multi-hop heuristic engine
│   │   ├── vasp_registry.py    ← Exchange wallet attribution
│   │   ├── legal_generator.py  ← Statutory notice generator
│   │   └── graph_builder.py    ← React Flow export transformer
│   └── data/
│       ├── vasp_database.json  ← Exchange database
│       └── sample_cases.json   ← Pre-loaded demo cases
│
├── frontend/                   ← Next.js 15 UI (Members 2, 4)
│   ├── src/app/                ← Pages (Dashboard, Trace Graph, Legal Notice)
│   ├── src/components/         ← React Flow graph, Case intake form
│   └── src/lib/api.ts          ← Typed API client
│
├── docker-compose.yml          ← Orchestration for 1-click startup
└── README.md
```

---

## 🚀 Quickstart for Developers

### 1. Backend Setup (Port 8000)
```powershell
# From project root
pip install -r backend/requirements.txt

# Run server with hot reload
python -m uvicorn backend.main:app --reload --port 8000
```
Interactive API docs will be available at: `http://localhost:8000/docs`

### 2. Frontend Setup (Port 3000)
```powershell
cd frontend
npm install
npm run dev
```
Open `http://localhost:3000` in your browser.

---

## 📡 Core API Contracts

### `POST /api/trace`
Traces transactions from a victim/suspect wallet and detects money laundering hops.
```json
{
  "victim_wallet": "TXqHx87KmN3vL8p2Qw5kR1m9xP4y8n2m7f",
  "suspect_wallet": "TR8nh2K1m9xP4y8n2m7fB3dL1jV5xK8rT6",
  "initial_amount": 45000.0,
  "token": "USDT-TRC20",
  "ncrp_ref": "1930-2026-AUG-0948",
  "fir_number": "FIR-2026/CYBER/409"
}
```

### `GET /api/vasp/{address}`
Identifies whether a destination address belongs to an FIU-IND registered exchange.

### `POST /api/legal/notice`
Generates a formal Section 91/102 CrPC notice for freezing accounts.
