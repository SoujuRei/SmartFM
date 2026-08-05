import logging

from core.database import DatabaseConnection
from core.exceptions import DatabaseConnectionError, NotFoundError
from models.invoice import Invoice

logger = logging.getLogger(__name__)


class InvoiceDAO:

    def __init__(self):
        self.db = DatabaseConnection().get_instance()

    def save_invoice(self, invoice: Invoice) -> Invoice:

        data = invoice.model_dump(exclude={"invoice_id"})
        data["issue_date"] = invoice.issue_date.isoformat()

        try:
            response = (
                self.db
                .table("invoices")
                .insert(data)
                .execute()
            )

        except Exception as exc:
            logger.exception("Invoice insert failed")
            raise DatabaseConnectionError(
                f"Invoice insert failed: {exc}"
            ) from exc

        if not response.data:
            raise DatabaseConnectionError(
                "Invoice insert returned no data"
            )

        return Invoice(**response.data[0])

    def get_invoice_by_order(
        self,
        order_id: str
    ) -> Invoice:

        try:
            response = (
                self.db
                .table("invoices")
                .select("*")
                .eq("order_id", order_id)
                .execute()
            )

        except Exception as exc:
            logger.exception("Invoice lookup failed")
            raise DatabaseConnectionError(
                f"Invoice lookup failed: {exc}"
            ) from exc

        if not response.data:
            raise NotFoundError(
                f"Invoice for order {order_id} not found"
            )

        return Invoice(**response.data[0])

    def delete_invoice_by_order_id(self, order_id: str) -> int:
        try:
            response = (
                self.db
                .table("invoices")
                .delete()
                .eq("order_id", order_id)
                .execute()
            )
        except Exception as exc:
            logger.exception("Invoice delete failed for order_id=%s", order_id)
            raise DatabaseConnectionError(
                f"Invoice delete failed: {exc}"
            ) from exc

        return len(response.data)

    def mark_unpaid(
        self,
        order_id: str
    ) -> Invoice:

        try:
            response = (
                self.db
                .table("invoices")
                .update(
                    {
                        "is_paid": False
                    }
                )
                .eq("order_id", order_id)
                .execute()
            )
        except Exception as exc:
            logger.exception("Invoice unpaid update failed")
            raise DatabaseConnectionError(
                f"Invoice update failed: {exc}"
            ) from exc

        if not response.data:
            raise NotFoundError(
                f"Invoice for order {order_id} not found"
            )

        return Invoice(**response.data[0])

    def mark_paid(
        self,
        order_id: str
    ) -> Invoice:

        try:
            response = (
                self.db
                .table("invoices")
                .update(
                    {
                        "is_paid": True
                    }
                )
                .eq("order_id", order_id)
                .execute()
            )

        except Exception as exc:
            logger.exception("Invoice payment update failed")
            raise DatabaseConnectionError(
                f"Invoice update failed: {exc}"
            ) from exc

        if not response.data:
            raise NotFoundError(
                f"Invoice for order {order_id} not found"
            )

        return Invoice(**response.data[0])