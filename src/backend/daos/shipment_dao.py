from core.database import DatabaseConnection
from models.fleet import Shipment, TrackingRecord
from models.enums import ShipmentStatus

class ShipmentDAO:
    def __init__(self):
        self.db = DatabaseConnection().get_instance()

    def get_available_vehicles(self, required_capacity: float) -> list:
        # Queries vehicles that are available and can handle the weight
        response = self.db.table("vehicles")\
            .select("*")\
            .eq("is_available", True)\
            .gte("capacity_weight", required_capacity)\
            .execute()
        return response.data

    def save_shipment(self, shipment: Shipment) -> dict:
        data = shipment.dict(exclude={'shipment_id'})
        data['status'] = data['status'].value
        response = self.db.table("shipments").insert(data).execute()
        
        # Mark vehicle as unavailable
        self.db.table("vehicles").update({"is_available": False})\
            .eq("vehicle_id", shipment.vehicle_id).execute()
            
        return response.data[0]

    def update_shipment_status(self, shipment_id: str, status: ShipmentStatus) -> bool:
        res = self.db.table("shipments").update({"status": status.value})\
            .eq("shipment_id", shipment_id).execute()
        return len(res.data) > 0
        
    def add_tracking_record(self, record: TrackingRecord) -> dict:
        data = record.dict(exclude={'record_id'})
        data['timestamp'] = data['timestamp'].isoformat()
        res = self.db.table("tracking_records").insert(data).execute()
        return res.data[0]