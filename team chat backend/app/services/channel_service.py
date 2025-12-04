from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.channel import Channel
from app.models.channel_member import ChannelMember
from app.models.user import User
from app.schemas.channel import ChannelCreate

def create_channel(db: Session, owner: User, payload: ChannelCreate) -> Channel:
    existing = db.query(Channel).filter(Channel.name == payload.name).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Channel name already exists",
        )

    channel = Channel(name=payload.name, description=payload.description)
    db.add(channel)
    db.commit()
    db.refresh(channel)
    member = ChannelMember(user_id=owner.id, channel_id=channel.id)
    db.add(member)
    db.commit()

    return channel

def join_channel(db: Session, user: User, channel_id: int):
    channel = db.query(Channel).get(channel_id)
    if not channel:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Channel not found"
        )

    existing = (
        db.query(ChannelMember)
        .filter(
            ChannelMember.user_id == user.id, ChannelMember.channel_id == channel_id
        )
        .first()
    )
    if existing:
        return channel  

    member = ChannelMember(user_id=user.id, channel_id=channel_id)
    db.add(member)
    db.commit()
    return channel

def leave_channel(db: Session, user: User, channel_id: int):
    member = (
        db.query(ChannelMember)
        .filter(
            ChannelMember.user_id == user.id, ChannelMember.channel_id == channel_id
        )
        .first()
    )
    if not member:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You are not a member of this channel",
        )

    db.delete(member)
    db.commit()

def list_channels(db: Session):
    return db.query(Channel).all()

def list_user_channels(db: Session, user: User):
    return (
        db.query(Channel)
        .join(ChannelMember, Channel.id == ChannelMember.channel_id)
        .filter(ChannelMember.user_id == user.id)
        .all()
    )

def list_channel_members(db: Session, channel_id: int):
    channel = db.query(Channel).get(channel_id)
    if not channel:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Channel not found"
        )

    members = (
        db.query(User)
        .join(ChannelMember, User.id == ChannelMember.user_id)
        .filter(ChannelMember.channel_id == channel_id)
        .all()
    )
    return members