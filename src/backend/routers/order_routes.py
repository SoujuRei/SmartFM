import logging

from fastapi import APIRouter, Depends, HTTPException, status

from controllers.order_manager import OrderManager
from core.exceptions import DatabaseConnectionError, NotFoundError, ValidationError
from models.order import Cargo
from schemas.order_schema import (
    CreateOrderRequest,
    OrderResponse,
    PaymentResponse,
    ActionResponse,
)
from schemas.tracking_schema import OrderTrackingResponse
from schemas.shipment_schema import (
    ShipmentSummaryResponse,
    TrackingRecordResponse,
)
from typing import List

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/orders", tags=["orders"])


def get_order_manager() -> OrderManager:
    return OrderManager()


@router.post("/", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
def create_order(
    req: CreateOrderRequest,
    order_manager: OrderManager = Depends(get_order_manager),
):
    # Convert API-boundary DTOs into domain objects before they cross into
    items = [
    item.to_domain()
    for item in req.cargoItems
]

    # pass through optional origin/destination/payment fields if provided
    origin = getattr(req, "origin", None)
    destination = getattr(req, "destination", None)
    payment_method = getattr(req, "paymentMethod", None) or getattr(req, "payment_method", None)

    try:
        order = order_manager.create_order(
        req.customerId,
        items,
        origin=req.origin,
        destination=req.destination,
        distance_km=req.distanceKm or 0.0,
        payment_method=req.paymentMethod,
    )
        # attach optional metadata if available on request
        if origin:
            order.origin = origin
        if destination:
            order.destination = destination
        if payment_method:
            order.payment_method = payment_method
    except ValidationError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))
    except DatabaseConnectionError as exc:
        logger.error("Order creation failed: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Order service temporarily unavailable",
        )

    return OrderResponse(
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
    )

@router.get("/", response_model=List[OrderResponse])
def list_orders(
    order_manager: OrderManager = Depends(get_order_manager),
):
    orders = order_manager.list_orders()

    return [
        OrderResponse(
            orderId=o.order_id,
            customerId=o.customer_id,
            status=o.status.value,
            origin=o.origin,
            destination=o.destination,
            distanceKm=o.distance_km,
            totalAmount=o.total_amount,
            totalWeightKg=o.total_weight_kg,
            paymentMethod=o.payment_method,
            isPaid=o.is_paid,
            cargoItems=[
                {
                    "cargoId": item.cargo_id,
                    "weightKg": item.weight,
                    "dimensions": item.dimensions_object(),
                    "cargoType": item.type,
                }
                for item in o.items
            ],
        )
        for o in orders
    ]



@router.get(
    "/{order_id}/tracking",
    response_model=OrderTrackingResponse,
)
def get_tracking(
    order_id: str,
    order_manager: OrderManager = Depends(get_order_manager),
):

    data = order_manager.get_tracking(order_id)

    shipment = None

    if data["shipment"]:
        s = data["shipment"]
        shipment = ShipmentSummaryResponse(
            shipmentId=s.shipment_id,
            orderId=s.order_id,
            vehicleId=s.vehicle_id,
            driverId=s.driver_id,
            estimatedDelivery=s.estimated_delivery if getattr(s, "estimated_delivery", None) else None,
            status=s.status.value,
        )

    return OrderTrackingResponse(
        order=OrderResponse(
            orderId=data["order"].order_id,
            customerId=data["order"].customer_id,
            status=data["order"].status.value,
            origin=data["order"].origin,
            destination=data["order"].destination,
            distanceKm=data["order"].distance_km,
            totalAmount=data["order"].total_amount,
            totalWeightKg=data["order"].total_weight_kg,
            paymentMethod=data["order"].payment_method,
            isPaid=data["order"].is_paid,
            cargoItems=[
                {
                    "cargoId": item.cargo_id,
                    "weightKg": item.weight,
                    "dimensions": item.dimensions_object(),
                    "cargoType": item.type,
                }
                for item in data["order"].items
            ],
        ),
        shipment=shipment,
        events=[
            TrackingRecordResponse(
                recordId=e.record_id,
                shipmentId=e.shipment_id,
                timestamp=e.timestamp,
                currentLocation=e.current_location,
                description=e.description,
            )
            for e in data["events"]
        ],
    )
@router.get("/{order_id}", response_model=OrderResponse)
def get_order(
    order_id: str,
    order_manager: OrderManager = Depends(get_order_manager),
):
    order = order_manager.get_order(order_id)

    if order is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found",
        )

    return OrderResponse(
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
    )

@router.post("/{order_id}/pay", response_model=PaymentResponse)
def process_mock_payment(
    order_id: str,
    order_manager: OrderManager = Depends(get_order_manager),
):
    try:
        order_manager.mock_payment(order_id, method="mock")
    except NotFoundError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Order not found"
        )
    except DatabaseConnectionError as exc:
        logger.error("Payment processing failed for order_id=%s: %s", order_id, exc)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Payment service temporarily unavailable",
        )

    return PaymentResponse(
        message="Payment successful, order is now PROCESSING",
        orderId=order_id,
        invoicePaid=True,
    )


@router.post("/{order_id}/cancel", response_model=ActionResponse)
def cancel_order(
    order_id: str,
    order_manager: OrderManager = Depends(get_order_manager),
):
    try:
        order_manager.cancel_order(order_id)
    except NotFoundError:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")
    except ValidationError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))
    except DatabaseConnectionError as exc:
        logger.error("Order cancellation failed for order_id=%s: %s", order_id, exc)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Order service temporarily unavailable",
        )

    return ActionResponse(message="Order cancelled successfully")


@router.delete("/{order_id}", response_model=ActionResponse)
def delete_order(
    order_id: str,
    order_manager: OrderManager = Depends(get_order_manager),
):
    try:
        order_manager.delete_order(order_id)
    except NotFoundError:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")
    except ValidationError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))
    except DatabaseConnectionError as exc:
        logger.error("Order deletion failed for order_id=%s: %s", order_id, exc)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Order service temporarily unavailable",
        )

    return ActionResponse(message="Order deleted successfully")