from pydantic import BaseModel, EmailStr

class SignupIn(BaseModel):
    name: str
    email: EmailStr
    password: str

class LoginIn(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"

class RefreshTokenIn(BaseModel):
    refresh_token: str

class ForgotPasswordIn(BaseModel):
    email: EmailStr

class ForgotPasswordVerify(BaseModel):
    email: EmailStr
    otp: str
    
class NewPasswordIn(BaseModel):
    email: EmailStr
    new_password: str


class ResetPasswordIn(BaseModel):
    old_password: str
    new_password: str

class MessageOut(BaseModel):
    message: str