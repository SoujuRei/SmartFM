from models.order import Order, Cargo
from daos.order_dao import OrderDAO
from models.enums import OrderStatus

class OrderManager:
    def __init__(self):
        self.order_dao = OrderDAO()

    def create_order(
    self,
    customer_id: str,
    items: list[Cargo]
) -> Order:
        order = Order(customer_id=customer_id, items=items)
        order.calculate_cost()
        
        # Save order via DAO
        saved_order = self.order_dao.save_order(order)
        
        # Here we would also generate the Invoice via an InvoiceDAO
        # For assignment simplicity, we return the saved order data
        return saved_order

    def mock_payment(self, order_id: str) -> bool:
        # Fulfills Assignment 3 requirement: bypass real payment gateway
        # Set order to PROCESSING once paid
        return self.order_dao.update_status(order_id, OrderStatus.PROCESSING)