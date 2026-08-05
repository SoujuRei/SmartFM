import logging

from fastapi import APIRouter, Depends, HTTPException, status

from controllers.order_manager import OrderManager
from core.exceptions import DatabaseConnectionError, NotFoundError, ValidationError
from models.order import Cargo
from schemas.order_schema import CreateOrderRequest, OrderResponse, PaymentResponse

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
    items = [Cargo(**item.model_dump()) for item in req.items]

    try:
        order = order_manager.create_order(req.customer_id, items)
    except ValidationError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))
    except DatabaseConnectionError as exc:
        logger.error("Order creation failed: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Order service temporarily unavailable",
        )

    return OrderResponse(
        order_id=order.order_id,
        customer_id=order.customer_id,
        status=order.status.value,
        total_amount=order.total_amount,
    )


@router.post("/{order_id}/pay", response_model=PaymentResponse)
def process_mock_payment(
    order_id: str,
    order_manager: OrderManager = Depends(get_order_manager),
):
    try:
        order_manager.mock_payment(order_id)
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
        order_id=order_id,
    )