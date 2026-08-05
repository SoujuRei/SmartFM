import logging
import secrets

from fastapi import APIRouter, Depends, HTTPException, status
from schemas.auth_schema import LoginRequest, LoginResponse, LoginUser


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
# Debug user credential for verification 
#         print(user)
#         print(req.password)
#         if user is not None:
#             print(user.password_hash.get_secret_value())
#         print("Input:", req.password)
#         print("Stored:", user.password_hash.get_secret_value())

#         print(
#     "Verify:",
#     verify_password(
#         req.password,
#         user.password_hash.get_secret_value(),
#     ),
# )   
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

    user_id = user.user_id or ""
    access_token = secrets.token_urlsafe(32)

    return LoginResponse(
        message="Login successful",
        accessToken=access_token,
        user=LoginUser(
            id=user_id,
            name=user.name,
            email=user.email,
            role=user.role.value,
        ),
        userId=user_id,
        role=user.role.value,
        name=user.name,
    )