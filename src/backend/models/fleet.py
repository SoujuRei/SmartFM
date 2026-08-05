from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from .enums import ShipmentStatus

class Vehicle(BaseModel):
    vehicle_id: Optional[str] = None
    registration: str
    capacity_weight: float
    is_available: bool = True

class TrackingRecord(BaseModel):
    record_id: Optional[str] = None
    shipment_id: str
    timestamp: datetime = datetime.now()
    current_location: str
    description: str

class Shipment(BaseModel):
    shipment_id: Optional[str] = None
    order_id: str
    vehicle_id: str
    driver_id: str
    dispatch_date: datetime = datetime.now()
    status: ShipmentStatus = ShipmentStatus.DISPATCHED