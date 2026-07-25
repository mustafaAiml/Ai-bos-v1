import sys
import os
from fastapi import APIRouter
from server.schemas import SystemStatusResponse
from server.config import HAS_GENAI

router = APIRouter(tags=["System Status & Health"])

@router.get("/health", response_model=SystemStatusResponse)
@router.get("/api/python/status", response_model=SystemStatusResponse)
def get_system_status():
    return SystemStatusResponse(
        status="active_and_healthy",
        python_version=sys.version.split()[0],
        genai_sdk_available=HAS_GENAI,
        engine="Python 3.10 FastAPI & Agentic AI Core",
        has_api_key=bool(os.environ.get("GEMINI_API_KEY"))
    )
