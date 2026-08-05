import sys, os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

import unittest
from unittest.mock import MagicMock, patch
from daos.order_dao import OrderDAO
from daos.fleet_dao import VehicleDAO
from daos.shipment_dao import ShipmentDAO
from controllers.order_manager import OrderManager
from controllers.fleet_manager import FleetManager
from models.order import Order, Cargo
from models.fleet import Vehicle, Shipment, TrackingRecord
from models.enums import OrderStatus, ShipmentStatus
from core.exceptions import NotFoundError, DatabaseConnectionError

class MockResponse:
    def __init__(self, data):
        self.data = data

class TestOrderDAO(unittest.TestCase):
    def test_save_order_calls_db_and_returns_row(self):
        fake_db = MagicMock()
        fake_db.table.return_value.insert.return_value.execute.return_value = MockResponse([{"order_id":"o1","customer_id":"c","status":"PENDING","total_amount":10.0}])
        with patch('daos.order_dao.DatabaseConnection') as DC:
            DC.return_value.get_instance.return_value = fake_db
            dao = OrderDAO()
            o = Order(customer_id="c", items=[Cargo(weight=1, dimensions="1x1x1", type="t")])
            res = dao.save_order(o)
            self.assertEqual(res["order_id"], "o1")

    def test_update_status_true_false(self):
        fake_db = MagicMock()
        fake_db.table.return_value.update.return_value.eq.return_value.execute.return_value = MockResponse([{"order_id":"o1"}])
        with patch('daos.order_dao.DatabaseConnection') as DC:
            DC.return_value.get_instance.return_value = fake_db
            dao = OrderDAO()
            self.assertTrue(dao.update_status("o1", OrderStatus.PROCESSING))

            # simulate no rows updated
            fake_db.table.return_value.update.return_value.eq.return_value.execute.return_value = MockResponse([])
            self.assertFalse(dao.update_status("o1", OrderStatus.PROCESSING))


class TestVehicleDAO(unittest.TestCase):
    def test_get_available_vehicles_returns_parsed_models(self):
        rows = [{"vehicle_id":"v1","registration":"R","capacity_weight":100.0,"is_available":True}]
        fake_db = MagicMock()
        fake_db.table.return_value.select.return_value.eq.return_value.gte.return_value.execute.return_value = MockResponse(rows)
        with patch('daos.fleet_dao.DatabaseConnection') as DC:
            DC.return_value.get_instance.return_value = fake_db
            dao = VehicleDAO()
            res = dao.get_available_vehicles(10.0)
            self.assertIsInstance(res[0], Vehicle)

    def test_get_by_id_not_found_raises(self):
        fake_db = MagicMock()
        fake_db.table.return_value.select.return_value.eq.return_value.execute.return_value = MockResponse([])
        with patch('daos.fleet_dao.DatabaseConnection') as DC:
            DC.return_value.get_instance.return_value = fake_db
            dao = VehicleDAO()
            with self.assertRaises(Exception):
                dao.get_by_id("missing")

class TestShipmentDAO(unittest.TestCase):
    def test_save_shipment_success(self):
        fake_db = MagicMock()
        saved = {"shipment_id":"s1","order_id":"o1","vehicle_id":"v1","driver_id":"d1","status":"ASSIGNED","dispatch_date":"2026-01-01T00:00:00"}
        fake_db.table.return_value.insert.return_value.execute.return_value = MockResponse([saved])
        with patch('daos.shipment_dao.DatabaseConnection') as DC:
            DC.return_value.get_instance.return_value = fake_db
            dao = ShipmentDAO()
            s = Shipment(order_id="o1", vehicle_id="v1", driver_id="d1")
            res = dao.save_shipment(s)
            self.assertEqual(res.shipment_id, "s1")

    def test_update_status_not_found_raises(self):
        fake_db = MagicMock()
        fake_db.table.return_value.update.return_value.eq.return_value.execute.return_value = MockResponse([])
        with patch('daos.shipment_dao.DatabaseConnection') as DC:
            DC.return_value.get_instance.return_value = fake_db
            dao = ShipmentDAO()
            with self.assertRaises(Exception):
                dao.update_shipment_status("nope", ShipmentStatus.IN_TRANSIT)

    def test_normalizes_dispatch_status_on_load(self):
        fake_db = MagicMock()
        row = {
            "shipment_id": "s1",
            "order_id": "o1",
            "vehicle_id": "v1",
            "driver_id": "d1",
            "status": "DISPATCHED",
            "dispatch_date": "2026-01-01T00:00:00",
        }
        fake_db.table.return_value.select.return_value.eq.return_value.execute.return_value = MockResponse([row])
        with patch('daos.shipment_dao.DatabaseConnection') as DC:
            DC.return_value.get_instance.return_value = fake_db
            dao = ShipmentDAO()
            shipment = dao.get_by_order_id("o1")
            self.assertEqual(shipment.status, ShipmentStatus.ASSIGNED)


class TestControllers(unittest.TestCase):
    def test_order_manager_create_order_calls_dao(self):
        with patch('controllers.order_manager.OrderDAO') as MockDAO:
            instance = MockDAO.return_value
            instance.save_order.return_value = {"order_id": "o1"}
            om = OrderManager()
            res = om.create_order("c1", [Cargo(weight=1, dimensions="1x1x1", type="t")])
            instance.save_order.assert_called_once()
            self.assertEqual(res["order_id"], "o1")

    def test_fleet_manager_update_status_generates_tracking_when_success(self):
        with patch('controllers.fleet_manager.ShipmentDAO') as MockDAO:
            inst = MockDAO.return_value
            inst.get_shipment_by_id.return_value = Shipment(order_id="o1", vehicle_id="v1", driver_id="d1", status=ShipmentStatus.ASSIGNED)
            inst.update_shipment_status.return_value = Shipment(shipment_id="s1", order_id="o1", vehicle_id="v1", driver_id="d1", status=ShipmentStatus.IN_TRANSIT)
            inst.add_tracking_record.return_value = TrackingRecord(record_id="r1", shipment_id="s1", current_location="here", description="arrived")
            fm = FleetManager()
            ok = fm.update_status("s1", ShipmentStatus.IN_TRANSIT, "here", "arrived")
            self.assertTrue(ok)
            inst.add_tracking_record.assert_called_once()

if __name__ == "__main__":
    unittest.main()