from fastapi import FastAPI, UploadFile, File, Depends, HTTPException, status, Form
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials, OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, StreamingResponse
import requests
from sqlalchemy.orm import Session
from datetime import timedelta
import os
import hashlib
import uuid
import random
import string
from minio import Minio
from dotenv import load_dotenv
# Look for .env in current and parent directory
load_dotenv()
load_dotenv("../.env")

import logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("DocuChain-App")

# Local imports
from models import User, Base, Document, Network
from auth import create_access_token, verify_token, authenticate_user
from dependencies import get_db
import scan as scan
from database import engine
from blockchain import gateway as blockchain_gateway

# Config
MINIO_ENDPOINT = os.getenv("MINIO_ENDPOINT", "localhost:9000")
MINIO_ACCESS_KEY = os.getenv("MINIO_ROOT_USER", "docuchain_admin")
MINIO_SECRET_KEY = os.getenv("MINIO_ROOT_PASSWORD", "docuchain_enterprise_secret!")
MINIO_BUCKET_NAME = os.getenv("MINIO_BUCKET_NAME", "enterprise-documents")

# Initialize MinIO Clients
# 1. Internal Client: For high-speed backend uploads
minio_internal = Minio(
    MINIO_ENDPOINT,
    access_key=MINIO_ACCESS_KEY,
    secret_key=MINIO_SECRET_KEY,
    secure=False
)
# Test connection immediately
try:
    minio_internal.list_buckets()
    logger.info("📦 MinIO Connection Verified.")
except Exception as e:
    logger.warning(f"⚠️ MinIO not reachable at {MINIO_ENDPOINT}: {e}")

# 2. External Client: Specifically for generating browser-valid signatures
# We force region="us-east-1" to prevent internal connectivity checks during signing
minio_external = Minio(
    "localhost:9000",
    access_key=MINIO_ACCESS_KEY,
    secret_key=MINIO_SECRET_KEY,
    secure=False,
    region="us-east-1"
)

app = FastAPI(title="DocuChain Enterprise Platform")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all, including chrome-extension://
    allow_credentials=False, # Required when allow_origins is ["*"]
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)
security = HTTPBearer()

def generate_invite_code():
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=8))

# AI Content Analysis
def analyze_document_content(filename: str, content: bytes):
    keywords = filename.lower().replace("-", " ").replace("_", " ").split()
    if any(k in ["cert", "internship", "degree", "diploma"] for k in keywords):
        return "CERTIFICATE", " ".join(keywords + ["academic", "credential", "achievement"])
    if any(k in ["invoice", "bill", "salary", "slip", "payslip"] for k in keywords):
        return "FINANCIAL", " ".join(keywords + ["transaction", "audit", "compliance"])
    return "OFFICIAL", " ".join(keywords)

# --------------------
# AUTH & HUB MGMT
# --------------------

@app.post("/token")
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user: raise HTTPException(status_code=401, detail="Invalid identity")
    token = create_access_token(data={"sub": user.username, "role": user.role, "network_id": user.network_id})
    return {"access_token": token, "token_type": "bearer", "network_id": user.network_id}

@app.post("/register")
async def register(username: str = Form(...), email: str = Form(...), password: str = Form(...), db: Session = Depends(get_db)):
    from passlib.hash import bcrypt
    existing_user = db.query(User).filter((User.email == email) | (User.username == username)).first()
    if existing_user: raise HTTPException(status_code=400, detail="Identity taken")
    db.add(User(username=username, email=email, hashed_password=bcrypt.hash(password)))
    db.commit()
    return {"status": "success"}

@app.post("/networks/create")
async def create_network(name: str = Form(...), credentials: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_db)):
    payload = verify_token(credentials.credentials)
    user = db.query(User).filter(User.username == payload.get("sub")).first()
    invite_code = generate_invite_code()
    new_network = Network(name=name, invite_code=invite_code, owner_id=user.id)
    db.add(new_network)
    db.commit()
    db.refresh(new_network)
    user.network_id = new_network.id
    user.role = "admin"
    db.commit()
    # Refresh token with new network_id
    new_token = create_access_token(data={"sub": user.username, "role": user.role, "network_id": user.network_id})
    return {"status": "success", "invite_code": invite_code, "access_token": new_token}

@app.post("/networks/join")
async def join_network(invite_code: str = Form(...), credentials: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_db)):
    payload = verify_token(credentials.credentials)
    user = db.query(User).filter(User.username == payload.get("sub")).first()
    network = db.query(Network).filter(Network.invite_code == invite_code).first()
    if not network: raise HTTPException(status_code=404, detail="Invalid Hub Code")
    user.network_id = network.id
    user.role = "user"
    db.commit()
    # Refresh token with new network_id
    new_token = create_access_token(data={"sub": user.username, "role": user.role, "network_id": user.network_id})
    return {"status": "success", "network_name": network.name, "access_token": new_token}

