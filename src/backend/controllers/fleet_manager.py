from daos.shipment_dao import ShipmentDAO
from daos.fleet_dao import VehicleDAO
from daos.driver_dao import DriverDAO
from daos.order_dao import OrderDAO
from models.fleet import Shipment, TrackingRecord
from models.enums import OrderStatus, ShipmentStatus
from core.exceptions import NotFoundError, ValidationError
from typing import List


class FleetManager:
    def __init__(self):
        self.shipment_dao = ShipmentDAO()
        self.vehicle_dao = VehicleDAO()
        self.driver_dao = DriverDAO()
        self.order_dao = OrderDAO()

    def get_available_vehicles(self, required_capacity: float) -> list:
        return self.vehicle_dao.get_available_vehicles(required_capacity)

    def get_shipment(self, shipment_id: str) -> Shipment:
        return self.shipment_dao.get_shipment_by_id(shipment_id)

    def list_shipments(self) -> list[Shipment]:
        return self.shipment_dao.list_shipments()

    def get_enriched_shipment(self, shipment_id: str) -> dict:
        shipment = self.shipment_dao.get_shipment_by_id(shipment_id)
        order = self.order_dao.get_order_by_id(shipment.order_id)
        vehicle = self.vehicle_dao.get_by_id(shipment.vehicle_id)
        driver = self.driver_dao.get_driver_by_id(shipment.driver_id)

        return {
            "shipment": shipment,
            "order": order,
            "vehicle": vehicle,
            "driver": driver,
        }

    def list_enriched_shipments(self) -> list[dict]:
        shipments = self.shipment_dao.list_shipments()
        result = []

        for shipment in shipments:
            order = self.order_dao.get_order_by_id(shipment.order_id)
            vehicle = self.vehicle_dao.get_by_id(shipment.vehicle_id)
            driver = self.driver_dao.get_driver_by_id(shipment.driver_id)

            result.append(
                {
                    "shipment": shipment,
                    "order": order,
                    "vehicle": vehicle,
                    "driver": driver,
                }
            )

        return result

    def list_enriched_shipments_by_driver(self, driver_id: str) -> list[dict]:
        shipments = self.shipment_dao.get_shipments_by_driver(driver_id)
        result = []

        for shipment in shipments:
            order = self.order_dao.get_order_by_id(shipment.order_id)
            vehicle = self.vehicle_dao.get_by_id(shipment.vehicle_id)
            driver = self.driver_dao.get_driver_by_id(shipment.driver_id)

            result.append(
                {
                    "shipment": shipment,
                    "order": order,
                    "vehicle": vehicle,
                    "driver": driver,
                }
            )

        return result

    def get_tracking_history(self, shipment_id: str) -> list[TrackingRecord]:
        return self.shipment_dao.get_tracking_history(shipment_id)

    def add_tracking_record(self, shipment_id: str, location: str, description: str,) -> TrackingRecord:
        record = TrackingRecord(
            shipment_id=shipment_id,
            current_location=location,
            description=description,
        )
        return self.shipment_dao.add_tracking_record(record)

    def dispatch_shipment(self, order_id: str, vehicle_id: str, driver_id: str) -> Shipment:
        order = self.order_dao.get_order_by_id(order_id)
        if order is None:
            raise NotFoundError("Order not found")
        if order.status != OrderStatus.PROCESSING:
            raise ValidationError("Only processing orders can be dispatched")

        vehicle = self.vehicle_dao.get_by_id(vehicle_id)
        if not vehicle.is_available:
            raise ValidationError("Vehicle is unavailable")

        driver = self.driver_dao.get_driver_by_id(driver_id)
        if not driver.is_available:
            raise ValidationError("Driver is unavailable")

        self.vehicle_dao.set_availability(vehicle_id, False)
        self.driver_dao.set_availability(driver_id, False)

        shipment = Shipment(
            order_id=order_id,
            vehicle_id=vehicle_id,
            driver_id=driver_id,
            status=ShipmentStatus.ASSIGNED,
        )
        saved_shipment = self.shipment_dao.save_shipment(shipment)

        self.order_dao.update_status(order_id, OrderStatus.SHIPPED)
        return saved_shipment

    def add_tracking(self, shipment_id: str, location: str, description: str,) -> TrackingRecord:
        self.shipment_dao.get_shipment_by_id(shipment_id)
        record = TrackingRecord(
            shipment_id=shipment_id,
            current_location=location,
            description=description,
        )
        return self.shipment_dao.add_tracking_record(record)

    def _validate_shipment_transition(self, current: ShipmentStatus, target: ShipmentStatus) -> None:
        if current == target:
            return

        allowed = {
            ShipmentStatus.ASSIGNED: [ShipmentStatus.IN_TRANSIT, ShipmentStatus.DELAYED],
            ShipmentStatus.IN_TRANSIT: [ShipmentStatus.DELIVERED, ShipmentStatus.DELAYED],
            ShipmentStatus.DELAYED: [ShipmentStatus.IN_TRANSIT, ShipmentStatus.DELIVERED],
            ShipmentStatus.DELIVERED: [],
        }

        if target not in allowed.get(current, []):
            raise ValidationError(
                f"Cannot transition shipment from {current.value} to {target.value}."
            )

    def update_status(self, shipment_id: str, status: ShipmentStatus, location: str, desc: str) -> bool:
        shipment = self.shipment_dao.get_shipment_by_id(shipment_id)
        self._validate_shipment_transition(shipment.status, status)

        success = self.shipment_dao.update_shipment_status(shipment_id, status)

        if success:
            record = TrackingRecord(
                shipment_id=shipment_id,
                current_location=location,
                description=desc,
            )
            self.shipment_dao.add_tracking_record(record)

            if status == ShipmentStatus.DELIVERED:
                self.order_dao.update_status(shipment.order_id, OrderStatus.DELIVERED)
                self.vehicle_dao.set_availability(shipment.vehicle_id, True)
                self.driver_dao.set_availability(shipment.driver_id, True)

        return success

    