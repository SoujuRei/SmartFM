import os
import logging
import threading
from typing import Optional
from pathlib import Path

from supabase import create_client, Client
from dotenv import load_dotenv
from core.exceptions import DatabaseConfigError, DatabaseConnectionError

BACKEND_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BACKEND_DIR / ".env")

logger = logging.getLogger(__name__)


class DatabaseConnection:
    _instance: Optional["DatabaseConnection"] = None
    _lock: threading.Lock = threading.Lock()

    def __new__(cls) -> "DatabaseConnection":
        if cls._instance is None:
            with cls._lock:
                if cls._instance is None:
                    instance = super(DatabaseConnection, cls).__new__(cls)
                    instance._initialize()
                    cls._instance = instance
        return cls._instance

    def _initialize(self) -> None:
        url: str = os.getenv("SUPABASE_URL")
        key: str = os.getenv("SUPABASE_KEY")

        if not url or not key:
            raise DatabaseConfigError("Supabase credentials not found in .env")

        try:
            self.client: Client = create_client(url, key)
        except Exception as exc:
            logger.exception("Failed to create Supabase client")
            raise DatabaseConnectionError(f"Could not connect to Supabase: {exc}") from exc

        logger.info("DatabaseConnection initialized (%s)", self._mask(url))

    def get_instance(self) -> Client:
        return self.client

    @staticmethod
    def _mask(url: str) -> str:
        return url[:20] + "..." if len(url) > 20 else url