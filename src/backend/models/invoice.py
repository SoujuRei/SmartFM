from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class Invoice(BaseModel):
    invoice_id: Optional[str] = None
    order_id: str = Field(min_length=1)
    issue_date: datetime = Field(default_factory=datetime.now)
    amount: float = Field(ge=0)
    is_paid: bool = False