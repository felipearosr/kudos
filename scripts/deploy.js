const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("Starting TipJar deployment to Mantle Testnet...");

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);

  // Check deployer balance
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "MNT");

  if (balance === 0n) {
    throw new Error("Deployer account has no MNT tokens. Please fund the account first.");
  }

  // For this deployment, we'll use the deployer as the initial relayer
  // In production, you would use a dedicated relayer address
  const relayerAddress = deployer.address;
  console.log("Using relayer address:", relayerAddress);

  // Deploy the TipJar contract
  console.log("Deploying TipJar contract...");
  const TipJar = await ethers.getContractFactory("TipJar");
  const tipJar = await TipJar.deploy(relayerAddress);

  // Wait for deployment to complete
  await tipJar.waitForDeployment();
  const contractAddress = await tipJar.getAddress();

  console.log("TipJar deployed to:", contractAddress);
  console.log("Transaction hash:", tipJar.deploymentTransaction().hash);

  // Verify deployment by calling a view function
  console.log("Verifying deployment...");
  const owner = await tipJar.owner();
  const relayer = await tipJar.relayerAddress();
  const domainSeparator = await tipJar.getDomainSeparator();

  console.log("Contract owner:", owner);
  console.log("Contract relayer:", relayer);
  console.log("Domain separator:", domainSeparator);

  // Save deployment information
  const deploymentInfo = {
    network: "mantleTestnet",
    contractAddress: contractAddress,
    deployerAddress: deployer.address,
    relayerAddress: relayerAddress,
    transactionHash: tipJar.deploymentTransaction().hash,
    blockNumber: tipJar.deploymentTransaction().blockNumber,
    deployedAt: new Date().toISOString(),
    gasUsed: "TBD", // Will be filled after transaction is mined
  };

  // Wait for transaction receipt to get gas information
  const receipt = await tipJar.deploymentTransaction().wait();
  deploymentInfo.gasUsed = receipt.gasUsed.toString();
  deploymentInfo.blockNumber = receipt.blockNumber;

  console.log("Gas used for deployment:", deploymentInfo.gasUsed);
  console.log("Block number:", deploymentInfo.blockNumber);

  // Save deployment info to file
  const deploymentPath = path.join(__dirname, "..", "deployments");
  if (!fs.existsSync(deploymentPath)) {
    fs.mkdirSync(deploymentPath, { recursive: true });
  }

  const deploymentFile = path.join(deploymentPath, "mantle-testnet.json");
  fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
  console.log("Deployment info saved to:", deploymentFile);

  // Update .env.local with contract address if it exists
  const envLocalPath = path.join(__dirname, "..", ".env.local");
  if (fs.existsSync(envLocalPath)) {
    let envContent = fs.readFileSync(envLocalPath, "utf8");
    
    // Update or add the contract address
    if (envContent.includes("NEXT_PUBLIC_TIP_JAR_CONTRACT_ADDRESS=")) {
      envContent = envContent.replace(
        /NEXT_PUBLIC_TIP_JAR_CONTRACT_ADDRESS=.*/,
        `NEXT_PUBLIC_TIP_JAR_CONTRACT_ADDRESS=${contractAddress}`
      );
    } else {
      envContent += `\nNEXT_PUBLIC_TIP_JAR_CONTRACT_ADDRESS=${contractAddress}\n`;
    }

    // Update or add the relayer private key (using deployer's address as placeholder)
    if (envContent.includes("RELAYER_PRIVATE_KEY=")) {
      envContent = envContent.replace(
        /RELAYER_PRIVATE_KEY=.*/,
        `RELAYER_PRIVATE_KEY=${process.env.PRIVATE_KEY || "your_relayer_private_key_here"}`
      );
    } else {
      envContent += `RELAYER_PRIVATE_KEY=${process.env.PRIVATE_KEY || "your_relayer_private_key_here"}\n`;
    }

    fs.writeFileSync(envLocalPath, envContent);
    console.log("Updated .env.local with contract address");
  }

  console.log("\n=== Deployment Summary ===");
  console.log("Network: Mantle Testnet");
  console.log("Contract Address:", contractAddress);
  console.log("Owner:", owner);
  console.log("Relayer:", relayer);
  console.log("Gas Used:", deploymentInfo.gasUsed);
  console.log("Transaction Hash:", deploymentInfo.transactionHash);
  console.log("Block Number:", deploymentInfo.blockNumber);
  console.log("\n=== Next Steps ===");
  console.log("1. Update your frontend environment variables with the contract address");
  console.log("2. Fund the relayer address with MNT tokens for gas fees");
  console.log("3. Consider verifying the contract on Mantle Explorer");
  console.log("4. Test the contract functionality with the frontend application");

  return {
    contractAddress,
    deploymentInfo,
  };
}

// Handle script execution
if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error("Deployment failed:", error);
      process.exit(1);
    });
}

module.exports = { main };