from core.database import DatabaseConnection
from core.exceptions import DatabaseConnectionError
from models.order import Cargo
from typing import List
import logging

logger = logging.getLogger(__name__)


class CargoDAO:
    def __init__(self):
        self.db = DatabaseConnection().get_instance()

    def save_cargo_items(self, order_id: str, items: List[Cargo]) -> List[Cargo]:
        saved = []
        for item in items:
            data = {
                "order_id": order_id,
                "weight": item.weight,
                "dimensions": item.dimensions,
                "cargo_type": item.type,
            }
            try:
                res = self.db.table("cargo").insert(data).execute()
            except Exception as exc:
                logger.exception("Failed to insert cargo item for order=%s", order_id)
                raise DatabaseConnectionError(f"Cargo insert failed: {exc}") from exc

            if not res.data:
                raise DatabaseConnectionError("Cargo insert returned no data")

            row = res.data[0]
            saved.append(
                Cargo(
                    cargo_id=row.get("cargo_id"),
                    weight=row.get("weight"),
                    dimensions=row.get("dimensions"),
                    type=row.get("cargo_type"),
                )
            )

        return saved

    def get_cargo_by_order_id(self, order_id: str) -> List[Cargo]:
        try:
            res = (
                self.db.table("cargo").select("*").eq("order_id", order_id).execute()
            )
        except Exception as exc:
            logger.exception("Failed to fetch cargo for order=%s", order_id)
            raise DatabaseConnectionError(f"Cargo lookup failed: {exc}") from exc

        return [
        Cargo(
            cargo_id=row["cargo_id"],
            weight=row["weight"],
            dimensions=row["dimensions"],
            type=row["cargo_type"]
        )
        for row in res.data
]

    def delete_cargo_by_order_id(self, order_id: str) -> int:
        try:
            res = (
                self.db.table("cargo")
                .delete()
                .eq("order_id", order_id)
                .execute()
            )
        except Exception as exc:
            logger.exception("Failed deleting cargo for order=%s", order_id)
            raise DatabaseConnectionError(f"Cargo delete failed: {exc}") from exc

        return len(res.data)
