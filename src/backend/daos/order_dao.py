from core.database import DatabaseConnection
from models.order import Order
from models.enums import OrderStatus

class OrderDAO:
    def __init__(self):
        self.db = DatabaseConnection().get_instance()

    def save_order(self, order: Order) -> Order:
            data = {
                "customer_id": order.customer_id,
                    "status": order.status.value,
                    "total_amount": order.total_amount
                }

            response = self.db.table("orders").insert(data).execute()

            row = response.data[0]

            return Order(
                    order_id=row["order_id"],
                    customer_id=row["customer_id"],
                    status=OrderStatus(row["status"]),
                    total_amount=row["total_amount"],
                    items=order.items,
                )

    def update_status(self, order_id: str, status: OrderStatus) -> bool:
        res = self.db.table("orders").update({"status": status.value}).eq("order_id", order_id).execute()
        return len(res.data) > 0