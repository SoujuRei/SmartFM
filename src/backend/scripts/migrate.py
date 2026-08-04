"""
scripts/migrate_passwords_to_bcrypt.py

One-off migration: hashes any plaintext passwords still stored in the
`users` table. Safe to re-run -- rows that already look like a bcrypt hash
($2b$/$2a$ prefix) are skipped, so running it twice does no harm.

BEFORE RUNNING: back up the `users` table (Supabase dashboard -> Table
Editor -> Export, or a SQL dump). "This replaces plaintext passwords in the password column with bcrypt password hashes."

Run once, from the project root:
    python -m scripts.migrate_passwords_to_bcrypt

After this runs successfully and you've verified login still works, any
NEW user-creation code path (signup, seeding, admin creation) must call
core.security.hash_password() before inserting -- this script only fixes
existing rows, it doesn't change how new ones are written.
"""

import logging

from core.database import DatabaseConnection
from core.security import hash_password

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def _looks_hashed(password: str) -> bool:
    return password.startswith("$2b$") or password.startswith("$2a$")


def migrate() -> None:
    db = DatabaseConnection().get_instance()
    response = db.table("users").select("id", "password").execute()
    rows = response.data or []

    migrated = 0
    skipped = 0

    for row in rows:
        if _looks_hashed(row["password"]):
            skipped += 1
            continue
        try:
            new_hash = hash_password(row["password"])
        except ValueError:
            logger.warning(
            "Skipping user %s: password exceeds bcrypt limit",
            row["id"]
            )
        continue
    db.table("users").update({"password": new_hash}).eq("id", row["id"]).execute()
    migrated += 1

    logger.info(
        "Password migration complete: %d migrated, %d already hashed",
        migrated, skipped,
    )


if __name__ == "__main__":
    migrate()