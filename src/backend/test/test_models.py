import sys, os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

import unittest
from datetime import datetime
from models.order import Cargo, Order
from models.fleet import Shipment
from models.enums import ShipmentStatus


class TestCargoAndOrder(unittest.TestCase):
    def test_dimensions_validator_accepts_and_volume(self):
        c = Cargo(weight=1.5, dimensions="2x3x4", type="box")
        self.assertAlmostEqual(c.calculate_volume(), 24.0)

    def test_dimensions_validator_rejects_bad_format(self):
        with self.assertRaises(ValueError):
            Cargo(weight=1.0, dimensions="2x3", type="box")

        with self.assertRaises(ValueError):
            Cargo(weight=1.0, dimensions="ax3x4", type="box")

    def test_order_calculate_cost_sets_total_amount(self):
        items = [Cargo(weight=1, dimensions="1x2x3", type="box")]
        o = Order(customer_id="cust1", items=items)
        cost = o.calculate_cost()
        self.assertGreater(cost, 0)
        self.assertEqual(o.total_amount, cost)


class TestFleetModels(unittest.TestCase):
    def test_shipment_default_status(self):
        s = Shipment(order_id="o1", vehicle_id="v1", driver_id="d1")
        self.assertEqual(s.status, ShipmentStatus.ASSIGNED)


if __name__ == "__main__":
    unittest.main()