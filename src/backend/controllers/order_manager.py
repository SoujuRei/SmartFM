from datetime import datetime
from models.order import Order, Cargo
from daos.order_dao import OrderDAO
from daos.cargo_dao import CargoDAO
from daos.fleet_dao import VehicleDAO
from daos.driver_dao import DriverDAO
from models.enums import OrderStatus, ShipmentStatus
from models.invoice import Invoice
from daos.invoice_dao import InvoiceDAO
from daos.shipment_dao import ShipmentDAO
from daos.payment_dao import PaymentDAO
from models.payment import Payment
from core.exceptions import NotFoundError, ValidationError

class OrderManager:
    def __init__(self):
        self.order_dao = OrderDAO()
        self.cargo_dao = CargoDAO()
        self.invoice_dao = InvoiceDAO()
        self.shipment_dao = ShipmentDAO()
        self.payment_dao = PaymentDAO()
        self.vehicle_dao = VehicleDAO()
        self.driver_dao = DriverDAO()

    def create_order(
    self,
    customer_id: str,
    items: list[Cargo],
    origin: str | None = None,
    destination: str | None = None,
    distance_km: float = 0.0,
    payment_method: str | None = None,
) -> Order:
        order = Order(customer_id=customer_id, items=items)
        # attach optional metadata
        order.origin = origin
        order.destination = destination
        order.distance_km = distance_km
        order.payment_method = payment_method

        # calculate cost and weights
        order.calculate_cost()

        # Save order via DAO (persists metadata and weight)
        saved_order = self.order_dao.save_order(order)

        invoice = Invoice(
            order_id=saved_order.order_id,
            amount=saved_order.total_amount,
        )

        self.invoice_dao.save_invoice(invoice)

        return saved_order

    def get_order(self, order_id: str) -> Order | None:
        return self.order_dao.get_order_by_id(order_id)

    def get_tracking(self, order_id: str):
        order = self.order_dao.get_order_by_id(order_id)

        if order is None:
            raise NotFoundError("Order not found")

        shipment = self.shipment_dao.get_by_order_id(order_id)

        events = []

        if shipment:
            events = self.shipment_dao.get_tracking_history(
                shipment.shipment_id
            )

        return {
            "order": order,
            "shipment": shipment,
            "events": events,
        }

    def list_orders(self) -> list[Order]:
        return self.order_dao.list_orders()

    def cancel_order(self, order_id: str) -> bool:
        order = self.order_dao.get_order_by_id(order_id)
        if order is None:
            raise NotFoundError("Order not found")

        if order.status == OrderStatus.DELIVERED:
            raise ValidationError("Cannot cancel an order that has already been delivered")
        if order.status == OrderStatus.CANCELLED:
            raise ValidationError("Order is already cancelled")

        if order.is_paid:
            refund_payment = Payment(
                order_id=order_id,
                amount=-float(order.total_amount),
                method=order.payment_method,
                timestamp=datetime.now(),
                status="REFUNDED",
            )
            self.payment_dao.save_payment(refund_payment)
            self.invoice_dao.mark_unpaid(order_id)
            self.order_dao.mark_unpaid(order_id)

        shipment = self.shipment_dao.get_by_order_id(order_id)
        if shipment and shipment.status != ShipmentStatus.DELIVERED:
            self.vehicle_dao.set_availability(shipment.vehicle_id, True)
            self.driver_dao.set_availability(shipment.driver_id, True)
            self.shipment_dao.delete_tracking_by_shipment_id(shipment.shipment_id)
            self.shipment_dao.delete_shipment_by_order_id(order_id)

        self.order_dao.update_status(order_id, OrderStatus.CANCELLED)
        return True

    def delete_order(self, order_id: str) -> bool:
        order = self.order_dao.get_order_by_id(order_id)
        if order is None:
            raise NotFoundError("Order not found")

        if order.status != OrderStatus.CANCELLED:
            raise ValidationError("Only cancelled orders can be deleted")

        self.cargo_dao.delete_cargo_by_order_id(order_id)
        self.payment_dao.delete_payments_by_order_id(order_id)
        self.invoice_dao.delete_invoice_by_order_id(order_id)
        self.shipment_dao.delete_shipment_by_order_id(order_id)
        return self.order_dao.delete_order(order_id)

    def mock_payment(self, order_id: str, method: str = "mock") -> bool:

        invoice = self.invoice_dao.get_invoice_by_order(order_id)

        if invoice is None:
            raise NotFoundError("Invoice not found")

        payment = Payment(
            order_id=order_id,
            amount=float(invoice.amount),
            method=method,
            status="completed",
        )

        self.payment_dao.save_payment(payment)

        self.invoice_dao.mark_paid(order_id)
        self.order_dao.mark_paid(order_id)

        return self.order_dao.update_status(
        order_id,
        OrderStatus.PROCESSING
    )