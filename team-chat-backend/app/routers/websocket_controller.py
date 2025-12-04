from typing import Dict, List, Set
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends, Query
from sqlalchemy.orm import Session
from app.db.db_session import get_db
from app.models.user import User
from app.utils.jwt import decode_access_token

router = APIRouter()

channel_connections: Dict[int, List[WebSocket]] = {}
channel_online_users: Dict[int, Set[int]] = {}

async def connect_client(channel_id: int, websocket: WebSocket):
    await websocket.accept()
    channel_connections.setdefault(channel_id, []).append(websocket)

def disconnect_client(channel_id: int, websocket: WebSocket):
    conns = channel_connections.get(channel_id, [])
    if websocket in conns:
        conns.remove(websocket)

async def broadcast_message(channel_id: int, message: dict):
    for ws in channel_connections.get(channel_id, []):
        await ws.send_json(message)

@router.websocket("/ws/channels/{channel_id}")
async def websocket_endpoint(
    websocket: WebSocket,
    channel_id: int,
    token: str = Query(...),
    db: Session = Depends(get_db),
):
    payload = decode_access_token(token)
    user_id = int(payload.get("sub"))

    user = db.query(User).get(user_id)
    if not user:
        await websocket.close()
        return

    await connect_client(channel_id, websocket)
    channel_online_users.setdefault(channel_id, set()).add(user_id)
    await broadcast_message(
        channel_id,
        {
            "type": "presence",
            "online_user_ids": list(channel_online_users.get(channel_id, set())),
        },
    )

    try:
        while True:
            data = await websocket.receive_text()
            await broadcast_message(
                channel_id,
                {
                    "type": "message",
                    "user_id": user_id,
                    "user_name": user.name,
                    "text": data,
                },
            )
    except WebSocketDisconnect:
        disconnect_client(channel_id, websocket)
        online_set = channel_online_users.get(channel_id, set())
        online_set.discard(user_id)
        await broadcast_message(
            channel_id,
            {
                "type": "presence",
                "online_user_ids": list(online_set),
            },
        )
