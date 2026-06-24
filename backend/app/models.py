import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, Text, JSON
from sqlalchemy.orm import relationship
from app.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    hashed_password = Column(String, nullable=False)
    plan = Column(String, default="free")
    stripe_customer_id = Column(String, nullable=True)
    google_id = Column(String, nullable=True, unique=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    scan_count = Column(Integer, default=0)
    scan_limit = Column(Integer, default=-1)


class Scan(Base):
    __tablename__ = "scans"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, index=True, nullable=False)
    path = Column(String, nullable=True)
    total_files = Column(Integer, default=0)
    total_folders = Column(Integer, default=0)
    total_size = Column(Integer, default=0)
    duplicates_count = Column(Integer, default=0)
    duplicates_size = Column(Integer, default=0)
    large_files_count = Column(Integer, default=0)
    old_files_count = Column(Integer, default=0)
    categories = Column(Text, default="{}")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))


class ScanFile(Base):
    __tablename__ = "scan_files"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    scan_id = Column(String, index=True, nullable=False)
    name = Column(String, nullable=False)
    path = Column(Text, nullable=False)
    size = Column(Integer, default=0)
    extension = Column(String, nullable=True)
    category = Column(String, nullable=True)
    is_duplicate = Column(Boolean, default=False)
    last_modified = Column(String, nullable=True)


class Duplicate(Base):
    __tablename__ = "duplicates"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    scan_id = Column(String, index=True, nullable=False)
    hash = Column(String, nullable=False)
    file_count = Column(Integer, default=0)
    total_size = Column(Integer, default=0)
    files = Column(Text, default="[]")
