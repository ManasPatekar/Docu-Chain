# backend/check_user.py
from backend.database import SessionLocal
from backend.models import User

db = SessionLocal()

# Replace 'your-username' with the username you created
user = db.query(User).filter(User.username == "your-username").first()

if user:
    print("✅ User found:", user.username)
    print("🔒 Hashed password:", user.hashed_password)
    print("🎓 Role:", user.role)
else:
    print("❌ No user found with that username.")
