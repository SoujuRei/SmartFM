import sys, os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

import unittest
from pydantic import SecretStr
from models.user import User, Customer

class TestUserModel(unittest.TestCase):
    def test_name_validator_strips_and_rejects_blank(self):
        u = User(name=" Alice ", email="a@example.com", password="x", role="CUSTOMER")
        self.assertEqual(u.name, "Alice")
        with self.assertRaises(ValueError):
            User(name="   ", email="b@example.com", password="x", role="CUSTOMER")

    def test_password_field_excluded_from_model_dump(self):
        u = Customer(name="Joe", email="j@example.com", password="pw", role="CUSTOMER", phone="123456", address="addr")
        dumped = u.model_dump()
        # alias is 'password' but field is excluded from dumps by model config
        self.assertNotIn("password", dumped)
        # underlying attribute stored as SecretStr when accessed via attribute name
        self.assertIsInstance(u.password_hash, SecretStr)

if __name__ == "__main__":
    unittest.main()