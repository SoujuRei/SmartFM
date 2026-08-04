import logging

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr
from schemas.auth_schema import LoginRequest, LoginResponse


from core.exceptions import DatabaseConnectionError
from core.security import verify_password
from daos.user_dao import UserDAO

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/auth", tags=["auth"])


def get_user_dao() -> UserDAO:
    """FastAPI dependency — swap for a mock in tests via dependency_overrides."""
    return UserDAO()



@router.post("/login", response_model=LoginResponse)
def login(req: LoginRequest, user_dao: UserDAO = Depends(get_user_dao)):
    try:
        user = user_dao.get_user_by_email(req.email)
    except DatabaseConnectionError as exc:
        logger.error("Login lookup failed: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Authentication service temporarily unavailable",
        )

    if user is None or not verify_password(
        req.password, user.password_hash.get_secret_value()
        ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    return LoginResponse(
        message="Login successful",
        user_id=user.user_id,
        role=user.role.value,
        name=user.name,
    )