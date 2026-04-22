from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base

class Network(Base):
    __tablename__ = "networks"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)
    invite_code = Column(String(8), unique=True, index=True, nullable=False)
    owner_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    members = relationship("User", back_populates="network", foreign_keys="User.network_id")
    documents = relationship("Document", back_populates="network")

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, default="user")
    network_id = Column(Integer, ForeignKey("networks.id"), nullable=True)
    
    network = relationship("Network", back_populates="members", foreign_keys=[network_id])

class Document(Base):
    __tablename__ = "documents"
    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String, nullable=False)
    file_hash = Column(String, index=True, nullable=False)
    tx_hash = Column(String, unique=True, nullable=True)
    uploader_id = Column(Integer, ForeignKey("users.id"))
    network_id = Column(Integer, ForeignKey("networks.id"))
    
    # AI Search & Metadata
    content_summary = Column(Text, nullable=True) # Extracted keywords for AI search
    doc_type = Column(String, nullable=True) # e.g., 'Certificate', 'Invoice', 'ID'
    
    # Versioning
    version = Column(Integer, default=1)
    parent_id = Column(Integer, ForeignKey("documents.id"), nullable=True) # Links to v1, v2, etc.
    
    integrity_score = Column(Float, default=100.0)
    status = Column(String, default="secured")
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    is_public = Column(Integer, default=1)
    
    network = relationship("Network", back_populates="documents")
