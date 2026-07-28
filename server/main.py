import os
import sys
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from server.routers.speech import router as speech_router
from server.routers.shops import router as shops_router
from server.routers.insights import router as insights_router
from server.routers.bills import router as bills_router
from server.routers.status import router as status_router
from server.routers.auth import router as auth_router
from server.routers.products import router as products_router
from server.routers.agents import router as agents_router
from server.routers.ml import router as ml_router
from server.routers.templates import router as templates_router
from server.routers.reports import router as reports_router
from server.routers.ai_chat import router as ai_chat_router

app = FastAPI(
    title="AI BOS - Business Operating System Engine",
    description="Enterprise Business Operating System Core APIs",
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
app.include_router(auth_router)
app.include_router(speech_router)
app.include_router(shops_router)
app.include_router(insights_router)
app.include_router(bills_router)
app.include_router(products_router)
app.include_router(agents_router)
app.include_router(ml_router)
app.include_router(templates_router)
app.include_router(reports_router)
app.include_router(ai_chat_router)

@app.get("/api/health")
def health_check():
    return {
        "app": "AI BOS - Business Operating System Engine",
        "status": "online",
        "python_version": sys.version.split()[0]
    }

# Mount static files if dist folder exists
dist_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "dist")
if os.path.exists(dist_dir):
    app.mount("/assets", StaticFiles(directory=os.path.join(dist_dir, "assets")), name="assets")

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        file_path = os.path.join(dist_dir, full_path)
        if os.path.exists(file_path) and os.path.isfile(file_path):
            return FileResponse(file_path)
        return FileResponse(os.path.join(dist_dir, "index.html"))

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", os.environ.get("PYTHON_PORT", 3000)))
    uvicorn.run("server.main:app", host="0.0.0.0", port=port, reload=True)

