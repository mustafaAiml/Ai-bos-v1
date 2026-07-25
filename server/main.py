import os
import sys
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from server.routers.speech import router as speech_router
from server.routers.shops import router as shops_router
from server.routers.insights import router as insights_router
from server.routers.bills import router as bills_router
from server.routers.status import router as status_router

app = FastAPI(
    title="zyroX Commerce Suite - Python FastAPI Backend",
    description="Formal FastAPI server with Pydantic validation, Google Maps grounding & Gemini AI intelligence",
    version="2.0.0"
)

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register Formal FastAPI Routers
app.include_router(status_router)
app.include_router(speech_router)
app.include_router(shops_router)
app.include_router(insights_router)
app.include_router(bills_router)

@app.get("/")
def root_endpoint():
    return {
        "app": "zyroX Commerce Suite - Python FastAPI Server",
        "status": "online",
        "python_version": sys.version.split()[0],
        "documentation": "/docs"
    }

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PYTHON_PORT", 8000))
    uvicorn.run("server.main:app", host="0.0.0.0", port=port, reload=True)
