const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🚀 Deploying contract...");

  const Upload = await hre.ethers.getContractFactory("Upload");
  const upload = await Upload.deploy();

  await upload.deployed();

  console.log("✅ Upload contract deployed to:", upload.address);

  // ✅ Auto-update frontend .env
  const envPath = path.join(__dirname, "../client/.env");
  const envContent = [
    `REACT_APP_CONTRACT_ADDRESS=${upload.address}`,
    `REACT_APP_PINATA_JWT=${process.env.REACT_APP_PINATA_JWT || ""}`
  ].join("\n");

  fs.writeFileSync(envPath, envContent);
  console.log(`📝 Updated client/.env with contract address: ${upload.address}`);
}

main().catch((error) => {
  console.error("❌ Deployment failed:", error);
  process.exitCode = 1;
});
