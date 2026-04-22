import uuid
import time
import os
import json
import logging
import requests
from dotenv import load_dotenv
load_dotenv()
load_dotenv("../.env")

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("DocuChain-Blockchain")

class BlockchainGateway:
    """
    Enterprise Blockchain Gateway for DocuChain.
    Supports Hyperledger Fabric (via REST Gateway) and Development Spoofing.
    """
    
    def __init__(self):
        # Configuration from Environment
        self.mode = os.getenv("BLOCKCHAIN_MODE", "SPOOF")
        self.gateway_url = os.getenv("FABRIC_GATEWAY_URL", "http://fabric-gateway:3000")
        self.channel = os.getenv("FABRIC_CHANNEL", "docuchain-channel")
        self.chaincode = os.getenv("FABRIC_CHAINCODE", "docuchain")
        self.msp_id = os.getenv("FABRIC_MSP_ID", "Org1MSP")
        self.connection_profile_path = os.getenv("FABRIC_CONNECTION_PROFILE", "fabric-samples/test-network/organizations/peerOrganizations/org1.example.com/connection-org1.json")
        
        logger.info(f"⛓️ Blockchain Gateway initialized in {self.mode} mode.")

    def load_connection_profile(self):
        """Loads the Fabric connection profile for Org1."""
        if os.path.exists(self.connection_profile_path):
            with open(self.connection_profile_path, 'r') as f:
                return json.load(f)
        return None

    async def anchor_document(self, doc_id: str, file_hash: str, metadata: dict):
        """
        Anchors a document hash to the immutable ledger.
        """
        timestamp = str(int(time.time()))
        
        if self.mode == "FABRIC":
            logger.info(f"📡 [Fabric] Submitting transaction to {self.channel}/{self.chaincode}...")
            
            payload = {
                "fcn": "StoreDocumentHash",
                "args": [doc_id, file_hash, timestamp],
                "metadata": metadata
            }
            
            try:
                # In a real enterprise setup, this calls the Fabric Gateway Service
                response = requests.post(
                    f"{self.gateway_url}/channels/{self.channel}/chaincodes/{self.chaincode}",
                    json=payload,
                    timeout=10
                )
                
                if response.status_code == 200:
                    result = response.json()
                    tx_id = result.get("txId")
                    logger.info(f"✅ [Fabric] Success! TX: {tx_id}")
                    return tx_id
                else:
                    logger.error(f"❌ [Fabric] Ledger rejected transaction: {response.text}")
                    raise Exception(f"Blockchain Rejection: {response.text}")
                    
            except Exception as e:
                logger.error(f"⚠️ [Fabric] Connection failed: {str(e)}")
                # Fallback or Error depending on strictness
                raise Exception("Enterprise Ledger unreachable. Verify Fabric Peer status.")
        
        else:
            # HIGH-INTEGRITY SPOOF (For Dev/Demo)
            # Simulates the cryptographic string returned by a real peer
            tx_id = f"fabric_anchor_{uuid.uuid4().hex}"
            logger.info(f"✅ [SPOOF] Anchored {doc_id} to local node. TX: {tx_id}")
            return tx_id

    async def verify_on_chain(self, identifier: str):
        """
        Queries the ledger to verify document integrity.
        """
        if self.mode == "FABRIC":
            try:
                response = requests.get(
                    f"{self.gateway_url}/channels/{self.channel}/chaincodes/{self.chaincode}/verify/{identifier}",
                    timeout=5
                )
                if response.status_code == 200:
                    return {
                        "verified": True, 
                        "source": "Hyperledger Fabric Peer",
                        "data": response.json()
                    }
                return {"verified": False, "reason": "Asset not found on ledger"}
            except:
                return {"verified": False, "reason": "Ledger query failed"}
        else:
            # Simulated verification
            return {
                "verified": True, 
                "source": "DocuChain Local Node (Simulated)",
                "tx_id": identifier
            }

# Singleton instance
gateway = BlockchainGateway()
