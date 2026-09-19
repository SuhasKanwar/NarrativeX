from fastapi import FastAPI
import uvicorn
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

from utils.logger import logger
from utils.exception import NarrativeXException

from config import ALLOWED_ORIGINS, HOST, PORT

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

from routers import agent

app.include_router(agent.router)

@app.get("/", tags=["Root"])
def root() -> dict:
    return {
        "success": True,
        "message": "Welcome to NarrativeX AI Service. Visit /docs for API documentation."
    }

@app.get("/health", tags=["Health"])
def health() -> dict:
    return {
        "success": True,
        "message": "NarrativeX AI Service is healthy and running successfully."
    }

@app.exception_handler(NarrativeXException)
def narrativex_exception_handler(request, exc: NarrativeXException):
    logger.error(f"Error occurred in script: {exc.file_name} at line: {exc.line_number} with message: {exc.error_message}")
    return {
        "success": False,
        "message": f"Error occurred in script: {exc.file_name} at line: {exc.line_number} with message: {exc.error_message}"
    }

if __name__ == "__main__":
    uvicorn.run(app, host=HOST, port=PORT)