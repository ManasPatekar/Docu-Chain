# backend/database.py

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# Example SQLite URL — replace with PostgreSQL/MySQL in production
SQLALCHEMY_DATABASE_URL = "sqlite:///./backend/docuchain.db"

# If using SQLite, we need this connect_arg
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)

# Create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for all models
Base = declarative_base()
