import logging
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status

from controllers.fleet_manager import FleetManager
from core.exceptions import DatabaseConnectionError, NotFoundError, ValidationError
from schemas.fleet_schema import VehicleResponse
from schemas.shipment_schema import (
    DispatchRequest,
    DispatchResult,
    ShipmentResponse,
    StatusUpdateRequest,
    StatusUpdateResponse,
    TrackingRecordResponse,
    ShipmentListResponse,
    AddTrackingRequest
)
from schemas.order_schema import OrderResponse
from schemas.driver_schema import DriverResponse

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/fleet", tags=["fleet"])

def build_shipment_response(data):

    shipment = data["shipment"]
    order = data["order"]
    vehicle = data["vehicle"]
    driver = data["driver"]


    return ShipmentResponse(

        shipmentId=shipment.shipment_id,
        orderId=shipment.order_id,
        vehicleId=shipment.vehicle_id,
        driverId=shipment.driver_id,
        estimatedDelivery=shipment.estimated_delivery if getattr(shipment, "estimated_delivery", None) else None,
        status=shipment.status.value,


        order=OrderResponse(
            orderId=order.order_id,
            customerId=order.customer_id,
            status=order.status.value,
            origin=order.origin,
            destination=order.destination,
            distanceKm=order.distance_km,
            totalAmount=order.total_amount,
            totalWeightKg=order.total_weight_kg,
            paymentMethod=order.payment_method,
            isPaid=order.is_paid,
            cargoItems=[
                {
                    "cargoId": item.cargo_id,
                    "weightKg": item.weight,
                    "dimensions": item.dimensions_object(),
                    "cargoType": item.type,
                }
                for item in order.items
            ],
        ),


        vehicle=VehicleResponse(
            vehicleId=vehicle.vehicle_id,
            registration=vehicle.registration,
            capacityWeight=vehicle.capacity_weight,
            isAvailable=vehicle.is_available,
        ),


        driver=DriverResponse(
            id=driver.user_id,
            name=driver.name,
            email=driver.email,
            licenseNumber=driver.license_number,
            isAvailable=driver.is_available,
        )
    )

def get_fleet_manager() -> FleetManager:
    return FleetManager()


@router.get("/vehicles/available", response_model=List[VehicleResponse])
def get_vehicles(
    minCapacity: float = 0.0,
    fleet_manager: FleetManager = Depends(get_fleet_manager),
):
    try:
        vehicles = fleet_manager.get_available_vehicles(minCapacity)
    except DatabaseConnectionError as exc:
        logger.error("Vehicle lookup failed: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Fleet service temporarily unavailable",
        )

    return [
        VehicleResponse(
            vehicleId=v.vehicle_id,
            registration=v.registration,
            capacityWeight=v.capacity_weight,
            isAvailable=v.is_available,
        )
        for v in vehicles
    ]

@router.get("/shipments/{shipment_id}", response_model=ShipmentResponse)
def get_shipment(
    shipment_id: str,
    fleet_manager: FleetManager = Depends(get_fleet_manager),
):

    try:
        data = fleet_manager.get_enriched_shipment(
            shipment_id
        )

    except NotFoundError:
        raise HTTPException(
            status_code=404,
            detail="Shipment not found"
        )


    return build_shipment_response(data)

@router.get("/shipments", response_model=list[ShipmentResponse])
def list_shipments(
    driverId: Optional[str] = None,
    fleet_manager: FleetManager = Depends(get_fleet_manager),
):

    if driverId:
        shipments = fleet_manager.list_enriched_shipments_by_driver(driverId)
    else:
        shipments = fleet_manager.list_enriched_shipments()

    return [build_shipment_response(s) for s in shipments]

@router.post(
    "/shipments",
    response_model=ShipmentResponse,
    status_code=status.HTTP_201_CREATED
)
def create_shipment(
    req: DispatchRequest,
    fleet_manager: FleetManager = Depends(get_fleet_manager),
):

    try:
        shipment = fleet_manager.dispatch_shipment(
            req.orderId,
            req.vehicleId,
            req.driverId
        )

        data = fleet_manager.get_enriched_shipment(
            shipment.shipment_id
        )

    except ValidationError as exc:
        raise HTTPException(
            status_code=400,
            detail=str(exc)
        )

    return build_shipment_response(data)

@router.post(
    "/shipments/{shipment_id}/tracking",
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
        raise HTTPException(
            status_code=404,
            detail="Shipment not found",
        )

    except DatabaseConnectionError as exc:
        logger.error(
            "Tracking creation failed: %s",
            exc,
        )

        raise HTTPException(
            status_code=503,
            detail="Fleet service temporarily unavailable",
        )


    return TrackingRecordResponse(
        recordId=record.record_id,
        shipmentId=record.shipment_id,
        timestamp=record.timestamp,
        currentLocation=record.current_location,
        description=record.description,
    )

@router.get(
    "/shipments/{shipment_id}/tracking",
    response_model=list[TrackingRecordResponse]
)
def get_tracking_history(
    shipment_id: str,
    fleet_manager: FleetManager = Depends(get_fleet_manager),
):
    records = fleet_manager.get_tracking_history(shipment_id)

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


@router.post(
    "/dispatch", response_model=DispatchResult, status_code=status.HTTP_201_CREATED
)

def dispatch_shipment(
    req: DispatchRequest,
    fleet_manager: FleetManager = Depends(get_fleet_manager),
):
    try:
        shipment = fleet_manager.dispatch_shipment(
            req.orderId, req.vehicleId, req.driverId
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
            shipmentId=shipment.shipment_id,
            orderId=shipment.order_id,
            vehicleId=shipment.vehicle_id,
            driverId=shipment.driver_id,
            estimatedDelivery=shipment.estimated_delivery if getattr(shipment, "estimated_delivery", None) else None,
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