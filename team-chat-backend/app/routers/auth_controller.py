from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.db_session import get_db
from app.schemas.auth_schema import (
    SignupIn, 
    LoginIn, 
    TokenResponse,
    ForgotPasswordIn, 
    ForgotPasswordVerify, 
    MessageOut, 
    NewPasswordIn, 
    ResetPasswordIn
    )
from app.schemas.user import UserBase
from app.services.auth_service import signup_user, login_user, forgot_pass, forgot_pass_verify, new_pass, reset_pass
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

@router.post("/forgot-password")
def forgot_password(payload: ForgotPasswordIn, db: Session = Depends(get_db)):
    return forgot_pass(db=db, payload=payload)

@router.post("/verify-otp")
def forgot_password_verify(payload: ForgotPasswordVerify, db: Session = Depends(get_db)):
    return forgot_pass_verify(db=db, payload=payload)

@router.post("/new-password")
def new_password(
    payload: NewPasswordIn,
    db: Session = Depends(get_db),
):
    return new_pass(db=db, payload=payload)

@router.post("/reset-password", response_model=MessageOut)
def reset_password(
    payload: ResetPasswordIn,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user),
):
    return reset_pass(db=db, current_user=current_user, payload=payload)
