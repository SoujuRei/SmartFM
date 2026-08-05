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
    
    def dimensions_object(self):
        l,w,h = self.dimensions.split("x")

        return {
            "lengthCm": float(l),
            "widthCm": float(w),
            "heightCm": float(h)
        }


class Order(BaseModel):
    order_id: Optional[str] = None
    customer_id: str = Field(min_length=1)
    order_date: datetime = Field(default_factory=datetime.now)
    status: OrderStatus = OrderStatus.PENDING
    total_amount: float = 0.0
    items: List[Cargo] = Field(default_factory=list)
    origin: str | None = None
    destination: str | None = None
    payment_method: str | None = None
    is_paid: bool = False
    total_weight_kg: float = 0.0
    distance_km: float = 0.0

    def calculate_cost(self) -> float:
        total_weight = sum(item.weight for item in self.items)
        total_vol = sum(item.calculate_volume() for item in self.items)
        volumetric_weight = total_vol / 5000
        chargeable_weight = max(total_weight, volumetric_weight)

        base_rate = 10.0
        price_per_kg = 8.0
        distance_factor = 1 + (self.distance_km / 10000)

        price = base_rate + chargeable_weight * price_per_kg
        price *= distance_factor
        price += 5.0

        self.total_amount = round(price, 2)
        self.total_weight_kg = total_weight
        return self.total_amount