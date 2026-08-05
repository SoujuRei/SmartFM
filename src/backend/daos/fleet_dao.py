import logging
from typing import List

from core.database import DatabaseConnection
from core.exceptions import DatabaseConnectionError, NotFoundError
from models.fleet import Vehicle

logger = logging.getLogger(__name__)


class VehicleDAO:
    """
    Owns the `vehicles` table exclusively. Availability queries AND
    availability updates for vehicles belong here -- ShipmentDAO must not
    touch this table (see shipment_dao.py docstring).
    """

    def __init__(self):
        self.db = DatabaseConnection().get_instance()

    def get_available_vehicles(self, required_capacity: float) -> List[Vehicle]:
        try:
            response = (
                self.db.table("vehicles")
                .select("*")
                .eq("is_available", True)
                .gte("capacity_weight", required_capacity)
                .execute()
            )
        except Exception as exc:
            logger.exception("Failed to query available vehicles")
            raise DatabaseConnectionError(f"Vehicle lookup failed: {exc}") from exc

        return [Vehicle(**row) for row in response.data]

    def get_by_id(self, vehicle_id: str) -> Vehicle:
        try:
            res = (
                self.db.table("vehicles").select("*").eq("vehicle_id", vehicle_id).execute()
            )
        except Exception as exc:
            logger.exception("Failed to fetch vehicle_id=%s", vehicle_id)
            raise DatabaseConnectionError(f"Vehicle lookup failed: {exc}") from exc

        if not res.data:
            raise NotFoundError(f"Vehicle {vehicle_id} not found")

        return Vehicle(**res.data[0])

    def set_availability(self, vehicle_id: str, is_available: bool) -> Vehicle:
        try:
            res = (
                self.db.table("vehicles")
                .update({"is_available": is_available})
                .eq("vehicle_id", vehicle_id)
                .execute()
            )
        except Exception as exc:
            logger.exception(
                "Failed to update availability for vehicle_id=%s", vehicle_id
            )
            raise DatabaseConnectionError(
                f"Vehicle availability update failed: {exc}"
            ) from exc

        if not res.data:
            raise NotFoundError(f"Vehicle {vehicle_id} not found")

        return Vehicle(**res.data[0])