from fastapi import FastAPI, UploadFile, File, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials, OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from sqlalchemy.orm import Session
import os
import requests
from passlib.hash import bcrypt
from fastapi import Form

from backend.models import User
# Local imports
from backend.auth import create_access_token, verify_token, authenticate_user
from backend.dependencies import get_db
import backend.scan as scan
import backend.models
from backend.database import engine

# Load environment variables
load_dotenv()
PINATA_API_KEY = os.getenv("PINATA_API_KEY")
PINATA_SECRET_API_KEY = os.getenv("PINATA_SECRET_API_KEY")

# Initialize FastAPI app
app = FastAPI()

# Allow frontend access (React dev server)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create database tables
backend.models.Base.metadata.create_all(bind=engine)

# HTTP Bearer token security for protected routes
security = HTTPBearer()

# --------------------
# ROUTES
# --------------------

@app.post("/token")
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(status_code=401, detail="Incorrect username or password")
    
    token = create_access_token(data={"sub": user.username, "role": user.role})
    return {"access_token": token, "token_type": "bearer"}


@app.post("/scan")
async def scan_file(
    file: UploadFile = File(...), 
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    verify_token(credentials.credentials)  # JWT verification
    content = await file.read()
    result = scan.check_file(content)
    return result  # ✅ return result directly (must be dict with 'clean' and 'reason')



@app.post("/upload_ipfs")
async def upload_to_ipfs(
    file: UploadFile = File(...),
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    verify_token(credentials.credentials)  # JWT verification

    try:
        url = "https://api.pinata.cloud/pinning/pinFileToIPFS"

        files = {"file": (file.filename, await file.read())}
        headers = {
            "pinata_api_key": PINATA_API_KEY,
            "pinata_secret_api_key": PINATA_SECRET_API_KEY,
        }

        response = requests.post(url, files=files, headers=headers)
        response.raise_for_status()

        ipfs_hash = response.json()["IpfsHash"]
        return {"ipfs_hash": ipfs_hash}
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})

@app.post("/register")
async def register(
    username: str = Form(...),
    email: str = Form(...),
    password: str = Form(...),
    db: Session = Depends(get_db)
):
    existing_user = db.query(User).filter(User.email == email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed_password = bcrypt.hash(password)
    user = User(username=username, email=email, hashed_password=hashed_password)
    db.add(user)
    db.commit()
    db.refresh(user)
    return {"message": "User registered successfully"}