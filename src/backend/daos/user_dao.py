import logging
from typing import Optional

from core.database import DatabaseConnection
from core.exceptions import DatabaseConnectionError
from models.user import User, Customer, Staff, Driver

logger = logging.getLogger(__name__)

_ROLE_MODEL_MAP = {
    "CUSTOMER": Customer,
    "STAFF": Staff,
    "DRIVER": Driver,
}


class UserDAO:
    def __init__(self):
        self.db = DatabaseConnection().get_instance()

    def get_user_by_email(self, email: str) -> Optional[User]:
        """
        Look up a user by email and return the correctly-typed domain model
        (Customer / Staff / Driver) based on the row's `role` column.

        Returns None if no matching row exists -- that is an expected,
        valid outcome of a lookup, not an error.

        Raises DatabaseConnectionError if the query itself fails
        (network issue, Supabase outage, bad table/column name) -- that IS
        an error, and callers should be able to tell the two apart.
        """
        
        try:
            response = (
                self.db.table("users")
                .select("*")
                .eq("email", email)
                .execute()
            )
        except Exception as exc:
            logger.exception("User lookup query failed for email=%s", email)
            raise DatabaseConnectionError(f"User lookup failed: {exc}") from exc

        if not response.data:
            return None

        row = response.data[0]

        # Normalize enum-like fields from external sources
        if isinstance(row.get("role"), str):
            row["role"] = row["role"].upper()
            role = row["role"] 

        model_cls = _ROLE_MODEL_MAP.get(row.get("role"), User)

        if model_cls is None:
            logger.warning(
            "Unknown user role '%s', using base User model",
            role
        )
        model_cls = User
        

        # Check fetch
        # print("ALL USERS FROM SUPABASE:")
        # print(response.data)
        
        try:
            return model_cls(**row)
        except Exception as exc:
            logger.error(
                "User row for email=%s did not match %s schema: %s",
                email, model_cls.__name__, exc,
            )
            raise

