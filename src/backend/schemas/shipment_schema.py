from datetime import datetime
from pydantic import BaseModel, Field

from models.enums import ShipmentStatus

from schemas.fleet_schema import VehicleResponse
from schemas.driver_schema import DriverResponse
from schemas.order_schema import OrderResponse



class StatusUpdateRequest(BaseModel):
    status: ShipmentStatus
    location: str = Field(min_length=1)
    description: str = Field(min_length=1)


class ShipmentSummaryResponse(BaseModel):
    shipmentId: str
    orderId: str
    vehicleId: str
    driverId: str
    estimatedDelivery: datetime | None = None
    status: str

    model_config = {"populate_by_name": True}

class ShipmentResponse(ShipmentSummaryResponse):
    order: OrderResponse
    vehicle: VehicleResponse
    driver: DriverResponse

class ShipmentListResponse(BaseModel):
    shipments: list[ShipmentResponse]


class DispatchRequest(BaseModel):
    orderId: str = Field(min_length=1)
    vehicleId: str = Field(min_length=1)
    driverId: str = Field(min_length=1)

    model_config = {"populate_by_name": True}


class DispatchResult(BaseModel):
    message: str
    shipment: ShipmentSummaryResponse

class TrackingRecordResponse(BaseModel):
    recordId: str
    shipmentId: str
    timestamp: datetime
    currentLocation: str
    description: str

    model_config = {"populate_by_name": True}

class AddTrackingRequest(BaseModel):
    location: str
    description: str    

    model_config = {"populate_by_name": True}

class StatusUpdateResponse(BaseModel):
    message: str



