import logging
from typing import List

from core.database import DatabaseConnection
from core.exceptions import (
    DatabaseConnectionError,
    NotFoundError,
)

from models.user import Driver

logger = logging.getLogger(__name__)


class DriverDAO:

    def __init__(self):
        self.db = DatabaseConnection().get_instance()


    def get_available_drivers(self) -> List[Driver]:
        """
        Returns drivers whose availability flag is true.
        """

        try:
            response = (
                self.db
                .table("drivers")
                .select(
                    """
                    user_id,
                    license_number,
                    is_available,
                    users(
                        id,
                        name,
                        email,
                        password,
                        role
                    )
                    """
                )
                .eq("is_available", True)
                .execute()
            )

        except Exception as exc:
            logger.exception(
                "Failed fetching available drivers"
            )
            raise DatabaseConnectionError(
                f"Driver lookup failed: {exc}"
            ) from exc


        drivers = []

        for row in response.data:

            user = row.pop("users")

            data = {
                **user,
                **row,
            }

            drivers.append(
                Driver(**data)
            )

        return drivers



    def get_driver_by_id(
        self,
        driver_id: str
    ) -> Driver:

        try:
            response = (
                self.db
                .table("drivers")
                .select(
                    """
                    user_id,
                    license_number,
                    is_available,
                    users(
                        id,
                        name,
                        email,
                        password,
                        role
                    )
                    """
                )
                .eq("user_id", driver_id)
                .execute()
            )

        except Exception as exc:
            logger.exception(
                "Failed fetching driver=%s",
                driver_id
            )
            raise DatabaseConnectionError(
                f"Driver lookup failed: {exc}"
            ) from exc


        if not response.data:
            raise NotFoundError(
                f"Driver {driver_id} not found"
            )


        row = response.data[0]

        user = row.pop("users")

        return Driver(
            **{
                **user,
                **row
            }
        )



    def set_availability(
        self,
        driver_id: str,
        available: bool
    ) -> Driver:

        try:
            response = (
                self.db
                .table("drivers")
                .update(
                    {
                        "is_available": available
                    }
                )
                .eq("user_id", driver_id)
                .execute()
            )

        except Exception as exc:
            logger.exception(
                "Failed updating driver availability"
            )
            raise DatabaseConnectionError(
                f"Driver update failed: {exc}"
            ) from exc


        if not response.data:
            raise NotFoundError(
                f"Driver {driver_id} not found"
            )


        return self.get_driver_by_id(driver_id)