import logging

from core.database import DatabaseConnection
from core.exceptions import DatabaseConnectionError, NotFoundError
from models.fleet import Shipment, TrackingRecord
from models.enums import ShipmentStatus

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

    def save_shipment(self, shipment: Shipment) -> Shipment:
        data = shipment.model_dump(exclude={"shipment_id"})
        data["status"] = data["status"].value
        data["dispatch_date"] = data["dispatch_date"].isoformat()

        try:
            response = self.db.table("shipments").insert(data).execute()
        except Exception as exc:
            logger.exception(
                "Failed to insert shipment for order_id=%s", shipment.order_id
            )
            raise DatabaseConnectionError(f"Shipment insert failed: {exc}") from exc

        if not response.data:
            raise DatabaseConnectionError("Shipment insert returned no data")

        return Shipment(**response.data[0])

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

        return Shipment(**res.data[0])

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