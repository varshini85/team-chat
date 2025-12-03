from pydantic import BaseModel
from datetime import datetime
from app.schemas.user import UserBase

class MessageBase(BaseModel):
    id: int
    text: str
    created_at: datetime
    sender: UserBase

class MessageCreate(BaseModel):
    text: str
