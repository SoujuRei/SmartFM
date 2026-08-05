import logging

from core.database import DatabaseConnection
from core.exceptions import DatabaseConnectionError, NotFoundError
from models.fleet import Shipment, TrackingRecord
from models.enums import ShipmentStatus
from typing import List

logger = logging.getLogger(__name__)


class ShipmentDAO:
    """
    Owns the `shipments` and `tracking_records` tables only. Marking a
    vehicle unavailable when a shipment is dispatched touches a DIFFERENT
    aggregate (Vehicle) -- that coordination belongs in the controller
    (FleetManager), which calls this DAO and VehicleDAO separately. See
    daos/vehicle_dao.py.
    """

    def __init__(self):
        self.db = DatabaseConnection().get_instance()

    def _normalize_shipment_row(self, row: dict) -> Shipment:
        payload = dict(row)
        status = payload.get("status")

        if isinstance(status, str):
            normalized = status.strip().upper()
            if normalized == "DISPATCHED":
                payload["status"] = ShipmentStatus.ASSIGNED
            else:
                try:
                    payload["status"] = ShipmentStatus(normalized)
                except ValueError:
                    payload["status"] = ShipmentStatus.ASSIGNED
        elif status is None:
            payload["status"] = ShipmentStatus.ASSIGNED

        return Shipment(**payload)

    def save_shipment(self, shipment: Shipment) -> Shipment:
        data = shipment.model_dump(exclude={"shipment_id", "dispatch_date"})
        data["status"] = data["status"].value
        # include estimated_delivery when present
        if data.get("estimated_delivery"):
            try:
                data["estimated_delivery"] = data["estimated_delivery"].isoformat()
            except Exception:
                # leave as-is; DB may accept string or null
                pass

        try:
            response = self.db.table("shipments").insert(data).execute()
        except Exception as exc:
            logger.exception(
                "Failed to insert shipment for order_id=%s", shipment.order_id
            )
            raise DatabaseConnectionError(f"Shipment insert failed: {exc}") from exc

        if not response.data:
            raise DatabaseConnectionError("Shipment insert returned no data")

        return self._normalize_shipment_row(response.data[0])

    def get_by_order_id(self, order_id: str) -> Shipment | None:
        try:
            res = (
                self.db.table("shipments")
                .select("*")
                .eq("order_id", order_id)
                .execute()
            )
        except Exception as exc:
            logger.exception(
                "Failed fetching shipment for order_id=%s",
                order_id
            )
            raise DatabaseConnectionError(
                f"Shipment lookup failed: {exc}"
            ) from exc

        if not res.data:
            return None

        return self._normalize_shipment_row(res.data[0])
    
    def get_shipment_by_id(self, shipment_id: str) -> Shipment:
        try:
            res = (
                self.db.table("shipments")
                .select("*")
                .eq("shipment_id", shipment_id)
                .execute()
            )
        except Exception as exc:
            logger.exception(
                "Failed to fetch shipment_id=%s",
                shipment_id
            )
            raise DatabaseConnectionError(
                f"Shipment lookup failed: {exc}"
            ) from exc

        if not res.data:
            raise NotFoundError(
                f"Shipment {shipment_id} not found"
            )

        return self._normalize_shipment_row(res.data[0])


    def list_shipments(self) -> List[Shipment]:
        try:
            res = (
                self.db.table("shipments")
                .select("*")
                .execute()
            )
        except Exception as exc:
            logger.exception(
                "Failed to fetch shipments"
            )
            raise DatabaseConnectionError(
                f"Shipment lookup failed: {exc}"
            ) from exc

        return [
            self._normalize_shipment_row(row)
            for row in res.data
        ]


    def get_shipments_by_driver(self, driver_id: str) -> List[Shipment]:
        try:
            res = (
                self.db.table("shipments")
                .select("*")
                .eq("driver_id", driver_id)
                .execute()
            )
        except Exception as exc:
            logger.exception("Failed to fetch shipments for driver=%s", driver_id)
            raise DatabaseConnectionError(
                f"Shipment lookup failed: {exc}"
            ) from exc

        return [self._normalize_shipment_row(row) for row in res.data]


    def get_tracking_history(
        self,
        shipment_id: str
    ) -> List[TrackingRecord]:

        try:
            res = (
                self.db.table("tracking_records")
                .select("*")
                .eq("shipment_id", shipment_id)
                .order("timestamp")
                .execute()
            )
        except Exception as exc:
            logger.exception(
                "Failed to fetch tracking history for shipment=%s",
                shipment_id
            )
            raise DatabaseConnectionError(
                f"Tracking lookup failed: {exc}"
            ) from exc

        return [
            TrackingRecord(**row)
            for row in res.data
        ]

    def get_active_shipments_by_vehicle(self, vehicle_id: str) -> List[Shipment]:
        try:
            res = (
                self.db.table("shipments")
                .select("*")
                .eq("vehicle_id", vehicle_id)
                .not_("status", "DELIVERED")
                .execute()
            )
        except Exception as exc:
            logger.exception("Failed fetching active shipments for vehicle=%s", vehicle_id)
            raise DatabaseConnectionError(f"Shipment lookup failed: {exc}") from exc

        return [self._normalize_shipment_row(row) for row in res.data]

    def get_active_shipments_by_driver(self, driver_id: str) -> List[Shipment]:
        try:
            res = (
                self.db.table("shipments")
                .select("*")
                .eq("driver_id", driver_id)
                .not_("status", "DELIVERED")
                .execute()
            )
        except Exception as exc:
            logger.exception("Failed fetching active shipments for driver=%s", driver_id)
            raise DatabaseConnectionError(f"Shipment lookup failed: {exc}") from exc

        return [self._normalize_shipment_row(row) for row in res.data]

    def delete_tracking_by_shipment_id(self, shipment_id: str) -> int:
        try:
            res = (
                self.db.table("tracking_records")
                .delete()
                .eq("shipment_id", shipment_id)
                .execute()
            )
        except Exception as exc:
            logger.exception("Failed deleting tracking records for shipment=%s", shipment_id)
            raise DatabaseConnectionError(f"Tracking delete failed: {exc}") from exc

        return len(res.data)

    def delete_shipment_by_order_id(self, order_id: str) -> int:
        try:
            res = (
                self.db.table("shipments")
                .delete()
                .eq("order_id", order_id)
                .execute()
            )
        except Exception as exc:
            logger.exception("Failed deleting shipment for order=%s", order_id)
            raise DatabaseConnectionError(f"Shipment delete failed: {exc}") from exc

        return len(res.data)

    def update_shipment_status(self, shipment_id: str, status: ShipmentStatus) -> Shipment:
        try:
            res = (
                self.db.table("shipments")
                .update({"status": status.value})
                .eq("shipment_id", shipment_id)
                .execute()
            )
        except Exception as exc:
            logger.exception("Failed to update status for shipment_id=%s", shipment_id)
            raise DatabaseConnectionError(f"Shipment status update failed: {exc}") from exc

        if not res.data:
            raise NotFoundError(f"Shipment {shipment_id} not found")

        return self._normalize_shipment_row(res.data[0])

    def add_tracking_record(self, record: TrackingRecord) -> TrackingRecord:
        data = record.model_dump(exclude={"record_id"})
        data["timestamp"] = data["timestamp"].isoformat()

        try:
            res = self.db.table("tracking_records").insert(data).execute()
        except Exception as exc:
            logger.exception(
                "Failed to insert tracking record for shipment_id=%s",
                record.shipment_id,
            )
            raise DatabaseConnectionError(
                f"Tracking record insert failed: {exc}"
            ) from exc

        if not res.data:
            raise DatabaseConnectionError("Tracking record insert returned no data")

        return TrackingRecord(**res.data[0])