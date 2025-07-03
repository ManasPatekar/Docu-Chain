const { expect } = require("chai");

describe("DocVerifier", function () {
  let docVerifier;

  beforeEach(async function () {
    const DocVerifier = await ethers.getContractFactory("DocVerifier");
    docVerifier = await DocVerifier.deploy();
    await docVerifier.waitForDeployment();
  });

  it("Should verify a legitimate document", async function () {
    const hash = ethers.keccak256(ethers.toUtf8Bytes("validDocumentContent"));

    await docVerifier.verifyDocument(hash, true);

    const result = await docVerifier.verifiedDocuments(hash);
    expect(result).to.equal(true);
  });
});
