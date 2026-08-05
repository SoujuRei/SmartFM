from daos.shipment_dao import ShipmentDAO
from models.fleet import Shipment, TrackingRecord
from models.enums import ShipmentStatus
from datetime import datetime

class FleetManager:
    def __init__(self):
        self.shipment_dao = ShipmentDAO()

    def get_available_vehicles(self, required_capacity: float) -> list:
        return self.shipment_dao.get_available_vehicles(required_capacity)

    def dispatch_shipment(self, order_id: str, vehicle_id: str, driver_id: str) -> dict:
        new_shipment = Shipment(
            order_id=order_id,
            vehicle_id=vehicle_id,
            driver_id=driver_id
        )
        return self.shipment_dao.save_shipment(new_shipment)

    def update_status(self, shipment_id: str, status: ShipmentStatus, location: str, desc: str) -> bool:
        # 1. Update the shipment status
        success = self.shipment_dao.update_shipment_status(shipment_id, status)
        
        # 2. Automatically generate a tracking record for the customer to see
        if success:
            record = TrackingRecord(
                shipment_id=shipment_id,
                current_location=location,
                description=desc
            )
            self.shipment_dao.add_tracking_record(record)
            
        return success