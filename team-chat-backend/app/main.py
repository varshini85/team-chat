from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.db.db_session import Base, engine
from app.models import * 
from app.routers import auth_controller, channels_controller, messages_controller, websocket_controller

app = FastAPI(title="Team Chat App")

app = FastAPI()

@app.get("/")
def root():
    return {"message": "Backend is connected"}

Base.metadata.create_all(bind=engine)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5174",         
        "http://127.0.0.1:5174",
        "https://team-chat-w9qr.vercel.app/"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_controller.router, prefix="/auth", tags=["auth"])
app.include_router(channels_controller.router, prefix="/channels", tags=["channels"])
app.include_router(messages_controller.router, prefix="/messages", tags=["messages"])
app.include_router(websocket_controller.router, tags=["realtime"])

