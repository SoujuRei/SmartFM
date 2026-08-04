from core.database import DatabaseConnection

class ReportGenerator:
    def __init__(self):
        self.db = DatabaseConnection().get_instance()

    def generate_revenue_report(self) -> dict:
        # For assignment simplicity, aggregates all completed order totals
        response = self.db.table("orders").select("total_amount").eq("status", "DELIVERED").execute()
        total_revenue = sum(order['total_amount'] for order in response.data)
        
        return {
            "total_delivered_orders": len(response.data),
            "total_revenue": total_revenue
        }