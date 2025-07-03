const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const verifier = await hre.ethers.getContractAt("DocVerifier", contractAddress);

  const hashToRemove = "0xabc123abc123abc123abc123abc123abc123abc123abc123abc123abc123abc1";
  const tx = await verifier.removeDocument(hashToRemove);
  await tx.wait();

  const result = await verifier.isDocumentVerified(hashToRemove);
  console.log("Is document verified after removal?", result);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
