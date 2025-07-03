import React, { useState } from "react";
import axios from "axios";
import { connectWallet } from "../utils/connectWallet";
import { verifyDocument } from "../utils/verify";

function Upload() {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("");

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) return setStatus("Please select a file.");

    const token = localStorage.getItem("access_token");
    if (!token) return setStatus("You must be logged in.");
    const authHeader = `Bearer ${token}`;

    try {
      setStatus("🔍 Scanning file...");

      const formData = new FormData();
      formData.append("file", file);

      // Step 1: VirusTotal & database scan
      const scanResponse = await axios.post("http://127.0.0.1:8000/scan", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: authHeader,
        },
      });

      let { clean, reason, cid, verified } = scanResponse.data;

      if (!clean) {
        setStatus(`❌ File is malicious or suspicious: ${reason}`);
        return;
      }

      setStatus("✅ File is clean. Uploading to IPFS...");

      // Step 2: Upload to IPFS
      const ipfsResponse = await axios.post("http://127.0.0.1:8000/upload_ipfs", formData, {
        headers: {
          Authorization: authHeader,
        },
      });

      const ipfsHash = ipfsResponse.data.ipfs_hash;
      const ipfsUrl = `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;
      cid = ipfsHash; // Update cid from IPFS upload

      setStatus(`✅ Uploaded to IPFS. CID: ${cid}\n🔗 Connecting MetaMask...`);

      // Step 3: Connect Wallet
      const wallet = await connectWallet();
      if (!wallet) return;

      // Step 4: Call smart contract to verify document
      const result = await verifyDocument(cid, wallet.signer);
      if (result.success) {
        setStatus(
          `✅ Uploaded & Verified On-Chain!\nIPFS URL: ${ipfsUrl}\nTx: ${result.txHash}`
        );
      } else {
        setStatus(`❌ On-chain verification failed: ${result.error}`);
      }
    } catch (error) {
      console.error(error);
      setStatus("❌ Upload failed: " + (error.response?.data?.detail || error.message));
    }
  };

  return (
    <div className="p-4 max-w-xl mx-auto bg-gray shadow rounded">
      <h2 className="text-xl font-bold mb-4">Upload & Verify Document</h2>
      <input type="file" onChange={handleFileChange} className="mb-2" />
      <button
        onClick={handleUpload}
        className="bg-blue-600 text-whhite px-4 py-2 rounded hover:bg-blue-700"
      >
        Upload & Verify
      </button>
      <pre className="mt-4 text-gray-700 whitespace-pre-wrap">{status}</pre>
    </div>
  );
}

export default Upload;
