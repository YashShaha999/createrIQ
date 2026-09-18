import os
import sys
import uvicorn
from app.main import app
from app.core.config import settings

# Ensure UTF-8 output on Windows terminal
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

if __name__ == "__main__":
    port = int(os.getenv("PORT", settings.PORT))
    print("=" * 60)
    print(" 🚀 CreatorIQ Backend Server Starting...")
    print(f" 📍 Server URL:      http://127.0.0.1:{port}")
    print(f" 📚 Swagger UI Docs: http://127.0.0.1:{port}/docs")
    print(f" 🍃 MongoDB Health:  http://127.0.0.1:{port}/health/db")
    print("=" * 60)
    uvicorn.run("app.main:app", host="127.0.0.1", port=port, reload=True)
