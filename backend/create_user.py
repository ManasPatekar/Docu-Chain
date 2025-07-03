# backend/create_user.py
from backend.database import SessionLocal
from backend.models import User
from passlib.context import CryptContext

# Password hasher
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def create_user():
    db = SessionLocal()

    username = "mac"           # 👈 Set your username here
    password = "mac"        # 👈 Set your password here
    role = "admin"               # 👈 Set role (e.g., user/admin)

    hashed_password = pwd_context.hash(password)

    user = User(username=username, hashed_password=hashed_password, role=role)

    db.add(user)
    db.commit()
    db.refresh(user)
    print("✅ User created:", user.username)

if __name__ == "__main__":
    create_user()
