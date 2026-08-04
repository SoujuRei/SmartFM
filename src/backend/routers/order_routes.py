from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List
from models.order import Cargo
from controllers.order_manager import OrderManager

router = APIRouter()
order_manager = OrderManager()

class CreateOrderRequest(BaseModel):
    customer_id: str
    items: List[Cargo]

@router.post("/")
def create_order(req: CreateOrderRequest):
    try:
        result = order_manager.create_order(req.customer_id, req.items)
        return {"message": "Order created successfully", "order": result}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/{order_id}/pay")
def process_mock_payment(order_id: str):
    success = order_manager.mock_payment(order_id)
    if success:
        return {"message": "Payment successful, order is now PROCESSING"}
    raise HTTPException(status_code=404, detail="Order not found")