const axios = require("axios");
const fs = require("fs");
const FormData = require("form-data");
const path = require("path");

// Replace with your actual API keys
require("dotenv").config();

const PINATA_API_KEY = process.env.PINATA_API_KEY;
const PINATA_SECRET_API_KEY = process.env.PINATA_SECRET_API_KEY;


async function uploadToIPFS(filePath) {
  const url = `https://api.pinata.cloud/pinning/pinFileToIPFS`;

  const formData = new FormData();
  const fileStream = fs.createReadStream(filePath);
  formData.append("file", fileStream);

  try {
    const res = await axios.post(url, formData, {
      maxBodyLength: "Infinity",
      headers: {
        ...formData.getHeaders(),
        pinata_api_key: PINATA_API_KEY,
        pinata_secret_api_key: PINATA_SECRET_API_KEY,
      },
    });

    console.log("✅ IPFS Hash (CID):", res.data.IpfsHash);
    return res.data.IpfsHash;
  } catch (error) {
    console.error("❌ Error uploading to IPFS:", error.response?.data || error.message);
    throw error;
  }
}

// Example usage:
const filePath = path.join(__dirname, "test-doc.pdf"); // Replace with your actual file
uploadToIPFS(filePath);
