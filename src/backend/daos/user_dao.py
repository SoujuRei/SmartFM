from core.database import DatabaseConnection

class UserDAO:
    def __init__(self):
        self.db = DatabaseConnection().get_instance()

    def get_user_by_email(self, email: str) -> dict:
        response = self.db.table("users").select("*").eq("email", email).execute()
        if len(response.data) > 0:
            return response.data[0]
        return None