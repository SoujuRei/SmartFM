import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

class DatabaseConnection:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(DatabaseConnection, cls).__new__(cls)
            url: str = os.getenv("SUPABASE_URL")
            key: str = os.getenv("SUPABASE_KEY")
            if not url or not key:
                raise ValueError("Supabase credentials not found in .env")
            cls._instance.client: Client = create_client(url, key)
        return cls._instance

    def get_instance(self) -> Client:
        return self.client