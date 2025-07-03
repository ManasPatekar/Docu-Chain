const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // Replace if different
  const DocVerifier = await hre.ethers.getContractFactory("DocVerifier");
  const verifier = await DocVerifier.attach(contractAddress);

  const fakeHash = "0xabc123abc123abc123abc123abc123abc123abc123abc123abc123abc123abc1";
  const isValid = true;

  console.log("Sending verification transaction...");
  const tx = await verifier.verifyDocument(fakeHash, isValid);
  await tx.wait();
  console.log("Document verified successfully.");

  const result = await verifier.isDocumentVerified(fakeHash);
  console.log("Is document verified?", result);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
