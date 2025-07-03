// utils/connectWallet.js
import { ethers } from "ethers";

export const connectWallet = async () => {
  if (!window.ethereum) {
    alert("Please install MetaMask!");
    return null;
  }

  try {
    await window.ethereum.request({ method: "eth_requestAccounts" });
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    return { provider, signer };
  } catch (err) {
    console.error("Wallet connection failed:", err);
    return null;
  }
};
