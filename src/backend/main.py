from fastapi import FastAPI
from routers import auth_routes, order_routes, fleet_routes

app = FastAPI(title="Logistics System API")


# Register Presentation Layer (Routers)
app.include_router(auth_routes.router, prefix="/api")
app.include_router(order_routes.router, prefix="/api")
app.include_router(fleet_routes.router, prefix="/api")

@app.get("/")
def health_check():
    return {"status": "Backend is running!"}