from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from daos.user_dao import UserDAO

router = APIRouter()
user_dao = UserDAO()

class LoginRequest(BaseModel):
    email: str
    password: str

@router.post("/login")
def login(req: LoginRequest):
    user = user_dao.get_user_by_email(req.email)
    
    # In a real app, use hashed passwords (bcrypt). 
    # For this assignment, direct comparison is usually acceptable if documented.
    if user and user['password'] == req.password:
        return {
            "message": "Login successful",
            "user_id": user['id'],
            "role": user['role'],
            "name": user['name']
        }
        
    raise HTTPException(status_code=401, detail="Invalid email or password")