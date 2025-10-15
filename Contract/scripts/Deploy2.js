const hre = require("hardhat");

async function main() {
  const Gold = await hre.ethers.getContractFactory("Gold");
  console.log("Deploying Gold...");

  const Goldcontract = await Gold.deploy();
  await Goldcontract.waitForDeployment();

  console.log("Gold Contract deployed to:", Goldcontract.target);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}); 