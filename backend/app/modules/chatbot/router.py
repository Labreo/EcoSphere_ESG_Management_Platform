from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlmodel import Session
from app.database import get_session
from app.modules.auth.service import get_current_user
from app.modules.auth.models import Employee
from app.modules.chatbot.service import chat_with_ecobot, clear_session, get_esg_tips, get_esg_reference

router = APIRouter(prefix="/chatbot", tags=["Chatbot"])

class ChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = None

class ChatResponse(BaseModel):
    response: str
    session_id: str
    timestamp: str
    source: str

@router.post("/chat")
def chat(
    data: ChatRequest,
    current_user: Employee = Depends(get_current_user),
):
    return chat_with_ecobot(data.message, data.session_id, current_user)

@router.delete("/chat/session/{session_id}")
def clear_chat_session(session_id: str):
    clear_session(session_id)
    return {"success": True, "message": "Conversation cleared"}

@router.get("/tips")
def get_tips():
    return {"success": True, "data": get_esg_tips()}

@router.get("/reference")
def get_reference():
    return {"success": True, "data": get_esg_reference()}
