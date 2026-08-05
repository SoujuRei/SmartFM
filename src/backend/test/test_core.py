import sys, os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

import unittest
from core import security, database
from unittest.mock import patch

class TestSecurity(unittest.TestCase):
    def test_hash_and_verify(self):
        pwd = "supersecret"
        h = security.hash_password(pwd)
        self.assertTrue(security.verify_password(pwd, h))
        self.assertFalse(security.verify_password("wrong", h))


class DummyDatabaseInit:
    def _initialize(self):  # used to patch out real init
        self.client = "dummy-client"
    def get_instance(self):
        return "dummy-client"

class TestDatabaseHelpers(unittest.TestCase):
    def test_mask_short_and_long(self):
        self.assertEqual(database.DatabaseConnection._mask("shorturl"), "shorturl")
        longurl = "https://" + "a"*50
        masked = database.DatabaseConnection._mask(longurl)
        self.assertTrue(masked.endswith("..."))

    def test_singleton_and_patch_initialize(self):
        with patch.object(database.DatabaseConnection, "_initialize", lambda self: setattr(self, "client", "ok")):
            a = database.DatabaseConnection()
            b = database.DatabaseConnection()
            self.assertIs(a, b)
            self.assertEqual(a.get_instance(), a.client)

if __name__ == "__main__":
    unittest.main()