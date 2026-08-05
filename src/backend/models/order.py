from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field, field_validator
from .enums import OrderStatus


class Cargo(BaseModel):
    cargo_id: Optional[str] = None
    weight: float = Field(gt=0)
    dimensions: str
    type: str = Field(min_length=1)

    @field_validator("dimensions")
    @classmethod
    def dimensions_format(cls, v: str) -> str:
        parts = v.split("x")
        if len(parts) != 3:
            raise ValueError("dimensions must be 'LxWxH', e.g. '10x5x2'")
        try:
            l, w, h = (float(p) for p in parts)
        except ValueError:
            raise ValueError("dimensions must contain three numbers, e.g. '10x5x2'")
        if l <= 0 or w <= 0 or h <= 0:
            raise ValueError("dimensions must all be positive")
        return v

    def calculate_volume(self) -> float:
        l, w, h = (float(p) for p in self.dimensions.split("x"))
        return l * w * h


class Order(BaseModel):
    order_id: Optional[str] = None
    customer_id: str = Field(min_length=1)
    order_date: datetime = Field(default_factory=datetime.now)
    status: OrderStatus = OrderStatus.PENDING
    total_amount: float = 0.0
    items: List[Cargo] = Field(min_length=1)

    def calculate_cost(self) -> float:
        base_rate = 15.5
        total_vol = sum(item.calculate_volume() for item in self.items)
        self.total_amount = total_vol * base_rate
        return self.total_amount