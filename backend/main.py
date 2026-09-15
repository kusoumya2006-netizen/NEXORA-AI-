from contextlib import asynccontextmanager
import uvicorn
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from backend.config import settings
from backend.database.seed import seed_database
from backend.api.routes import (
    analyze, voice, speaker, audio, conversation,
    risk, security, dashboard, calls, alerts, audit, health, pipeline
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("[NEXORA] Initializing backend application & database seed...")
    seed_database()
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="NEXORA — AI-Powered Real-Time Detection and Prevention of Voice Cloning Impersonation Attacks",
    lifespan=lifespan
)

# Ensure database tables exist right away on import for TestClient
seed_database()

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Custom Global Error Handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    print(f"[NEXORA API ERROR] Path: {request.url.path} Error: {str(exc)}")
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "data": None,
            "error": {
                "code": "INTERNAL_SERVER_ERROR",
                "message": "An internal system error occurred while processing the request."
            }
        }
    )

# Root Health Check (GET /health)
app.include_router(health.router, tags=["Health"])

# Register all API routes under both /api and /api/v1 for complete compatibility
all_routers = [
    (health.router, ["Health"]),
    (analyze.router, ["Orchestrator"]),
    (voice.router, ["Voice Detection"]),
    (speaker.router, ["Speaker Verification"]),
    (audio.router, ["Audio Analysis"]),
    (conversation.router, ["Conversation Risk"]),
    (risk.router, ["Risk Engine"]),
    (security.router, ["Security Response"]),
    (dashboard.router, ["Dashboard"]),
    (calls.router, ["Calls"]),
    (alerts.router, ["Alerts"]),
    (audit.router, ["Audit Logs"]),
    (pipeline.router, ["Pipeline"]),
]

for router_obj, tags in all_routers:
    # Mount on /api
    app.include_router(router_obj, prefix=settings.API_PREFIX, tags=tags)
    # Mount on /api/v1
    app.include_router(router_obj, prefix="/api/v1", tags=tags)

if __name__ == "__main__":
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
