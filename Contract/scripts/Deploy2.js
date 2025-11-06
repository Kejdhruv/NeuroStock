const hre = require("hardhat");

async function main() {
  const MutualFunds = await hre.ethers.getContractFactory("MutualFunds");
  console.log("Deploying Mutual Funds");

  const MutualFundsContract = await MutualFunds.deploy();
  await MutualFundsContract.waitForDeployment();

  console.log("Mutual Funds Contract deployed to:", MutualFundsContract.target);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}); 