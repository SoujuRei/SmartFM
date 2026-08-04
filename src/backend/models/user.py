from enum import Enum
from typing import Optional
from pydantic import BaseModel, EmailStr, Field, SecretStr, field_validator


class UserRole(str, Enum):
    CUSTOMER = "CUSTOMER"
    STAFF = "STAFF"
    DRIVER = "DRIVER"


class User(BaseModel):
    """
    Base domain model, maps to the `users` table.

    `password` is SecretStr and excluded from serialization (`exclude=True`)
    so it can never leak into an API response, log line, or `repr()` even
    if a router accidentally returns the whole model instead of a
    dedicated response schema.
    """

    model_config = {"populate_by_name": True}

    user_id: Optional[str] = Field(default=None, alias="id")
    name: str = Field(min_length=1, max_length=100)
    email: EmailStr
    password_hash: SecretStr = Field(
        alias="password",
        repr=False,
        exclude=True
    )
    role: UserRole

    @field_validator("name")
    @classmethod
    def name_not_blank(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("name cannot be blank")
        return v.strip()


class Customer(User):
    phone: str = Field(min_length=6, max_length=20)
    address: str = Field(min_length=1, max_length=255)


class Staff(User):
    staff_id: str = Field(min_length=1)


class Driver(User):
    license_number: str = Field(min_length=1)
    is_available: bool = True