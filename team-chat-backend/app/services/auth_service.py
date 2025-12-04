from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from sqlalchemy import func, text
from app.models.user import User
from app.schemas.auth_schema import SignupIn, LoginIn, NewPasswordIn, ResetPasswordIn, MessageOut
from app.utils.jwt import (
    get_password_hash,
    verify_password,
    create_access_token,
    create_refresh_token,
)
from app.utils.send_mail import send_email
from app.utils.generate_otp import generate_otp
from app.services.otp_temp import team_chat_otp_email_template

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

def forgot_pass_verify(*, db: Session, payload):
    email = payload.email.lower().strip()
    user = (db.query(User).filter(func.lower(User.email) == email,User.otp == payload.otp).first())
    if not user:
        raise HTTPException(status_code=400, detail="Invalid email or OTP")
    
    return {"message": " OTP verified successfully"}

def forgot_pass(*, db: Session, payload):
    email_norm = payload.email.strip().lower()
    user = db.query(User).filter(func.lower(User.email) == email_norm).first()
    if not user:
        return {"message": "If the email exists, a reset OTP has been sent"}

    otp = generate_otp()
    user.otp = otp
    user.otp_time = None  
    db.commit()

    subject = "Your Password Reset Code"
    html_content = team_chat_otp_email_template(otp=otp,  
    expires_minutes=10)
    send_email(to_email_id=user.email, subject=subject, content_to_be_sent=html_content)

    return {"message": "OTP sent to email"}

def new_pass(*, db: Session, payload: NewPasswordIn):
   
    email_norm = payload.email.strip().lower()
    user: User | None = db.query(User).filter(func.lower(User.email) == email_norm).first()

    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    user.hashed_password = get_password_hash(payload.new_password)
    user.otp = None
    user.otp_time = None
    db.commit()

    return {"message": "Password changed successfully"}


def reset_pass(*, db: Session, current_user, payload: ResetPasswordIn) -> MessageOut:
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
        )

    if not verify_password(payload.old_password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Old password is incorrect",
        )

    current_user.hashed_password = get_password_hash(payload.new_password)
    current_user.otp = None
    current_user.otp_time = None

    db.add(current_user)
    db.commit()
    db.refresh(current_user)

    return {"message": "Password changed successfully"}
