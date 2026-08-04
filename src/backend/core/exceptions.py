class AppError(Exception):
    """Base class for all application-raised errors."""


class DatabaseConfigError(AppError):
    """Raised when required DB configuration (env vars) is missing/invalid."""


class DatabaseConnectionError(AppError):
    """Raised when the Supabase client fails to initialize or connect."""


class NotFoundError(AppError):
    """Raised by a DAO/manager when a requested entity does not exist."""


class AuthenticationError(AppError):
    """Raised when credentials are missing, malformed, or don't match."""


class ValidationError(AppError):
    """Raised for business-rule validation failures (distinct from Pydantic's)."""