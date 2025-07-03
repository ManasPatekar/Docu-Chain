# DocuChain - Project Report & GitHub README

## 🌐 Project Title

**DocuChain: Decentralized Document Verification & Malware Scanning System**

---

## 🎓 Abstract

DocuChain is a secure and decentralized document verification system that enables users to scan, upload, and verify files using malware detection, IPFS for decentralized storage, and Ethereum smart contracts for on-chain verification. This ensures integrity, ownership, and transparency of document handling in digital workflows.

---

## 🚀 Key Features

### 🔑 JWT Authentication

* Secure login/register system using JSON Web Tokens
* Role-based payload with token expiry

### 🛡️ Malware Scanning (Local/Custom or Extendable to VirusTotal)

* Documents scanned for potential threats before upload
* If clean, they proceed to IPFS

### 📎 IPFS Storage (via Pinata)

* Decentralized, immutable storage of verified files
* Returns CID (Content Identifier) and IPFS URL

### 📈 Smart Contract Verification

* Document CID is verified on the Ethereum blockchain
* Ensures timestamped, trustless verification

### 📄 Dashboard UI (React + TailwindCSS)

* Intuitive interface for upload, feedback, and verification status
* Connects MetaMask for wallet-based verification

---

## 📁 Tech Stack

| Layer      | Technology                    |
| ---------- | ----------------------------- |
| Frontend   | React, TailwindCSS, Axios     |
| Backend    | FastAPI, SQLAlchemy, JWT      |
| Database   | SQLite                        |
| Blockchain | Ethers.js, MetaMask, Solidity |
| IPFS       | Pinata API                    |

---

## 📅 Project Structure

```
docuchain-prototype/
├── backend/
│   ├── app.py
│   ├── auth.py
│   ├── models.py
│   ├── database.py
│   ├── dependencies.py
│   ├── scan.py
├── frontend/
│   ├── src/
│   │   ├── pages/Upload.jsx
│   │   ├── pages/Login.jsx
│   │   ├── utils/
│   │   │   ├── connectWallet.js
│   │   │   ├── verify.js
├── .env
```

---

## 🔧 Setup Instructions

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate # or venv\Scripts\activate
pip install -r requirements.txt
uvicorn app:app --reload
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### .env File (Backend)

```
PINATA_API_KEY=your_pinata_key
PINATA_SECRET_API_KEY=your_pinata_secret
SECRET_KEY=your_jwt_secret_key
```

---

## 🤔 Use Cases

| Sector      | Purpose                              |
| ----------- | ------------------------------------ |
| Education   | Tamper-proof certificates & resumes  |
| Legal       | Proof of contract & ownership        |
| Government  | Secure citizen document submission   |
| Freelancers | Contract timestamping & authenticity |

---

## 🔎 Sample Workflow

1. User logs in → Receives JWT
2. Selects file to upload
3. File scanned for malware
4. If clean → uploaded to IPFS
5. MetaMask wallet prompts to verify document on-chain
6. CID + TX hash confirmed and shown in UI

---

## ✨ Contribution
-[Sakshee] (https://github.com/saksheepawar24) 

