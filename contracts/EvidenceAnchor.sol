// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract EvidenceAnchor {
    event Anchored(string caseId, bytes32 hash, uint256 timestamp);
    mapping(string => bytes32) public caseHashes;

    function anchor(string calldata caseId, bytes32 evidenceHash) external {
        caseHashes[caseId] = evidenceHash;
        emit Anchored(caseId, evidenceHash, block.timestamp);
    }

    function verify(string calldata caseId, bytes32 hashToCheck) external view returns (bool) {
        return caseHashes[caseId] == hashToCheck;
    }
}
