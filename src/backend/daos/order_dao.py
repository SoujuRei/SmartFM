from core.database import DatabaseConnection
from models.order import Order
from models.enums import OrderStatus
from daos.cargo_dao import CargoDAO
from typing import List, Optional


cargo_dao = CargoDAO()

class OrderDAO:
    def __init__(self):
        self.db = DatabaseConnection().get_instance()

    # Helper function for order reconstruction

    def _row_to_order(self, row: dict, items=None) -> Order:
        return Order(
            order_id=row["order_id"],
            customer_id=row["customer_id"],
            order_date=row["order_date"],
            status=OrderStatus(row["status"]),
            total_amount=float(row["total_amount"]),
            items=items or [],
            origin=row.get("origin"),
            destination=row.get("destination"),
            distance_km=float(row.get("distance_km", 0.0)),
            payment_method=row.get("payment_method"),
            is_paid=row.get("is_paid", False),
            total_weight_kg=float(row.get("total_weight_kg", 0))
    )

    

    def save_order(self, order: Order) -> Order:
            data = {
                "customer_id": order.customer_id,
                    "status": order.status.value,
                    "total_amount": order.total_amount,
                    "origin": getattr(order, "origin", None),
                    "destination": getattr(order, "destination", None),
                    "distance_km": getattr(order, "distance_km", 0.0),
                    "payment_method": getattr(order, "payment_method", None),
                    "is_paid": getattr(order, "is_paid", False),
                    "total_weight_kg": getattr(order, "total_weight_kg", 0.0),
                }

            response = self.db.table("orders").insert(data).execute()

            row = response.data[0]
            saved = self._row_to_order(row, order.items)

            # persist cargo items
            if order.items:
                cargo_dao.save_cargo_items(saved.order_id, order.items)

            return saved

    def get_order_by_id(self, order_id: str) -> Optional[Order]:
        response = (
            self.db.table("orders")
            .select("*")
            .eq("order_id", order_id)
            .execute()
    )

        if not response.data:
            return None

        row = response.data[0]
        items = cargo_dao.get_cargo_by_order_id(order_id)
        return self._row_to_order(row, items)  


    def list_orders(self) -> List[Order]:
        response = self.db.table("orders").select("*").execute()

        orders = []
        for row in response.data:
            items = cargo_dao.get_cargo_by_order_id(row["order_id"]) if row.get("order_id") else []
            orders.append(self._row_to_order(row, items))

        return orders
        

    def update_status(self, order_id: str, status: OrderStatus) -> bool:
        res = self.db.table("orders").update({"status": status.value}).eq("order_id", order_id).execute()
        return len(res.data) > 0

    def mark_paid(self, order_id: str) -> bool:
        res = self.db.table("orders").update({"is_paid": True}).eq("order_id", order_id).execute()
        return len(res.data) > 0

    def mark_unpaid(self, order_id: str) -> bool:
        res = self.db.table("orders").update({"is_paid": False}).eq("order_id", order_id).execute()
        return len(res.data) > 0

    def delete_order(self, order_id: str) -> bool:
        res = self.db.table("orders").delete().eq("order_id", order_id).execute()
        return len(res.data) > 0