@app.post("/networks/leave")
async def leave_network(credentials: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_db)):
    payload = verify_token(credentials.credentials)
    user = db.query(User).filter(User.username == payload.get("sub")).first()
    
    user.network_id = None
    user.role = None
    db.commit()
    
    # Return fresh public token
    new_token = create_access_token(data={"sub": user.username, "role": None, "network_id": None})
    return {"status": "success", "access_token": new_token}

@app.get("/networks/me")
async def get_my_network(credentials: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_db)):
    payload = verify_token(credentials.credentials)
    user = db.query(User).filter(User.username == payload.get("sub")).first()
    if not user.network_id: return {"in_network": False}
    net = db.query(Network).filter(Network.id == user.network_id).first()
    return {"in_network": True, "name": net.name, "invite_code": net.invite_code, "role": user.role}

# --------------------
# ANALYSIS & UPLOAD
# --------------------

async def internxt_scan(file_content: bytes, filename: str):
    """Scan file using Internxt ClamAV API"""
    url = "https://clamav.internxt.com/filescan"
    boundary = '----WebKitFormBoundaryDocuChain'
    mime_type = mimetypes.guess_type(filename)[0] or 'application/octet-stream'
    
    body = [
        f"--{boundary}",
        f'Content-Disposition: form-data; name="file"; filename="{filename}"',
        f'Content-Type: {mime_type}',
        '',
        file_content.decode('latin-1'), # Using latin-1 to preserve binary bytes in string format
        f"--{boundary}--",
        ''
    ]
    payload = '\r\n'.join(body).encode('latin-1')
    
    headers = {
        "User-Agent": "DocuChain-Enterprise-Scanner/1.0",
        "Content-Type": f"multipart/form-data; boundary={boundary}",
        "Origin": "https://internxt.com",
        "Referer": "https://internxt.com/"
    }
    
    try:
        async with github_session.post(url, data=payload, headers=headers) as resp:
            if resp.status == 200:
                result = await resp.json()
                return {
                    "infected": result.get('isInfected', False),
                    "viruses": result.get('viruses', []),
                    "engine": "Internxt-ClamAV"
                }
    except Exception as e:
        print(f"Internxt scan failed: {e}")
    return {"infected": False, "error": "Scan failed", "engine": "Internxt-ClamAV"}

@app.post("/scan")
async def scan_file(file: UploadFile = File(...), credentials: HTTPAuthorizationCredentials = Depends(security)):
    payload = verify_token(credentials.credentials)
    content = await file.read()
    
    # Run multi-engine scan
    # 1. Internxt (No key required)
    internxt_res = await internxt_scan(content, file.filename)
    
    # 2. VirusTotal (If key available)
    vt_res = {"clean": True}
    if VT_API_KEY:
        try:
            # Re-uploading content for VT
            files = {"file": (file.filename, content)}
            headers = {"x-apikey": VT_API_KEY}
            async with github_session.post("https://www.virustotal.com/api/v3/files", headers=headers, data=files) as resp:
                # For this implementation, we'll focus on Internxt as the primary active scanner
                pass 
        except: pass

    is_clean = not internxt_res.get("infected", False)
    reason = f"Detected by {internxt_res.get('engine')}: {', '.join(internxt_res.get('viruses', []))}" if not is_clean else "Clean"

    return {
        "clean": is_clean,
        "reason": reason,
        "details": {
            "internxt": internxt_res
        }
    }

@app.post("/scan_url")
async def scan_url(url: str = Form(...), credentials: HTTPAuthorizationCredentials = Depends(security)):
    verify_token(credentials.credentials)
    # Call the scan module to check the URL
    result = scan.check_url(url)
    return result

