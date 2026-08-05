import logging

from fastapi import APIRouter, Depends, HTTPException, status

from controllers.order_manager import OrderManager
from core.exceptions import DatabaseConnectionError, NotFoundError

router = APIRouter(prefix="/payments", tags=["payments"])

logger = logging.getLogger(__name__)


def get_order_manager() -> OrderManager:
    return OrderManager()


@router.post("", status_code=status.HTTP_200_OK)
def process_payment(payload: dict, order_manager: OrderManager = Depends(get_order_manager)):
    # accept either {"orderId": "..."} or {"order_id": "..."}
    order_id = payload.get("orderId") or payload.get("order_id")
    if not order_id:
        raise HTTPException(status_code=400, detail="orderId is required")

    method = payload.get("method") or payload.get("paymentMethod") or "mock"

    try:
        ok = order_manager.mock_payment(order_id, method=method)
    except NotFoundError:
        raise HTTPException(status_code=404, detail="Order not found")
    except DatabaseConnectionError as exc:
        logger.error("Payment processing failed for order_id=%s: %s", order_id, exc)
        raise HTTPException(status_code=503, detail="Payment service temporarily unavailable")

    return {"message": "Payment successful", "orderId": order_id, "invoicePaid": True, "processed": bool(ok)}
