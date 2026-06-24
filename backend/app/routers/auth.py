import requests
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User
from app.schemas import UserCreate, UserLogin, UserResponse, Token, GoogleAuth
from app.auth import hash_password, verify_password, create_token, get_current_user

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/register", response_model=Token)
def register(data: UserCreate, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == data.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    user = User(
        email=data.email,
        name=data.name,
        hashed_password=hash_password(data.password),
        plan="free",
        scan_limit=-1,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_token(user.id)
    return Token(access_token=token, user=UserResponse.model_validate(user))


@router.post("/login", response_model=Token)
def login(data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email).first()
    if not user or not verify_password(data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_token(user.id)
    return Token(access_token=token, user=UserResponse.model_validate(user))


@router.get("/me", response_model=UserResponse)
def get_me(user_id: str = Depends(get_current_user), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return UserResponse.model_validate(user)


import os
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID", "")
GITHUB_CLIENT_ID = os.getenv("GITHUB_CLIENT_ID", "")
GITHUB_CLIENT_SECRET = os.getenv("GITHUB_CLIENT_SECRET", "")


@router.get("/github")
def github_login():
    if not GITHUB_CLIENT_ID:
        raise HTTPException(status_code=400, detail="GitHub login not configured")
    return {
        "url": f"https://github.com/login/oauth/authorize?client_id={GITHUB_CLIENT_ID}&redirect_uri=https://cleanpc.onrender.com/api/auth/github/callback&scope=user:email"
    }


@router.get("/github/callback")
def github_callback(code: str, db: Session = Depends(get_db)):
    try:
        resp = requests.post(
            "https://github.com/login/oauth/access_token",
            data={
                "client_id": GITHUB_CLIENT_ID,
                "client_secret": GITHUB_CLIENT_SECRET,
                "code": code,
            },
            headers={"Accept": "application/json"},
        )
        token_data = resp.json()
        access_token = token_data.get("access_token")
        if not access_token:
            raise HTTPException(status_code=400, detail="GitHub auth failed")

        user_resp = requests.get(
            "https://api.github.com/user",
            headers={"Authorization": f"Bearer {access_token}"},
        )
        user_info = user_resp.json()
        email = user_info.get("email") or f"{user_info['login']}@github.com"
        name = user_info.get("name") or user_info["login"]

        user = db.query(User).filter(User.email == email).first()
        if not user:
            user = User(
                email=email,
                name=name,
                hashed_password="",
                plan="free",
                scan_limit=-1,
            )
            db.add(user)
            db.commit()
            db.refresh(user)

        token = create_token(user.id)
        html = f"""<!DOCTYPE html><html><body>
<script>
  localStorage.setItem('token', '{token}');
  window.location.href = 'https://cleanpc.onrender.com/app';
</script></body></html>"""
        from fastapi.responses import HTMLResponse
        return HTMLResponse(html)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/google", response_model=Token)
def google_auth(data: GoogleAuth, db: Session = Depends(get_db)):
    if not GOOGLE_CLIENT_ID:
        raise HTTPException(status_code=400, detail="Google login not configured")
    try:
        resp = requests.get(
            f"https://oauth2.googleapis.com/tokeninfo?id_token={data.credential}",
            timeout=10,
        )
        info = resp.json()
        if info.get("error"):
            raise HTTPException(status_code=401, detail="Invalid Google token")

        email = info["email"]
        name = info.get("name", email.split("@")[0])
        user = db.query(User).filter(User.email == email).first()

        if not user:
            user = User(
                email=email,
                name=name,
                hashed_password="",
                plan="free",
                scan_limit=-1,
                google_id=info.get("sub"),
            )
            db.add(user)
            db.commit()
            db.refresh(user)
        elif not user.google_id:
            user.google_id = info.get("sub")
            db.commit()

        token = create_token(user.id)
        return Token(access_token=token, user=UserResponse.model_validate(user))
    except requests.RequestException:
        raise HTTPException(status_code=400, detail="Failed to verify Google token")
