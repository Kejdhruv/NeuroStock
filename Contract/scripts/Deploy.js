const hre = require("hardhat");

async function main() {
  const Stocks = await hre.ethers.getContractFactory("Stocks");
  console.log("Deploying Stocks...");

  const Stockscontract = await Stocks.deploy();
  await Stockscontract.waitForDeployment();

  console.log("Stocks Contract deployed to:", Stockscontract.target);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});