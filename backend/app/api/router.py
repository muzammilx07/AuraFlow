from fastapi import APIRouter
from .workflow import router as workflow_router
from .chat import router as chat_router
#new
router = APIRouter()
router.include_router(workflow_router, prefix="/api")
router.include_router(chat_router, prefix="/api")