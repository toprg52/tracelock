"""
anchor_service.py

Read-only blockchain verification for Tracelock.

Design change from the old version: the backend NEVER holds a wallet
private key and NEVER submits transactions. Anchoring happens client-side
in the browser via MetaMask (see useBlockchainAnchor.js), which is the
correct trust model for a fraud/forensics tool — the backend shouldn't be
able to forge or silently fake an anchor.

This service's only job is to take a tx_hash the frontend reports back
and independently confirm, by reading Sepolia directly, that:
  1. the transaction actually exists and succeeded
  2. it was sent to OUR contract
  3. it emitted an EvidenceAnchored event
  4. the hash in that event matches the report we have on file

If any of that fails, it reports failure. It never fabricates a result.
"""

from web3 import Web3
import json
import os

SEPOLIA_CHAIN_ID = 11155111


class AnchorVerificationError(Exception):
    pass


class BlockchainAnchor:
    def __init__(self):
        rpc_url = os.environ.get("SEPOLIA_RPC_URL", "https://rpc.sepolia.org")
        self.w3 = Web3(Web3.HTTPProvider(rpc_url))

        contract_address = os.environ.get("CONTRACT_ADDRESS")
        if not contract_address:
            raise AnchorVerificationError(
                "CONTRACT_ADDRESS is not set. Deploy EvidenceAnchor.sol in Remix "
                "and set this env var — verification cannot run without it."
            )
        self.contract_address = Web3.to_checksum_address(contract_address)

        abi_path = os.path.join(
            os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__)))),
            "contracts",
            "EvidenceAnchor.abi.json",
        )
        with open(abi_path, "r") as f:
            abi = json.load(f)

        self.contract = self.w3.eth.contract(address=self.contract_address, abi=abi)

    def compute_evidence_hash(self, report_bytes: bytes) -> str:
        """Same hash the frontend computes client-side (keccak256), so the
        backend can compare against what's on-chain without ever signing anything."""
        return Web3.keccak(report_bytes).hex()

    def verify_anchor(self, tx_hash: str, case_id: str, report_bytes: bytes) -> dict:
        """Independently confirm an anchor tx against live chain data.
        Raises AnchorVerificationError with a specific reason on any mismatch —
        never returns a success dict unless every check actually passed."""

        if not self.w3.is_connected():
            raise AnchorVerificationError("Cannot reach Sepolia RPC endpoint.")

        try:
            receipt = self.w3.eth.get_transaction_receipt(tx_hash)
        except Exception:
            raise AnchorVerificationError(f"Transaction {tx_hash} not found on Sepolia.")

        if receipt.status != 1:
            raise AnchorVerificationError(f"Transaction {tx_hash} reverted on-chain.")

        if receipt.to is None or Web3.to_checksum_address(receipt.to) != self.contract_address:
            raise AnchorVerificationError(
                f"Transaction {tx_hash} was not sent to the EvidenceAnchor contract."
            )

        events = self.contract.events.EvidenceAnchored().process_receipt(receipt)
        if not events:
            raise AnchorVerificationError(
                f"Transaction {tx_hash} did not emit an EvidenceAnchored event."
            )

        event = events[0]["args"]
        if event["caseId"] != case_id:
            raise AnchorVerificationError(
                f"On-chain caseId '{event['caseId']}' does not match expected '{case_id}'."
            )

        expected_hash = self.compute_evidence_hash(report_bytes)
        onchain_hash = event["evidenceHash"].hex()
        if onchain_hash != expected_hash.replace("0x", ""):
            raise AnchorVerificationError(
                "Evidence hash mismatch — the anchored hash does not match this report's bytes. "
                "The report may have been altered after anchoring."
            )

        return {
            "verified": True,
            "tx_hash": tx_hash,
            "case_id": case_id,
            "evidence_hash": expected_hash,
            "submitter": event["submitter"],
            "block_number": receipt.blockNumber,
            "explorer_url": f"https://sepolia.etherscan.io/tx/{tx_hash}",
        }
