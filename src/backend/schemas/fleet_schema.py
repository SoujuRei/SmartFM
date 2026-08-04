from pydantic import BaseModel

 
 
class VehicleResponse(BaseModel):
    vehicle_id: str
    registration: str
    capacity_weight: float
    is_available: bool