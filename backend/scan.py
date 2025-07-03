import hashlib
import json
import sqlite3
import time

import requests
from web3 import Web3

# --- Configuration ---
PINATA_GATEWAY = "https://gateway.pinata.cloud/ipfs/"
INFURA_URL = "http://127.0.0.1:8545"  # Local Hardhat Node
CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3"  # Update if redeployed
ABI_PATH = r"E:\Projects\blockchain\docuchain-prototype\smart-contract\artifacts\contracts\DocVerifier.sol\DocVerifier.json"

# Pinata API
PINATA_API_KEY = 'f42628387e2333d8b49c'
PINATA_SECRET_API_KEY = '4264d05a663196248ee275870b8169cc07b498fe7188e137e13a4ba12d04d923'

# VirusTotal API
VT_API_KEY = "7fe3fe084fc8f5184e6f77d701bf5d96abecc017e20eebe58e7963225a0ba13b"
VT_API_URL = "https://www.virustotal.com/api/v3/files"

# --- Setup ---
w3 = Web3(Web3.HTTPProvider(INFURA_URL))
with open(ABI_PATH, 'r') as abi_file:
    contract_data = json.load(abi_file)
    abi = contract_data["abi"]
contract = w3.eth.contract(address=CONTRACT_ADDRESS, abi=abi)

# --- Database Setup ---
conn = sqlite3.connect("file_hashes.db")
cursor = conn.cursor()
cursor.execute('''CREATE TABLE IF NOT EXISTS scans (
    sha256 TEXT PRIMARY KEY,
    status TEXT,
    cid TEXT,
    verified INTEGER
)''')
conn.commit()

# --- VirusTotal Check ---
def check_virustotal(file_bytes):
    headers = {"x-apikey": VT_API_KEY}
    files = {"file": ("file.pdf", file_bytes)}
    print("\U0001F6A8 Checking with VirusTotal...")
    vt_response = requests.post(VT_API_URL, headers=headers, files=files)
    if vt_response.status_code != 200:
        print("⚠️ VirusTotal upload failed")
        return False
    analysis_id = vt_response.json()["data"]["id"]
    analysis_url = f"https://www.virustotal.com/api/v3/analyses/{analysis_id}"
    for _ in range(10):
        result = requests.get(analysis_url, headers=headers).json()
        if result["data"]["attributes"]["status"] == "completed":
            stats = result["data"]["attributes"]["stats"]
            return stats.get("malicious", 0) > 0 or stats.get("suspicious", 0) > 0
        time.sleep(2)
    return False

# --- Pinata Upload ---
def upload_to_ipfs(file_bytes):
    url = "https://api.pinata.cloud/pinning/pinFileToIPFS"
    headers = {
        'pinata_api_key': PINATA_API_KEY,
        'pinata_secret_api_key': PINATA_SECRET_API_KEY
    }
    files = {'file': ('uploaded.pdf', file_bytes)}
    response = requests.post(url, files=files, headers=headers)
    response.raise_for_status()
    return response.json()["IpfsHash"]

# --- Hash CID ---
def hash_cid(cid):
    return Web3.keccak(text=cid)

# --- Check File ---
def check_file(file_bytes):
    sha256 = hashlib.sha256(file_bytes).hexdigest()
    
    # Check if file has been scanned before
    cursor.execute("SELECT status, cid, verified FROM scans WHERE sha256=?", (sha256,))
    row = cursor.fetchone()
    if row:
        print("♻️ Returning cached result.")
        return {
            "clean": row[0] == "✅ Clean",
            "reason": row[0],
            "cid": row[1],
            "verified": bool(row[2])
        }

    # Check with VirusTotal
    if check_virustotal(file_bytes):
        result = {
            "clean": False,
            "reason": "❌ File flagged as malicious by VirusTotal.",
            "cid": None,
            "verified": False
        }
        cursor.execute("INSERT INTO scans VALUES (?, ?, ?, ?)", (sha256, result["reason"], result["cid"], 0))
        conn.commit()
        return result

    # Upload to IPFS
    cid = upload_to_ipfs(file_bytes)
    doc_hash = hash_cid(cid)

    # Check on blockchain
    is_verified = contract.functions.isDocumentVerified(doc_hash).call()

    # Construct final result
    result = {
        "clean": True,
        "reason": "✅ File is clean and uploaded.",
        "cid": cid,
        "verified": is_verified
    }

    cursor.execute("INSERT INTO scans VALUES (?, ?, ?, ?)", (sha256, result["reason"], result["cid"], int(is_verified)))
    conn.commit()

    return result
