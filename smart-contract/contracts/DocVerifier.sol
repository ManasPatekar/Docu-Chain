// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract DocVerifier {
    address public owner;

    mapping(bytes32 => bool) public verifiedDocuments;

    event DocumentVerified(bytes32 indexed documentHash, bool isValid);
    event DocumentRemoved(bytes32 indexed documentHash);

    constructor() {
        owner = msg.sender;
    }

    // Removed onlyOwner modifier from verifyDocument()
    function verifyDocument(bytes32 documentHash, bool isValid) public {
        verifiedDocuments[documentHash] = isValid;
        emit DocumentVerified(documentHash, isValid);
    }

    function removeDocument(bytes32 documentHash) public {
        require(msg.sender == owner, "Not contract owner");
        delete verifiedDocuments[documentHash];
        emit DocumentRemoved(documentHash);
    }

    function isDocumentVerified(bytes32 documentHash) public view returns (bool) {
        return verifiedDocuments[documentHash];
    }
}
