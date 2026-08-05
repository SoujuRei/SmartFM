from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from .enums import ShipmentStatus


class Vehicle(BaseModel):
    vehicle_id: Optional[str] = None
    registration: str
    capacity_weight: float
    is_available: bool = True
    type: str | None = None
    current_location: str | None = None

class TrackingRecord(BaseModel):
    record_id: Optional[str] = None
    shipment_id: str
    timestamp: datetime = Field(default_factory=datetime.now)
    current_location: str
    description: str

class Shipment(BaseModel):
    shipment_id: Optional[str] = None
    order_id: str
    vehicle_id: str
    driver_id: str
    dispatch_date: datetime = Field(default_factory=datetime.now)
    estimated_delivery: Optional[datetime] = None
    status: ShipmentStatus = ShipmentStatus.ASSIGNED