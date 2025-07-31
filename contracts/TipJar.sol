// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title TipJar
 * @dev A smart contract that enables gasless cryptocurrency tipping through meta-transactions
 * @notice This contract allows fans to tip creators without paying gas fees by using EIP-712 signatures
 */
contract TipJar is EIP712, Ownable, ReentrancyGuard {
    using ECDSA for bytes32;

    // EIP-712 type hash for Tip struct
    bytes32 private constant TIP_TYPEHASH = 
        keccak256("Tip(address fan,address creator,uint256 amount,uint256 nonce)");

    // Mapping to track creator balances
    mapping(address => uint256) public claimableBalances;
    
    // Mapping to track processed signatures to prevent replay attacks
    mapping(bytes32 => bool) public processedSignatures;
    
    // Mapping to track nonces for each fan to prevent replay attacks
    mapping(address => uint256) public nonces;
    
    // Address of the authorized relayer
    address public relayerAddress;
    
    // Events
    event TipReceived(
        address indexed fan,
        address indexed creator,
        uint256 amount,
        uint256 nonce
    );
    
    event FundsWithdrawn(
        address indexed creator,
        uint256 amount
    );
    
    event RelayerUpdated(
        address indexed oldRelayer,
        address indexed newRelayer
    );

    /**
     * @dev Constructor sets up EIP-712 domain and initial relayer
     * @param _relayerAddress Address of the authorized relayer
     */
    constructor(address _relayerAddress) 
        EIP712("MantleTipJar", "1") 
        Ownable(msg.sender)
    {
        require(_relayerAddress != address(0), "Invalid relayer address");
        relayerAddress = _relayerAddress;
    }

    /**
     * @dev Modifier to ensure only the relayer can call certain functions
     */
    modifier onlyRelayer() {
        require(msg.sender == relayerAddress, "Unauthorized: Only relayer can call this function");
        _;
    }

    /**
     * @dev Modifier to prevent signature replay attacks
     * @param signatureHash Hash of the signature to check
     */
    modifier nonceNotUsed(bytes32 signatureHash) {
        require(!processedSignatures[signatureHash], "Signature already used");
        _;
    }

    /**
     * @dev Process a tip using meta-transaction with EIP-712 signature
     * @param fan Address of the fan sending the tip
     * @param creator Address of the creator receiving the tip
     * @param amount Amount of the tip in wei
     * @param nonce Unique nonce for the fan to prevent replay attacks
     * @param signature EIP-712 signature from the fan
     */
    function tip(
        address fan,
        address creator,
        uint256 amount,
        uint256 nonce,
        bytes calldata signature
    ) external payable onlyRelayer nonReentrant {
        require(fan != address(0), "Invalid fan address");
        require(creator != address(0), "Invalid creator address");
        require(amount > 0, "Tip amount must be greater than zero");
        require(msg.value == amount, "Sent value must match tip amount");
        require(nonce == nonces[fan], "Invalid nonce");

        // Create the struct hash for EIP-712
        bytes32 structHash = keccak256(
            abi.encode(
                TIP_TYPEHASH,
                fan,
                creator,
                amount,
                nonce
            )
        );

        // Create the digest using EIP-712
        bytes32 digest = _hashTypedDataV4(structHash);
        
        // Create signature hash for replay protection
        bytes32 signatureHash = keccak256(abi.encodePacked(digest, signature));
        
        // Check if signature has been used before
        require(!processedSignatures[signatureHash], "Signature already used");

        // Recover the signer address from the signature
        address recoveredSigner = digest.recover(signature);
        require(recoveredSigner == fan, "Invalid signature");

        // Mark signature as processed
        processedSignatures[signatureHash] = true;
        
        // Increment nonce for the fan
        nonces[fan]++;

        // Add tip amount to creator's claimable balance
        claimableBalances[creator] += amount;

        emit TipReceived(fan, creator, amount, nonce);
    }

    /**
     * @dev Get the claimable balance for a creator
     * @param creator Address of the creator
     * @return The claimable balance in wei
     */
    function getClaimableBalance(address creator) external view returns (uint256) {
        return claimableBalances[creator];
    }

    /**
     * @dev Allow creators to withdraw their claimable balance
     */
    function withdraw() external nonReentrant {
        uint256 balance = claimableBalances[msg.sender];
        require(balance > 0, "No funds to withdraw");

        // Reset balance before transfer to prevent reentrancy
        claimableBalances[msg.sender] = 0;

        // Transfer funds to creator
        (bool success, ) = payable(msg.sender).call{value: balance}("");
        require(success, "Transfer failed");

        emit FundsWithdrawn(msg.sender, balance);
    }

    /**
     * @dev Get the current nonce for a fan
     * @param fan Address of the fan
     * @return Current nonce value
     */
    function getNonce(address fan) external view returns (uint256) {
        return nonces[fan];
    }

    /**
     * @dev Update the relayer address (only owner)
     * @param newRelayer New relayer address
     */
    function updateRelayer(address newRelayer) external onlyOwner {
        require(newRelayer != address(0), "Invalid relayer address");
        address oldRelayer = relayerAddress;
        relayerAddress = newRelayer;
        emit RelayerUpdated(oldRelayer, newRelayer);
    }

    /**
     * @dev Get the domain separator for EIP-712
     * @return The domain separator hash
     */
    function getDomainSeparator() external view returns (bytes32) {
        return _domainSeparatorV4();
    }

    /**
     * @dev Emergency function to withdraw contract balance (only owner)
     * This should only be used in emergency situations
     */
    function emergencyWithdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");
        
        (bool success, ) = payable(owner()).call{value: balance}("");
        require(success, "Emergency withdrawal failed");
    }

    /**
     * @dev Check if a signature has been processed
     * @param digest The EIP-712 digest
     * @param signature The signature to check
     * @return Whether the signature has been processed
     */
    function isSignatureProcessed(bytes32 digest, bytes calldata signature) 
        external 
        view 
        returns (bool) 
    {
        bytes32 signatureHash = keccak256(abi.encodePacked(digest, signature));
        return processedSignatures[signatureHash];
    }
}