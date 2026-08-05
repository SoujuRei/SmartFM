from pydantic import BaseModel
from typing import Optional

from schemas.order_schema import OrderResponse
from schemas.shipment_schema import (
    ShipmentSummaryResponse,
    TrackingRecordResponse,
)


class OrderTrackingResponse(BaseModel):
    order: OrderResponse
    shipment: Optional[ShipmentSummaryResponse] = None
    events: list[TrackingRecordResponse]
    model_config = {"populate_by_name": True}