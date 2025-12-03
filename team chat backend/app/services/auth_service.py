from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.user import User
from app.schemas.auth_schema import SignupIn, LoginIn
from app.utils.jwt import (
    get_password_hash,
    verify_password,
    create_access_token,
    create_refresh_token,
)

def signup_user(db: Session, payload: SignupIn):
    existing = db.query(User).filter(User.email == payload.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )

    hashed = get_password_hash(payload.password)
    user = User(
        name=payload.name,
        email=payload.email,
        hashed_password=hashed,
        is_active=True,
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    token_data = {"sub": str(user.id), "email": user.email}
    access_token = create_access_token(token_data)
    refresh_token = create_refresh_token(token_data)

    return user, access_token, refresh_token

def login_user(db: Session, payload: LoginIn):
    user = db.query(User).filter(User.email == payload.email).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials"
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Account not active"
        )

    if not verify_password(payload.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid credentials"
        )

    token_data = {"sub": str(user.id), "email": user.email}
    access_token = create_access_token(token_data)
    refresh_token = create_refresh_token(token_data)

    return user, access_token, refresh_token
