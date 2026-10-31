from fastapi import APIRouter

from app.api.v1.endpoints import assistant, auth, catalogue, documents, health

api_router = APIRouter(prefix="/api/v1")
api_router.include_router(health.router)
api_router.include_router(auth.router)
api_router.include_router(assistant.router)
api_router.include_router(catalogue.router)
api_router.include_router(documents.router)
