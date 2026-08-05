 
from pydantic import BaseModel, Field
 
from models.enums import ShipmentStatus
 
 
class DispatchRequest(BaseModel):
    order_id: str = Field(min_length=1)
    vehicle_id: str = Field(min_length=1)
    driver_id: str = Field(min_length=1)
 
 
class StatusUpdateRequest(BaseModel):
    status: ShipmentStatus
    location: str = Field(min_length=1)
    description: str = Field(min_length=1)
 
 
class ShipmentResponse(BaseModel):
    shipment_id: str
    order_id: str
    vehicle_id: str
    driver_id: str
    status: str
 
 
class DispatchResult(BaseModel):
    message: str
    shipment: ShipmentResponse
 
 
class StatusUpdateResponse(BaseModel):
    message: str