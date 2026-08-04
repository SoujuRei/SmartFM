from pydantic import BaseModel, EmailStr
from typing import Optional

class User(BaseModel):
    user_id: Optional[str] = None
    name: str
    email: EmailStr
    password: str
    role: str  # 'CUSTOMER', 'STAFF', 'DRIVER'

class Customer(User):
    phone: str
    address: str

class Staff(User):
    staff_id: str
    
class Driver(User):
    license_number: str
    is_available: bool = True