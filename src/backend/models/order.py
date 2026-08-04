from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from .enums import OrderStatus

class Cargo(BaseModel):
    weight: float
    dimensions: str
    type: str

    def calculate_volume(self) -> float:
        try:
            l, w, h = map(float, self.dimensions.split('x'))
            return l * w * h
        except:
            return 1.0 # fallback

class Order(BaseModel):
    order_id: Optional[str] = None
    customer_id: str
    order_date: datetime = datetime.now()
    status: OrderStatus = OrderStatus.PENDING
    total_amount: float = 0.0
    items: List[Cargo] = []

    def calculate_cost(self) -> float:
        base_rate = 15.5
        total_vol = sum(item.calculate_volume() for item in self.items)
        self.total_amount = total_vol * base_rate
        return self.total_amount