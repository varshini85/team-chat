from datetime import datetime, timedelta, timezone
from typing import Dict, Any
from fastapi import HTTPException, status
from jose import jwt, JWTError
from passlib.context import CryptContext
from app.core.config import (
    JWT_SECRET_KEY,
    JWT_REFRESH_SECRET_KEY,
    JWT_ALGORITHM,
    ACCESS_TOKEN_EXPIRE_MINUTES,
    REFRESH_TOKEN_EXPIRE_DAYS,
)

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def _create_token(data: Dict[str, Any], expires_delta: timedelta, secret: str) -> str:
    to_encode = data.copy()
    now = datetime.now(timezone.utc)
    to_encode.update({"iat": now, "exp": now + expires_delta})
    encoded_jwt = jwt.encode(to_encode, secret, algorithm=JWT_ALGORITHM)
    return encoded_jwt

def create_access_token(data: Dict[str, Any]) -> str:
    payload = data.copy()
    payload["type"] = "access"
    return _create_token(
        payload,
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES),
        secret=JWT_SECRET_KEY,
    )

def create_refresh_token(data: Dict[str, Any]) -> str:
    payload = data.copy()
    payload["type"] = "refresh"
    return _create_token(
        payload,
        expires_delta=timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS),
        secret=JWT_REFRESH_SECRET_KEY,
    )

def decode_access_token(token: str) -> Dict[str, Any]:
    try:
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "access":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token type"
            )
        return payload
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token"
        )

def decode_refresh_token(token: str) -> Dict[str, Any]:
    try:
        payload = jwt.decode(token, JWT_REFRESH_SECRET_KEY, algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "refresh":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token type"
            )
        return payload
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token"
        )
