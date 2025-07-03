import { Contract, keccak256, toUtf8Bytes } from "ethers";
import DocVerifier from "../abi/DocVerifier.json";

const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

export async function verifyDocument(cid, signer) {
  try {
    const contract = new Contract(CONTRACT_ADDRESS, DocVerifier.abi, signer);

    const cidHash = keccak256(toUtf8Bytes(cid));

    const tx = await contract.verifyDocument(cidHash, true);
    await tx.wait();

    return { success: true, txHash: tx.hash };
  } catch (error) {
    console.error("Verification failed:", error);
    return { success: false, error: error.message };
  }
}