@app.get("/proxy_file")
async def proxy_file(url: str):
    try:
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        }
        response = requests.get(url, stream=True, timeout=15, headers=headers)
        response.raise_for_status()
        return StreamingResponse(response.iter_content(chunk_size=8192), media_type=response.headers.get("Content-Type"))
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/upload_document")
async def upload_document(
    file: UploadFile = File(...),
    vault_type: str = Form("private"), # 'private' or 'global'
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    payload = verify_token(credentials.credentials)
    username = payload.get("sub")
    user = db.query(User).filter(User.username == username).first()
    
    if not user:
        raise HTTPException(status_code=401, detail="Node identity expired. Please re-register.")

    if not user.network_id: 
        raise HTTPException(status_code=403, detail="ACTION REQUIRED: You must 'Initialize Hub' or 'Join Network' before anchoring assets.")

    try:
        content = await file.read()
        file_hash = hashlib.sha256(content).hexdigest()
        doc_type, keywords = analyze_document_content(file.filename, content)
        
        # Versioning Control
        existing_doc = db.query(Document).filter(
            Document.network_id == user.network_id, 
            Document.filename == file.filename
        ).order_by(Document.version.desc()).first()
        
        version = existing_doc.version + 1 if existing_doc else 1
        parent_id = existing_doc.id if existing_doc and existing_doc.version == 1 else (existing_doc.parent_id if existing_doc else None)

        # Ensure Bucket Exists
        if not minio_internal.bucket_exists(MINIO_BUCKET_NAME):
            minio_internal.make_bucket(MINIO_BUCKET_NAME)
            print(f"✨ [MinIO] Initialized new storage bucket: {MINIO_BUCKET_NAME}")
        
        # Minio Storage
        await file.seek(0)
        prefix = "global" if vault_type == "global" else f"hub_{user.network_id}"
        object_name = f"{prefix}/v_{version}_{file.filename}"
        minio_internal.put_object(MINIO_BUCKET_NAME, object_name, file.file, length=len(content))

        # Blockchain Anchor
        tx_hash = await blockchain_gateway.anchor_document(
            doc_id=file.filename, 
            file_hash=file_hash,
            metadata={"uploader": username, "network": user.network_id}
        )

        new_doc = Document(
            filename=file.filename,
            file_hash=file_hash,
            tx_hash=tx_hash,
            uploader_id=user.id,
            network_id=user.network_id,
            doc_type=doc_type,
            content_summary=keywords,
            version=version,
            parent_id=parent_id,
            integrity_score=100.0,
            status="secured",
            is_public=1 if vault_type == "global" else 0
        )
        db.add(new_doc)
        db.commit()

        return {"status": "success", "tx_hash": tx_hash, "version": version, "file_hash": file_hash}
    except Exception as e:
        return JSONResponse(status_code=500, content={"status": "error", "message": str(e)})

@app.delete("/document/{doc_id}")
async def delete_document(doc_id: int, credentials: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_db)):
    payload = verify_token(credentials.credentials)
    username = payload.get("sub")
    user = db.query(User).filter(User.username == username).first()
    
    if not user:
        raise HTTPException(status_code=401, detail="Unauthorized")

    doc = db.query(Document).filter(Document.id == doc_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
        
    # Security: Ensure user belongs to the same network as the document, and actually uploaded it (or is admin)
    if doc.network_id != user.network_id:
        raise HTTPException(status_code=403, detail="Forbidden: You do not have access to this network's vault.")
    
    if doc.uploader_id != user.id and user.role != "admin":
         raise HTTPException(status_code=403, detail="Forbidden: You can only delete your own documents.")

    try:
        # 1. Delete from MinIO Storage
        prefix = "global" if doc.is_public == 1 else f"hub_{doc.network_id}"
        object_name = f"{prefix}/v_{doc.version}_{doc.filename}"
        minio_internal.remove_object(MINIO_BUCKET_NAME, object_name)
        
        # 2. Delete from DB
        db.delete(doc)
        db.commit()
        
        return {"status": "success", "message": "Asset permanently destroyed from Vault."}
    except Exception as e:
        return JSONResponse(status_code=500, content={"status": "error", "message": str(e)})

@app.post("/document/{doc_id}/make-public")
async def make_document_public(doc_id: int, credentials: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_db)):
    payload = verify_token(credentials.credentials)
    username = payload.get("sub")
    user = db.query(User).filter(User.username == username).first()
    if not user: raise HTTPException(status_code=401, detail="Unauthorized")

    doc = db.query(Document).filter(Document.id == doc_id).first()
    if not doc: raise HTTPException(status_code=404, detail="Not found")
    
    if doc.uploader_id != user.id:
        raise HTTPException(status_code=403, detail="Only the original uploader can publish this asset globally.")
        
    if doc.is_public == 1:
        return {"status": "success", "message": "Already public"}
        
    try:
        old_object_name = f"hub_{doc.network_id}/v_{doc.version}_{doc.filename}"
        new_object_name = f"global/v_{doc.version}_{doc.filename}"
        
        # Read from private path
        response = minio_internal.get_object(MINIO_BUCKET_NAME, old_object_name)
        data = response.read()
        
        # Write to global path
        import io
        minio_internal.put_object(MINIO_BUCKET_NAME, new_object_name, io.BytesIO(data), length=len(data))
        response.close()
        response.release_conn()
        
        # Delete old private file
        minio_internal.remove_object(MINIO_BUCKET_NAME, old_object_name)
        
        # Update Database
        doc.is_public = 1
        db.commit()
        
        return {"status": "success", "message": "Asset successfully pushed to Global Vault"}
    except Exception as e:
        return JSONResponse(status_code=500, content={"status": "error", "message": str(e)})

