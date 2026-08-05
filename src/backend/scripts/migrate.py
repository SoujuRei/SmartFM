import os
import bcrypt
import psycopg2
from psycopg2.extras import RealDictCursor
from dotenv import load_dotenv




DATABASE_URL = "postgresql://postgres:TnxOjdTTYYdCh3sC@db.upsxxrrajlciuhcwqbjf.supabase.co:5432/postgres"



def is_bcrypt_hash(value: str) -> bool:
    """
    Detect existing bcrypt hashes.
    bcrypt hashes start with:
    $2a$
    $2b$
    $2y$
    """
    return (
        value.startswith("$2a$")
        or value.startswith("$2b$")
        or value.startswith("$2y$")
    )


def hash_password(password: str) -> str:
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(
        password.encode("utf-8"),
        salt
    )
    return hashed.decode("utf-8")


def main():

    if not DATABASE_URL:
        raise RuntimeError(
            "DATABASE_URL environment variable is missing"
        )

    conn = psycopg2.connect(DATABASE_URL)

    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:

            cur.execute(
                """
                SELECT id, email, password
                FROM users
                """
            )

            users = cur.fetchall()

            updated = 0
            skipped = 0

            for user in users:

                current_password = user["password"]

                if is_bcrypt_hash(current_password):
                    print(
                        f"SKIP {user['email']} - already hashed"
                    )
                    skipped += 1
                    continue


                hashed_password = hash_password(
                    current_password
                )

                cur.execute(
                    """
                    UPDATE users
                    SET password = %s
                    WHERE id = %s
                    """,
                    (
                        hashed_password,
                        user["id"]
                    )
                )

                print(
                    f"UPDATED {user['email']}"
                )

                updated += 1


            conn.commit()

            print("\nFinished")
            print(f"Updated: {updated}")
            print(f"Skipped: {skipped}")


    except Exception:
        conn.rollback()
        raise

    finally:
        conn.close()


if __name__ == "__main__":
    main()