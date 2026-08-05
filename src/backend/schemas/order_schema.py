from typing import List, Optional
from pydantic import BaseModel, Field
from typing import List

class CargoDimensionsResponse(BaseModel):
    lengthCm: float
    widthCm: float
    heightCm: float


class CargoItemResponse(BaseModel):
    cargoId: str | None = None
    weightKg: float
    dimensions: CargoDimensionsResponse
    cargoType: str


class OrderResponse(BaseModel):
    orderId: str
    customerId: str
    status: str
    origin: str | None = None
    destination: str | None = None
    distanceKm: float | None = None
    totalAmount: float
    totalWeightKg: float | None = None
    paymentMethod: str | None = None
    isPaid: bool | None = None
    cargoItems: List[CargoItemResponse] = Field(default_factory=list)

    model_config = {"populate_by_name": True}


class ActionResponse(BaseModel):
    message: str

    model_config = {"populate_by_name": True}


class CargoDimensionsRequest(BaseModel):
    lengthCm: float
    widthCm: float
    heightCm: float

    model_config = {
        "populate_by_name": True
    }


class CargoItemRequest(BaseModel):
    description: str | None = None
    cargoType: str = Field(min_length=1)
    weightKg: float = Field(gt=0)
    dimensions: CargoDimensionsRequest

    model_config = {
        "populate_by_name": True
    }

    def to_domain(self):
        from models.order import Cargo

        return Cargo(
            weight=self.weightKg,
            dimensions=f"{self.dimensions.lengthCm}x{self.dimensions.widthCm}x{self.dimensions.heightCm}",
            type=self.cargoType,
        )

class CreateOrderRequest(BaseModel):
    customerId: str = Field(min_length=1)
    cargoItems: List[CargoItemRequest] = Field(min_length=1)

    origin: str | None = None
    destination: str | None = None
    distanceKm: float | None = Field(default=None, ge=0)
    paymentMethod: str | None = None

    model_config = {
        "populate_by_name": True
    }


class PaymentResponse(BaseModel):
    message: str
    orderId: str
    invoicePaid: bool

    model_config = {"populate_by_name": True}