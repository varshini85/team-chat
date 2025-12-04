from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from app.db.db_session import get_db
from app.schemas.message import MessageBase, MessageCreate, MessageUpdate
from app.utils.deps import get_current_user
from app.services.message_service import send_message, get_messages, delete_message, update_message

router = APIRouter()

@router.post("/{channel_id}", response_model=MessageBase)
def send_msg(
    channel_id: int,
    payload: MessageCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    try:
        msg = send_message(db, current_user, channel_id, payload.text)
        return msg
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Channel not found"
        )
    except PermissionError:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not a member of this channel",
        )

@router.get("/{channel_id}", response_model=List[MessageBase])
def list_msg(
    channel_id: int,
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    messages = get_messages(db, channel_id, limit=limit, offset=offset)
    return messages

@router.patch("/{message_id}", response_model=MessageBase)
def update_msg(
    message_id: int,
    payload: MessageUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    updated = update_message(
        db=db,
        message_id=message_id,
        current_user=current_user,
        new_text=payload.text,
    )
    return updated

@router.delete("/{message_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_msg(
    message_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    delete_message(
        db=db,
        message_id=message_id,
        current_user=current_user,
    )
    return
