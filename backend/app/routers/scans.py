import json
import os
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, Scan, ScanFile, Duplicate
from app.schemas import ScanRequest, ScanResponse, ScanDetail
from app.auth import get_current_user
from app.scanner import scan_directory

router = APIRouter(prefix="/api/scans", tags=["scans"])


@router.post("/", response_model=ScanResponse)
def create_scan(
    data: ScanRequest,
    user_id: str = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if user.plan != "unlimited" and user.scan_count >= user.scan_limit:
        raise HTTPException(status_code=402, detail="Scan limit reached. Upgrade your plan.")

    scan_path = data.path or os.path.expanduser("~")

    try:
        result = scan_directory(scan_path)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Scan error: {str(e)}")

    scan = Scan(
        user_id=user_id,
        path=scan_path,
        total_files=result["total_files"],
        total_folders=result["total_folders"],
        total_size=result["total_size"],
        duplicates_count=result["duplicates_count"],
        duplicates_size=result["duplicates_size"],
        large_files_count=result["large_files_count"],
        old_files_count=result["old_files_count"],
        categories=result["categories"],
    )
    db.add(scan)
    db.flush()

    for f in result["files"]:
        db.add(ScanFile(scan_id=scan.id, **f))

    for d in result["duplicates"]:
        d["files"] = json.dumps(d["files"])
        db.add(Duplicate(scan_id=scan.id, **d))

    user.scan_count += 1
    db.commit()
    db.refresh(scan)

    return ScanResponse.model_validate(scan)


@router.get("/", response_model=list[ScanResponse])
def list_scans(user_id: str = Depends(get_current_user), db: Session = Depends(get_db)):
    scans = db.query(Scan).filter(Scan.user_id == user_id).order_by(Scan.created_at.desc()).all()
    return [ScanResponse.model_validate(s) for s in scans]


@router.get("/{scan_id}", response_model=ScanDetail)
def get_scan(scan_id: str, user_id: str = Depends(get_current_user), db: Session = Depends(get_db)):
    scan = db.query(Scan).filter(Scan.id == scan_id, Scan.user_id == user_id).first()
    if not scan:
        raise HTTPException(status_code=404, detail="Scan not found")

    files = db.query(ScanFile).filter(ScanFile.scan_id == scan_id).all()
    duplicates = db.query(Duplicate).filter(Duplicate.scan_id == scan_id).all()

    return ScanDetail(
        **ScanResponse.model_validate(scan).model_dump(),
        files=[{"name": f.name, "path": f.path, "size": f.size, "extension": f.extension, "category": f.category, "is_duplicate": f.is_duplicate} for f in files],
        duplicates=[{"id": d.id, "hash": d.hash, "file_count": d.file_count, "total_size": d.total_size, "files": json.loads(d.files)} for d in duplicates],
    )


@router.delete("/{scan_id}")
def delete_scan(scan_id: str, user_id: str = Depends(get_current_user), db: Session = Depends(get_db)):
    scan = db.query(Scan).filter(Scan.id == scan_id, Scan.user_id == user_id).first()
    if not scan:
        raise HTTPException(status_code=404, detail="Scan not found")

    db.query(ScanFile).filter(ScanFile.scan_id == scan_id).delete()
    db.query(Duplicate).filter(Duplicate.scan_id == scan_id).delete()
    db.delete(scan)
    db.commit()

    return {"message": "Scan deleted"}
