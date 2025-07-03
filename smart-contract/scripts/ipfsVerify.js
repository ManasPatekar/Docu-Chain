const { ethers } = require("hardhat");
const fs = require("fs");
const FormData = require("form-data");
const axios = require("axios");
const { keccak256 } = require("ethers"); // v6 compatible
const path = require("path");

const PINATA_API_KEY = "f42628387e2333d8b49c";
const PINATA_SECRET_API_KEY = "4264d05a663196248ee275870b8169cc07b498fe7188e137e13a4ba12d04d923";

async function uploadToIPFS(filePath) {
  const url = `https://api.pinata.cloud/pinning/pinFileToIPFS`;
  const formData = new FormData();
  const fileStream = fs.createReadStream(filePath);
  formData.append("file", fileStream);

  const res = await axios.post(url, formData, {
    maxBodyLength: "Infinity",
    headers: {
      ...formData.getHeaders(),
      pinata_api_key: PINATA_API_KEY,
      pinata_secret_api_key: PINATA_SECRET_API_KEY,
    },
  });

  return res.data.IpfsHash;
}

async function main() {
  const filePath = path.join(__dirname, "..", "assets", "hack.pdf");

  console.log("📤 Uploading PDF to IPFS...");
  const cid = await uploadToIPFS(filePath);
  console.log("✅ Uploaded to IPFS. CID:", cid);

  const docHash = keccak256(Buffer.from(cid));
  console.log("🔐 Hashed CID (bytes32):", docHash);

  const [deployer] = await ethers.getSigners();
const verifier = await ethers.getContractAt("DocVerifier", "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512", deployer);


  console.log("📝 Verifying document on-chain...");
  const tx = await verifier.verifyDocument(docHash, true);
  await tx.wait();

  console.log("✅ Document verified on-chain.");
}

main().catch((err) => {
  console.error("❌ Error:", err);
  process.exit(1);
});
