import logging
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status

from controllers.fleet_manager import FleetManager
from core.exceptions import DatabaseConnectionError, NotFoundError, ValidationError
from schemas.fleet_schema import VehicleResponse
from schemas.shipment_schema import (
    DispatchRequest,
    DispatchResult,
    ShipmentResponse,
    StatusUpdateRequest,
    StatusUpdateResponse,
)

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/fleet", tags=["fleet"])


def get_fleet_manager() -> FleetManager:
    return FleetManager()


@router.get("/vehicles/available", response_model=List[VehicleResponse])
def get_vehicles(
    required_capacity: float = 0.0,
    fleet_manager: FleetManager = Depends(get_fleet_manager),
):
    try:
        vehicles = fleet_manager.get_available_vehicles(required_capacity)
    except DatabaseConnectionError as exc:
        logger.error("Vehicle lookup failed: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Fleet service temporarily unavailable",
        )

    return [
        VehicleResponse(
            vehicle_id=v.vehicle_id,
            registration=v.registration,
            capacity_weight=v.capacity_weight,
            is_available=v.is_available,
        )
        for v in vehicles
    ]


@router.post(
    "/dispatch", response_model=DispatchResult, status_code=status.HTTP_201_CREATED
)

def dispatch_shipment(
    req: DispatchRequest,
    fleet_manager: FleetManager = Depends(get_fleet_manager),
):
    try:
        shipment = fleet_manager.dispatch_shipment(
            req.order_id, req.vehicle_id, req.driver_id
        )
    except NotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc))
    except ValidationError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))
    except DatabaseConnectionError as exc:
        logger.error("Dispatch failed: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Fleet service temporarily unavailable",
        )

    return DispatchResult(
        message="Shipment dispatched",
        shipment=ShipmentResponse(
            shipment_id=shipment.shipment_id,
            order_id=shipment.order_id,
            vehicle_id=shipment.vehicle_id,
            driver_id=shipment.driver_id,
            status=shipment.status.value,
        ),
    )


@router.patch("/{shipment_id}/status", response_model=StatusUpdateResponse)
def update_shipment_status(
    shipment_id: str,
    req: StatusUpdateRequest,
    fleet_manager: FleetManager = Depends(get_fleet_manager),
):
    try:
        fleet_manager.update_status(
            shipment_id, req.status, req.location, req.description
        )
    except NotFoundError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Shipment not found"
        )
    except DatabaseConnectionError as exc:
        logger.error(
            "Status update failed for shipment_id=%s: %s", shipment_id, exc
        )
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Fleet service temporarily unavailable",
        )

    return StatusUpdateResponse(message="Status and tracking updated successfully")