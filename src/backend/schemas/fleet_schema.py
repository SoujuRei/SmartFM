from pydantic import BaseModel

 
 
class VehicleResponse(BaseModel):
    vehicleId: str
    registration: str
    capacityWeight: float
    isAvailable: bool

    model_config = {"populate_by_name": True}