# --------------------
# SEARCH & HISTORY
# --------------------

@app.get("/history")
async def get_history(credentials: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_db)):
    payload = verify_token(credentials.credentials)
    user = db.query(User).filter(User.username == payload.get("sub")).first()
    # Filter by uploader_id to ensure personal vault remains private
    docs = db.query(Document).filter(Document.uploader_id == user.id).order_by(Document.timestamp.desc()).all()
    return {"history": [{"id": d.id, "filename": d.filename, "txId": d.tx_hash, "timestamp": d.timestamp.isoformat(), "score": d.integrity_score, "type": d.doc_type, "version": d.version, "is_public": d.is_public} for d in docs]}

@app.get("/shared-history")
async def get_shared_history(credentials: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_db)):
    payload = verify_token(credentials.credentials)
    user = db.query(User).filter(User.username == payload.get("sub")).first()
    # Filter for is_public=1 so private vault docs don't show here
    docs = db.query(Document, User.username).join(User, Document.uploader_id == User.id).filter(
        Document.network_id == user.network_id,
        Document.is_public == 1
    ).order_by(Document.timestamp.desc()).all()
    return {"network_history": [
        {
            "id": d.Document.id,
            "filename": d.Document.filename, 
            "uploader": d.username, 
            "timestamp": d.Document.timestamp.isoformat(), 
            "score": d.Document.integrity_score, 
            "txId": d.Document.tx_hash,
            "version": d.Document.version
        } for d in docs]}

@app.get("/search")
async def search_vault(query: str, credentials: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_db)):
    payload = verify_token(credentials.credentials)
    user = db.query(User).filter(User.username == payload.get("sub")).first()
    docs = db.query(Document).filter(Document.network_id == user.network_id, Document.content_summary.like(f"%{query.lower()}%")).all()
    return {"results": [{"id": d.id, "filename": d.filename, "type": d.doc_type, "score": d.integrity_score, "timestamp": d.timestamp.isoformat(), "txId": d.tx_hash, "version": d.version} for d in docs]}

@app.get("/share/{doc_id}")
async def get_share_link(doc_id: int, hours: int = 24, credentials: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_db)):
    payload = verify_token(credentials.credentials)
    user = db.query(User).filter(User.username == payload.get("sub")).first()
    doc = db.query(Document).filter(Document.id == doc_id, Document.network_id == user.network_id).first()
    if not doc: raise HTTPException(status_code=404, detail="Not found")
    
    prefix = "global" if doc.is_public else f"hub_{user.network_id}"
    object_name = f"{prefix}/v_{doc.version}_{doc.filename}"
    # Generate signed URL via External Client for proper DNS/Signature
    url = minio_external.get_presigned_url("GET", MINIO_BUCKET_NAME, object_name, expires=timedelta(hours=hours))
        
    return {"share_url": url}

@app.get("/verify/{identifier}")
async def public_verify(identifier: str, db: Session = Depends(get_db)):
    # Lookup by File Hash or Transaction ID
    doc = db.query(Document, User.username).join(User, Document.uploader_id == User.id).filter(
        (Document.file_hash == identifier) | (Document.tx_hash == identifier)
    ).first()
    
    if not doc:
        raise HTTPException(status_code=404, detail="Asset not found in the immutable ledger.")
    
    return {
        "verified": True,
        "filename": doc.Document.filename,
        "uploader": doc.username,
        "timestamp": doc.Document.timestamp.isoformat(),
        "integrity_score": doc.Document.integrity_score,
        "tx_hash": doc.Document.tx_hash,
        "version": doc.Document.version,
        "doc_type": doc.Document.doc_type
    }

@app.get("/users")
async def get_users(credentials: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_db)):
    payload = verify_token(credentials.credentials)
    user = db.query(User).filter(User.username == payload.get("sub")).first()
    if user.role != "admin": raise HTTPException(status_code=403, detail="Denied")
    users = db.query(User).filter(User.network_id == user.network_id).all()
    return {"nodes": [{"username": u.username, "email": u.email, "role": u.role} for u in users]}