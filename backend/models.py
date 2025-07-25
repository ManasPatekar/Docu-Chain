# backend/models.py

from sqlalchemy import Column, Integer, String
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)  # ✅ Add this
    hashed_password = Column(String, nullable=False)
    role = Column(String, default="user")  # e.g., admin, user, auditor
