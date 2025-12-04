from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.db_session import get_db
from app.schemas.channel import ChannelBase, ChannelCreate, UserBase
from app.services.channel_service import (
    create_channel,
    list_channels,
    list_user_channels,
    join_channel,
    leave_channel,
    list_channel_members
)
from app.utils.deps import get_current_user

router = APIRouter()

@router.post("/", response_model=ChannelBase)
def create_new_channel(
    payload: ChannelCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    channel = create_channel(db, current_user, payload)
    return channel

@router.get("/", response_model=List[ChannelBase])
def get_all_channels(db: Session = Depends(get_db)):
    return list_channels(db)

@router.get("/me", response_model=List[ChannelBase])
def get_my_channels(
    db: Session = Depends(get_db), current_user=Depends(get_current_user)
):
    return list_user_channels(db, current_user)

@router.post("/{channel_id}/join", response_model=ChannelBase)
def join(
    channel_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    channel = join_channel(db, current_user, channel_id)
    return channel

@router.post("/{channel_id}/leave")
def leave(
    channel_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    leave_channel(db, current_user, channel_id)
    return {"detail": "Left channel"}

@router.get("/{channel_id}/members", response_model=List[UserBase])
def get_channel_members(
    channel_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    return list_channel_members(db, channel_id)