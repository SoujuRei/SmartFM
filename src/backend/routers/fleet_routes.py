from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from models.enums import ShipmentStatus
from controllers.fleet_manager import FleetManager

router = APIRouter()
fleet_manager = FleetManager()

class DispatchRequest(BaseModel):
    order_id: str
    vehicle_id: str
    driver_id: str

class StatusUpdateRequest(BaseModel):
    status: ShipmentStatus
    location: str
    description: str

@router.get("/vehicles/available")
def get_vehicles(required_capacity: float = 0.0):
    return fleet_manager.get_available_vehicles(required_capacity)

@router.post("/dispatch")
def dispatch_shipment(req: DispatchRequest):
    try:
        shipment = fleet_manager.dispatch_shipment(req.order_id, req.vehicle_id, req.driver_id)
        return {"message": "Shipment dispatched", "shipment": shipment}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.patch("/{shipment_id}/status")
def update_shipment_status(shipment_id: str, req: StatusUpdateRequest):
    success = fleet_manager.update_status(
        shipment_id, 
        req.status, 
        req.location, 
        req.description
    )
    if success:
        return {"message": "Status and tracking updated successfully"}
    raise HTTPException(status_code=404, detail="Shipment not found")