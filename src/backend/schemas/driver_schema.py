from pydantic import BaseModel


class DriverResponse(BaseModel):
    id: str
    name: str
    email: str
    licenseNumber: str | None = None
    isAvailable: bool

    model_config = {"populate_by_name": True}