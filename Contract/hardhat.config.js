/** @type import('hardhat/config').HardhatUserConfig */
require("@nomicfoundation/hardhat-ethers");
require("@nomicfoundation/hardhat-chai-matchers");

module.exports = {
  solidity: "0.8.28",
  networks: {
    sepolia: {
      url: "https://eth-sepolia.g.alchemy.com/v2/e-r8k53jfzIDSAkdRT3Vn1wCnkz7Zn8Z",
      accounts: ["2d98d4abe487f1f746c8ef4fc341579944d336060ac78b7c257baf20fa5f3bd7"]
      
    }
  }
};