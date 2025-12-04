from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.db_session import get_db
from app.schemas.auth_schema import SignupIn, LoginIn, TokenResponse, RefreshTokenIn
from app.schemas.user import UserBase
from app.services.auth_service import signup_user, login_user
from app.utils.jwt import decode_refresh_token, create_access_token, create_refresh_token
from app.utils.deps import get_current_user
from app.models.user import User
router = APIRouter()

@router.post("/signup", response_model=TokenResponse)
def signup(payload: SignupIn, db: Session = Depends(get_db)):
    user, access_token, refresh_token = signup_user(db, payload)
    return TokenResponse(access_token=access_token, refresh_token=refresh_token)

@router.post("/login", response_model=TokenResponse)
def login(payload: LoginIn, db: Session = Depends(get_db)):
    user, access_token, refresh_token = login_user(db, payload)
    return TokenResponse(access_token=access_token, refresh_token=refresh_token)

@router.get("/me", response_model=UserBase)
def get_me(current_user=Depends(get_current_user)):
    return current_user
