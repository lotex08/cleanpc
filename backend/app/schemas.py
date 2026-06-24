from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


class UserCreate(BaseModel):
    email: str
    password: str
    name: str


class UserLogin(BaseModel):
    email: str
    password: str


class UserResponse(BaseModel):
    id: str
    email: str
    name: str
    plan: str
    scan_count: int
    scan_limit: int
    created_at: datetime

    model_config = {"from_attributes": True}


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class ScanRequest(BaseModel):
    path: Optional[str] = None


class ScanResponse(BaseModel):
    id: str
    total_files: int
    total_folders: int
    total_size: int
    duplicates_count: int
    duplicates_size: int
    large_files_count: int
    old_files_count: int
    categories: str
    created_at: datetime

    model_config = {"from_attributes": True}


class ScanDetail(ScanResponse):
    files: list = []
    duplicates: list = []


class PlanChange(BaseModel):
    plan: str
    payment_method_id: Optional[str] = None
