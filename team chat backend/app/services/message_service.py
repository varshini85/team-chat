from sqlalchemy.orm import Session
from app.models.message import Message
from app.models.channel import Channel
from app.models.channel_member import ChannelMember
from app.models.user import User

def send_message(db: Session, user: User, channel_id: int, text: str) -> Message:
    channel = db.query(Channel).get(channel_id)
    if not channel:
        raise ValueError("Channel not found")

    membership = (
        db.query(ChannelMember)
        .filter(
            ChannelMember.user_id == user.id, ChannelMember.channel_id == channel_id
        )
        .first()
    )
    if not membership:
        raise PermissionError("User not member of channel")

    msg = Message(text=text, sender_id=user.id, channel_id=channel_id)
    db.add(msg)
    db.commit()
    db.refresh(msg)
    return msg

def get_messages(db: Session, channel_id: int, limit: int = 20, offset: int = 0):
    q = (
        db.query(Message)
        .filter(Message.channel_id == channel_id)
        .order_by(Message.created_at.desc())
        .offset(offset)
        .limit(limit)
    )
    messages = q.all()
    return messages
