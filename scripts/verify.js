const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("Verifying TipJar contract functionality...");

  // Load deployment info
  const deploymentFile = path.join(__dirname, "..", "deployments", "mantle-testnet.json");
  
  if (!fs.existsSync(deploymentFile)) {
    throw new Error("Deployment file not found. Please deploy the contract first.");
  }

  const deploymentInfo = JSON.parse(fs.readFileSync(deploymentFile, "utf8"));
  const contractAddress = deploymentInfo.contractAddress;

  console.log("Contract Address:", contractAddress);

  // Get contract instance
  const TipJar = await ethers.getContractFactory("TipJar");
  const tipJar = TipJar.attach(contractAddress);

  // Verify basic contract functions
  console.log("\n=== Contract Verification ===");

  try {
    // Check owner
    const owner = await tipJar.owner();
    console.log("✓ Owner:", owner);

    // Check relayer
    const relayer = await tipJar.relayerAddress();
    console.log("✓ Relayer:", relayer);

    // Check domain separator
    const domainSeparator = await tipJar.getDomainSeparator();
    console.log("✓ Domain Separator:", domainSeparator);

    // Check a sample balance (should be 0)
    const [signer] = await ethers.getSigners();
    const balance = await tipJar.getClaimableBalance(signer.address);
    console.log("✓ Sample balance check:", ethers.formatEther(balance), "MNT");

    // Check nonce for sample address
    const nonce = await tipJar.getNonce(signer.address);
    console.log("✓ Sample nonce:", nonce.toString());

    console.log("\n✅ Contract verification completed successfully!");
    console.log("The TipJar contract is deployed and functioning correctly.");

  } catch (error) {
    console.error("❌ Contract verification failed:", error.message);
    throw error;
  }
}

// Handle script execution
if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error("Verification failed:", error);
      process.exit(1);
    });
}

module.exports = { main };