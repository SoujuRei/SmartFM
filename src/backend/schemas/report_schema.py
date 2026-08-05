from pydantic import BaseModel


class RevenueReportResponse(BaseModel):
    totalRevenue: float
    totalOrders: int
    deliveredOrders: int
    byStatus: dict
    monthly: list

    model_config = {"populate_by_name": True}