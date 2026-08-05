import logging
from typing import Optional

from core.database import DatabaseConnection
from core.exceptions import DatabaseConnectionError, NotFoundError
from models.user import User, Customer, Staff, Driver

logger = logging.getLogger(__name__)


class UserDAO:

    def __init__(self):
        self.db = DatabaseConnection().get_instance()


    def get_user_by_email(self, email: str) -> Optional[User]:

        try:
            response = (
                self.db.table("users")
                .select("*")
                .eq("email", email)
                .execute()
            )

        except Exception as exc:
            logger.exception(
                "User lookup failed for email=%s",
                email
            )
            raise DatabaseConnectionError(
                f"User lookup failed: {exc}"
            ) from exc


        if not response.data:
            return None


        user_row = response.data[0]

        role = user_row["role"]


        try:
            if role == "CUSTOMER":

                extra = (
                    self.db.table("customers")
                    .select("*")
                    .eq("user_id", user_row["id"])
                    .execute()
                )

                if not extra.data:
                    raise NotFoundError(
                        "Customer profile missing"
                    )

                data = {
                        **user_row,
                        **extra.data[0]
                    }

                return Customer(**data)


            elif role == "STAFF":

                extra = (
                    self.db.table("staff")
                    .select("*")
                    .eq("user_id", user_row["id"])
                    .execute()
                )

                if not extra.data:
                    raise NotFoundError(
                        "Staff profile missing"
                    )

                data = {
                        **user_row,
                        **extra.data[0]
                                    }
                
                return Staff(**data)


            elif role == "DRIVER":

                extra = (
                    self.db.table("drivers")
                    .select("*")
                    .eq("user_id", user_row["id"])
                    .execute()
                )

                if not extra.data:
                    raise NotFoundError(
                        "Driver profile missing"
                    )

                data = {
                        **user_row,
                        **extra.data[0]
                                        }
                                
                return Driver(**data)


            else:
                raise ValueError(
                    f"Unknown user role {role}"
                )


        except Exception as exc:
            logger.exception(
                "Failed building user model"
            )
            raise