async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contract with account:", deployer.address);

  const DocVerifier = await ethers.getContractFactory("DocVerifier");
  const contract = await DocVerifier.deploy();

  await contract.waitForDeployment(); // ✅ ethers v6 replacement for deployed()

  console.log("Contract deployed to:", await contract.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
