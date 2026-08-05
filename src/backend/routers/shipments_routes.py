import logging
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status

from controllers.fleet_manager import FleetManager
from core.exceptions import DatabaseConnectionError, NotFoundError, ValidationError
from routers.fleet_routes import build_shipment_response, get_fleet_manager
from schemas.shipment_schema import (
    ShipmentResponse,
    DispatchRequest,
    StatusUpdateRequest,
    StatusUpdateResponse,
    AddTrackingRequest,
    TrackingRecordResponse,
)

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/shipments", tags=["shipments"])


@router.get("/{shipment_id}", response_model=ShipmentResponse)
def get_shipment(shipment_id: str, fleet_manager: FleetManager = Depends(get_fleet_manager)):
    try:
        data = fleet_manager.get_enriched_shipment(shipment_id)
    except NotFoundError:
        raise HTTPException(status_code=404, detail="Shipment not found")

    return build_shipment_response(data)


@router.get("", response_model=List[ShipmentResponse])
def list_shipments(driverId: Optional[str] = None, fleet_manager: FleetManager = Depends(get_fleet_manager)):
    if driverId:
        shipments = fleet_manager.list_enriched_shipments_by_driver(driverId)
    else:
        shipments = fleet_manager.list_enriched_shipments()

    return [build_shipment_response(s) for s in shipments]


@router.post("", response_model=ShipmentResponse, status_code=status.HTTP_201_CREATED)
def create_shipment(req: DispatchRequest, fleet_manager: FleetManager = Depends(get_fleet_manager)):
    # Delegate to existing /fleet/dispatch logic by calling manager
    try:
        shipment = fleet_manager.dispatch_shipment(req.orderId, req.vehicleId, req.driverId)
        data = fleet_manager.get_enriched_shipment(shipment.shipment_id)
    except ValidationError as exc:
        raise HTTPException(status_code=400, detail=str(exc))

    return build_shipment_response(data)

@router.patch("/{shipment_id}/status", response_model=StatusUpdateResponse)
def update_shipment_status(
    shipment_id: str,
    req: StatusUpdateRequest,
    fleet_manager: FleetManager = Depends(get_fleet_manager),
):
    try:
        fleet_manager.update_status(
            shipment_id,
            req.status,
            req.location,
            req.description,
        )
    except NotFoundError:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Shipment not found")
    except DatabaseConnectionError as exc:
        logger.error("Shipment status update failed: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Shipment service temporarily unavailable",
        )

    return StatusUpdateResponse(message="Status and tracking updated successfully")


@router.post(
    "/{shipment_id}/tracking",
    response_model=TrackingRecordResponse,
    status_code=status.HTTP_201_CREATED,
)
def add_tracking(
    shipment_id: str,
    req: AddTrackingRequest,
    fleet_manager: FleetManager = Depends(get_fleet_manager),
):
    try:
        record = fleet_manager.add_tracking(
            shipment_id,
            req.location,
            req.description,
        )
    except NotFoundError:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Shipment not found")
    except DatabaseConnectionError as exc:
        logger.error("Tracking creation failed: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Shipment service temporarily unavailable",
        )

    return TrackingRecordResponse(
        recordId=record.record_id,
        shipmentId=record.shipment_id,
        timestamp=record.timestamp,
        currentLocation=record.current_location,
        description=record.description,
    )


@router.get(
    "/{shipment_id}/tracking",
    response_model=list[TrackingRecordResponse],
)
def get_tracking_history(
    shipment_id: str,
    fleet_manager: FleetManager = Depends(get_fleet_manager),
):
    try:
        records = fleet_manager.get_tracking_history(shipment_id)
    except NotFoundError:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Shipment not found")
    return [
        TrackingRecordResponse(
            recordId=r.record_id,
            shipmentId=r.shipment_id,
            timestamp=r.timestamp,
            currentLocation=r.current_location,
            description=r.description,
        )
        for r in records
    ]
