from enum import Enum

class OrderStatus(str, Enum):
    PENDING = "PENDING"
    PROCESSING = "PROCESSING"
    SHIPPED = "SHIPPED"
    DELIVERED = "DELIVERED"
    CANCELLED = "CANCELLED"

class ShipmentStatus(str, Enum):
    DISPATCHED = "DISPATCHED"
    IN_TRANSIT = "IN_TRANSIT"
    ARRIVED = "ARRIVED"
    DELAYED = "DELAYED"