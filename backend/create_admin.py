import argparse
import sys
import getpass
from app.database import SessionLocal
from app.models.admin import Admin
from app.core.security import hash_password


def create_admin(username: str, email: str, password: str, full_name: str) -> None:
    db = SessionLocal()
    try:
        existing = db.query(Admin).filter(
            (Admin.username == username) | (Admin.email == email)
        ).first()

        if existing:
            if existing.username == username:
                print(f"Error: Admin with username '{username}' already exists.")
            else:
                print(f"Error: Admin with email '{email}' already exists.")
            sys.exit(1)

        new_admin = Admin(
            full_name=full_name,
            username=username,
            email=email,
            password_hash=hash_password(password),
            is_active=True
        )
        db.add(new_admin)
        db.commit()
        db.refresh(new_admin)
        print(f"Admin '{username}' (ID: {new_admin.admin_id}) created successfully!")
    finally:
        db.close()


def main():
    parser = argparse.ArgumentParser(description="Create a secure Admin account")
    parser.add_argument("--username", help="Admin username")
    parser.add_argument("--email", help="Admin email")
    parser.add_argument("--password", help="Admin password")
    parser.add_argument("--name", help="Admin full name")

    args = parser.parse_args()

    username = args.username
    email = args.email
    password = args.password
    full_name = args.name

    if not username:
        username = input("Enter admin username: ").strip()
    if not email:
        email = input("Enter admin email: ").strip()
    if not full_name:
        full_name = input("Enter admin full name: ").strip()
    if not password:
        password = getpass.getpass("Enter admin password: ")

    if not username or not email or not password or not full_name:
        print("Error: All fields (username, email, password, full_name) are required.")
        sys.exit(1)

    create_admin(username, email, password, full_name)


if __name__ == "__main__":
    main()

