from core.database import DatabaseConnection
from core.exceptions import DatabaseConnectionError


class ReportGenerator:

    def __init__(self):
        self.db = DatabaseConnection().get_instance()

    def generate_revenue_report(self) -> dict:

        try:
            response = (
                self.db
                .table("orders")
                .select("status,total_amount")
                .execute()
            )

        except Exception as exc:
            raise DatabaseConnectionError(
                f"Revenue report failed: {exc}"
            ) from exc

        total_revenue = 0.0
        total_orders = 0
        delivered_orders = 0
        by_status = {}

        for order in response.data:
            total_orders += 1
            status = order.get("status")
            amt = float(order.get("total_amount") or 0)
            total_revenue += amt
            by_status[status] = by_status.get(status, 0) + 1
            if status == "DELIVERED":
                delivered_orders += 1

        # monthly breakdown not implemented — return empty list for now
        monthly = []

        return {
            "totalRevenue": total_revenue,
            "totalOrders": total_orders,
            "deliveredOrders": delivered_orders,
            "byStatus": by_status,
            "monthly": monthly,
        }