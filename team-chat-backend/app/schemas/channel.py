from pydantic import BaseModel
from typing import Optional, List
from app.schemas.user import UserBase

class ChannelBase(BaseModel):
    id: int
    name: str
    description: Optional[str] = None

class ChannelCreate(BaseModel):
    name: str
    description: Optional[str] = None

class ChannelWithMembers(ChannelBase):
    members: List[UserBase] = []

class UserBase(BaseModel):
    id: int
    name: str
    email: str