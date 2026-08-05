from core.database import DatabaseConnection
from core.exceptions import DatabaseConnectionError
from models.payment import Payment
from typing import List
import logging

logger = logging.getLogger(__name__)


class PaymentDAO:
    def __init__(self):
        self.db = DatabaseConnection().get_instance()

    def save_payment(self, payment: Payment) -> Payment:
        data = payment.model_dump(exclude={"payment_id"}, exclude_none=True)
        try:
            res = self.db.table("payments").insert(data).execute()
        except Exception as exc:
            logger.exception("Failed to insert payment for order=%s", payment.order_id)
            raise DatabaseConnectionError(f"Payment insert failed: {exc}") from exc

        if not res.data:
            raise DatabaseConnectionError("Payment insert returned no data")

        return Payment(**res.data[0])

    def get_payments_by_order(self, order_id: str) -> List[Payment]:
        try:
            res = self.db.table("payments").select("*").eq("order_id", order_id).execute()
        except Exception as exc:
            logger.exception("Failed to fetch payments for order=%s", order_id)
            raise DatabaseConnectionError(f"Payment lookup failed: {exc}") from exc

        return [Payment(**row) for row in res.data]

    def delete_payments_by_order_id(self, order_id: str) -> int:
        try:
            res = (
                self.db.table("payments")
                .delete()
                .eq("order_id", order_id)
                .execute()
            )
        except Exception as exc:
            logger.exception("Failed deleting payments for order=%s", order_id)
            raise DatabaseConnectionError(f"Payment delete failed: {exc}") from exc

        return len(res.data)
