from sqlalchemy import Column, Integer, ForeignKey, DateTime, func, UniqueConstraint
from sqlalchemy.orm import relationship
from app.db.db_session import Base

class ChannelMember(Base):
    __tablename__ = "channel_members"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    channel_id = Column(Integer, ForeignKey("channels.id"), nullable=False)
    joined_at = Column(DateTime(timezone=True), server_default=func.now())
    user = relationship("User", back_populates="memberships")
    channel = relationship("Channel", back_populates="members")

    __table_args__ = (
        UniqueConstraint("user_id", "channel_id", name="uq_user_channel"),
    )
