# Standard Operating Procedure (SOP): DocuChain Protocol

## 1. Project Overview
DocuChain is a decentralized enterprise document verification system that combines **AI-driven malware analysis** with **Hyperledger Fabric enterprise blockchain anchoring** and **MinIO secure private object storage**.

---

## 2. Manual Execution Guide
To run the full stack manually, you must open **three separate terminal instances** and execute the layers in the specific order below.

### Phase 1: Storage Layer (MinIO Vault)
This layer manages the private S3-compatible document storage.
1. Open a terminal in the project root (`Docu-Chain`).
2. Spin up the MinIO container: `docker-compose -f docker-compose.minio.yml up -d`
3. *Note: MinIO Dashboard is accessible at `http://localhost:9001` (docuchain_admin / docuchain_enterprise_secret!).*

### Phase 2: Blockchain Layer (Hyperledger Fabric)
This layer manages the private permissioned enterprise ledger.
*(Currently, local setups spoof this node via the Python backend, but the chaincode resides in `smart-contract/chaincode`).*

### Phase 3: Backend Protocol (FastAPI)
This layer handles the Malware Analysis (VirusTotal), MinIO storage, Database management, and the Fabric Gateway API.
1. Open a second terminal in the project root (`Docu-Chain`).
2. Activate your virtual environment (if applicable).
3. Start the server: 
   ```powershell
   uvicorn backend.app:app --host 127.0.0.1 --port 8000 --reload
   ```
4. Verify connectivity at `http://localhost:8000/docs`.

### Phase 4: Frontend Interface (React/Vite)
The futuristic UI for user interaction.
1. Open a third terminal in `Docu-Chain/frontend`.
2. Install dependencies: `npm install`
3. Launch the dashboard: `npm run dev`
4. Access the app at `http://localhost:5173`.

---

## 3. Operational Best Practices

### Handling Large Files (25MB+)
The "Heuristic Malware Analysis" step (25% progress) performs a deep cloud scan via VirusTotal.
- **Expected Duration**: 60-120 seconds for large PowerPoint/PDF assets.
- **Status Stuck at 25%?**: No. Do not refresh. The backend is polling VirusTotal engines in the background. Check the Backend Terminal for `⏳ [VT] Analysis status: in_progress` logs.
- **Timeout**: The frontend has a 5-minute threshold. If a scan takes longer, the protocol will auto-reset for security.

### Identity Management
- Credentials are stored as Bcrypt hashes in `backend/docuchain.db`.
- Resetting the DB: If you need to clear all users, delete the `docuchain.db` file and restart the backend server.

---

## 4. Troubleshooting Checklist

| Issue | Verification Step | Solution |
| :--- | :--- | :--- |
| **No "Upload Document" Response** | Check if MinIO is running. | Ensure `docker ps` shows `docuchain-minio` on port 9000. |
| **Register: "Integrity Mismatch"** | Check Backend Terminal logs. | This usually means the Email or Username is already taken. |
| **MinIO Login Fails** | Check Docker logs. | Ensure you use `docuchain_admin` and `docuchain_enterprise_secret!`. |
| **Dashed Card at Scan Step** | Verify Internet Connection. | The Malware Scan requires an active uplink to VirusTotal Cloud. |

---
*Document Version: 1.0.0*
*Security Protocol: High-Integrity Decentralized Audit*
