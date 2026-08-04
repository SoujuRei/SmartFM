from core.database import DatabaseConnection
from models.order import Order
from models.enums import OrderStatus

class OrderDAO:
    def __init__(self):
        self.db = DatabaseConnection().get_instance()

    def save_order(self, order: Order) -> dict:
        data = {
            "customer_id": order.customer_id,
            "status": order.status.value,
            "total_amount": order.total_amount
        }
        response = self.db.table("orders").insert(data).execute()
        return response.data[0]

    def update_status(self, order_id: str, status: OrderStatus) -> bool:
        res = self.db.table("orders").update({"status": status.value}).eq("order_id", order_id).execute()
        return len(res.data) > 0