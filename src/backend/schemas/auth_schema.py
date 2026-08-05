from pydantic import BaseModel, EmailStr


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class LoginUser(BaseModel):
    id: str
    name: str
    email: EmailStr
    role: str


class LoginResponse(BaseModel):
    message: str
    accessToken: str
    user: LoginUser
    userId: str
    role: str
    name: str

    model_config = {"populate_by_name": True}