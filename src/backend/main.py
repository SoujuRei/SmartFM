import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import (
    auth_routes,
    order_routes,
    fleet_routes,
    driver_routes,
    shipments_routes,
    payments_routes,
    report_routes
)

app = FastAPI(title="SmartFM API")

cors_origins = [
    origin.strip() for origin in os.getenv(
        "CORS_ORIGINS",
        "http://localhost:5173,http://127.0.0.1:5173",
    ).split(",") if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Register Presentation Layer (Routers)
app.include_router(auth_routes.router, prefix="/api")
app.include_router(order_routes.router, prefix="/api")
app.include_router(fleet_routes.router, prefix="/api")
app.include_router(driver_routes.router, prefix="/api")
app.include_router(report_routes.router,prefix="/api",)
app.include_router(shipments_routes.router, prefix="/api")
app.include_router(payments_routes.router, prefix="/api")


@app.get("/")
def health_check():
    return {"status": "Backend is running!"}