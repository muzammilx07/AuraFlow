from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.router import router

app = FastAPI()

origins = [
    "http://localhost:5173",                
    "https://aura-flow.vercel.app",         # ✅ No trailing slash
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)
