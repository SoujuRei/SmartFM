from typing import List
from pydantic import BaseModel, Field


class CargoItemRequest(BaseModel):
    weight: float = Field(gt=0)
    dimensions: str
    type: str = Field(min_length=1)


class CreateOrderRequest(BaseModel):
    customer_id: str = Field(min_length=1)
    items: List[CargoItemRequest] = Field(min_length=1)


class OrderResponse(BaseModel):
    order_id: str
    customer_id: str
    status: str
    total_amount: float


class PaymentResponse(BaseModel):
    message: str
    order_id: str