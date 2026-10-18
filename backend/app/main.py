import asyncio
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from backend.app.core.config import settings
from backend.app.core.middleware import RequestIDMiddleware, LoggingMiddleware, ExceptionMiddleware
from backend.app.core.database import engine, Base, run_startup_migrations
from backend.app.api.v1 import auth, cases, uploads, reports, campaigns, system, ai, risk, investigation

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc"
)

@app.on_event("startup")
async def startup_event():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    await run_startup_migrations()

@app.get("/api/alerts")
async def get_alerts():
    return [
        {
            "id": "alert-1",
            "type": "IP",
            "value": "185.220.101.5",
            "severity": "CRITICAL",
            "confidence": 98,
            "caseId": "case-01",
            "fileName": "demo_sample.apk",
            "threatFamily": "Anubis",
            "createdAt": "2026-07-12T14:00:00Z"
        },
        {
            "id": "alert-2",
            "type": "Domain",
            "value": "update-server-v3.net",
            "severity": "HIGH",
            "confidence": 92,
            "caseId": "case-01",
            "fileName": "demo_sample.apk",
            "threatFamily": "Anubis",
            "createdAt": "2026-07-12T14:10:00Z"
        }
    ]

@app.get("/api/admin/executive-summary")
async def get_executive_summary():
    return {
        "copilotBriefing": {
            "en": "Active campaigns detected targeting banking applications via OTP interception techniques. Immediate review of high-risk cases recommended.",
            "hi": "ओटीपी इंटरसेप्शन तकनीकों के माध्यम से बैंकिंग अनुप्रयोगों को लक्षित करने वाले सक्रिय अभियानों का पता चला है। उच्च जोखिम वाले मामलों की तत्काल समीक्षा की सिफारिश की जाती है।",
            "kn": "OTP ಪ್ರತಿಬಂಧ ತಂತ್ರಗಳ ಮೂಲಕ ಬ್ಯಾಂಕಿಂಗ್ ಅಪ್ಲಿಕೇಶನ್‌ಗಳನ್ನು ಗುರಿಯಾಗಿಸುವ ಸಕ್ರಿಯ ಪ್ರಚಾರಗಳನ್ನು ಪತ್ತೆಹಚ್ಚಲಾಗಿದೆ. ಹೆಚ್ಚಿನ ಅಪಾಯದ ಪ್ರಕರಣಗಳ ತಕ್ಷಣದ ಪರಿಶೀಲನೆಯನ್ನು ಶಿಫಾರಸು ಮಾಡಲಾಗಿದೆ.",
            "ta": "OTP இடைமறிப்பு நுட்பங்கள் மூலம் வங்கி பயன்பாடுகளை இலக்காகக் கொண்ட செயலில் உள்ள பிரச்சாரங்கள் கண்டறியப்பட்டுள்ளன. அதிக ஆபத்துள்ள வழக்குகளை உடனடியாக மதிப்பாய்வு செய்ய பரிந்துரைக்கப்படுகிறது.",
            "te": "OTP అంతరాయం పద్ధతుల ద్వారా బ్యాంకింగ్ అప్లికేషన్‌లను లక్ష్యంగా చేసుకునే క్రియాశీల ప్రచారాలు కనుగొనబడ్డాయి. అధిక ప్రమాదం ఉన్న కేసుల తక్షణ సమీక్ష సిఫార్సు చేయబడింది."
        },
        "confidence": 94,
        "exposure": "High",
        "priority": "Immediate",
        "metrics": {
            "totalCases": 142,
            "criticalCasesCount": 18,
            "averageRiskScore": 74,
            "citizenExposure": "High"
        }
    }

# Exception mapping and request formatting middlewares
app.add_middleware(ExceptionMiddleware)
app.add_middleware(LoggingMiddleware)
app.add_middleware(RequestIDMiddleware)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth.router, prefix=f"{settings.API_V1_STR}/auth", tags=["Authentication"])
app.include_router(cases.router, prefix=f"{settings.API_V1_STR}/cases", tags=["Cases"])
app.include_router(cases.router, prefix="/api/cases", tags=["Cases Legacy"])
app.include_router(uploads.router, prefix=f"{settings.API_V1_STR}/uploads", tags=["Uploads"])
app.include_router(reports.router, prefix=f"{settings.API_V1_STR}/reports", tags=["Reports"])
app.include_router(campaigns.router, prefix=f"{settings.API_V1_STR}/campaigns", tags=["Campaigns"])
app.include_router(system.router, prefix=f"{settings.API_V1_STR}/system", tags=["System"])

@app.get(f"{settings.API_V1_STR}/health", tags=["Health"])
@app.get("/api/v1/health", tags=["Health"])
async def direct_health_endpoint():
    return await system.health_check()

app.include_router(ai.router, prefix=f"{settings.API_V1_STR}/ai", tags=["AI"])
app.include_router(ai.router, prefix="/api/copilot", tags=["AI Copilot Direct"])
app.include_router(risk.router, prefix=f"{settings.API_V1_STR}/risk", tags=["Risk"])
app.include_router(investigation.router, prefix=f"{settings.API_V1_STR}/investigation", tags=["Investigation"])


# WebSocket Manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: dict[str, list[WebSocket]] = {}

    async def connect(self, case_id: str, websocket: WebSocket):
        await websocket.accept()
        if case_id not in self.active_connections:
            self.active_connections[case_id] = []
        self.active_connections[case_id].append(websocket)

    def disconnect(self, case_id: str, websocket: WebSocket):
        if case_id in self.active_connections:
            self.active_connections[case_id].remove(websocket)
            if not self.active_connections[case_id]:
                del self.active_connections[case_id]

    async def broadcast_to_case(self, case_id: str, message: dict):
        if case_id in self.active_connections:
            for connection in self.active_connections[case_id]:
                await connection.send_json(message)

manager = ConnectionManager()

@app.websocket("/ws/analysis/{case_id}")
async def websocket_endpoint(websocket: WebSocket, case_id: str):
    await manager.connect(case_id, websocket)
    try:
        # Simulate processing progress updates
        await manager.broadcast_to_case(case_id, {"event": "analysis_started", "case_id": case_id, "progress": 10})
        await asyncio.sleep(2)
        await manager.broadcast_to_case(case_id, {"event": "static_started", "case_id": case_id, "progress": 30})
        await asyncio.sleep(2)
        await manager.broadcast_to_case(case_id, {"event": "static_complete", "case_id": case_id, "progress": 60})
        await asyncio.sleep(2)
        await manager.broadcast_to_case(case_id, {"event": "ai_processing", "case_id": case_id, "progress": 85})
        await asyncio.sleep(2)
        await manager.broadcast_to_case(case_id, {"event": "report_ready", "case_id": case_id, "progress": 100})
        
        while True:
            # Keep connection alive
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(case_id, websocket)
