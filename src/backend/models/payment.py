from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class Payment(BaseModel):
    payment_id: Optional[str] = None
    order_id: str
    amount: float
    method: Optional[str] = None
    timestamp: Optional[datetime] = None
    status: Optional[str] = None
