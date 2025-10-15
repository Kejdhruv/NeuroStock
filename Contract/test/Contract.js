const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Stocks", function () {
    let contract, owner, user1, user2;

    beforeEach(async function () {
        [owner, user1, user2] = await ethers.getSigners();
        const Stockscontract = await ethers.getContractFactory("Stocks");
        contract = await Stockscontract.deploy();
        await contract.waitForDeployment();
    });
   
    it("Creating User", async function () {
        await contract.connect(user1).createUser(user1, "Dhruv Kejriwal");
        const username = await contract.getUsername(user1);
        expect(username).to.equal("Dhruv Kejriwal");
    });


    it("Buying a Stock", async function () {
     await contract.connect(user1).createUser(user1, "Dhruv Kejriwal");
        const username = await contract.getUsername(user1);
        expect(username).to.equal("Dhruv Kejriwal");
        const quantity = 5;
        const price = ethers.parseEther("3"); // 1 ETH
        const totalCost = (price * BigInt(quantity) * 102n) / 100n;
        await contract.connect(user1).buying("AAPL", quantity, price, 1, { value: totalCost });
        const stocksBought = await contract.bought(user1.address);
        expect(stocksBought[0].stockquantity).to.equal(quantity);
    });  
      
     
   it("Selling a stock ", async function () {
        await contract.connect(user1).createUser(user1, "Dhruv Kejriwal");
        const quantity = 5;
        const price = ethers.parseEther("3"); 
       const totalCost = (price * BigInt(quantity) * 102n) / 100n;
        const price1 = ethers.parseEther("1"); 
        await contract.connect(user1).buying("AAPL", quantity, price, 1, { value: totalCost });
       await contract.connect(user1).selling(1, 3, price1, 1,); 
       const soldstock = await contract.viewSold(user1);
       expect(soldstock[0].stockquantity).to.equal(3); 
  });
   
it("should return correct contract balance", async function () {
  await contract.connect(user1).createUser(user1.address, "Dhruv Kejriwal");

  const quantity = 5;
  const price = ethers.parseEther("1"); // 5 ETH per stock
  const totalCost = (price * BigInt(quantity) * 102n) / 100n; // With 2% commission

  const price1 = ethers.parseEther("1"); // 4 ETH per stock on selling

  await contract.connect(user1).buying("AAPL", quantity, price, 1, { value: totalCost });
  await contract.connect(user1).selling(1, 5, price1, 1);

  const soldstock = await contract.viewSold(user1.address);
  expect(soldstock[0].stockquantity).to.equal(5);

  const balance = await contract.connect(owner).getContractBalance();
  console.log("Contract balance (ETH):", ethers.formatEther(balance));
});
   /* it("should transfer ", async function () {
        await personalBank.connect(user1).deposit({ value: ethers.parseEther("1") }); 
        await personalBank.connect(user1).transfer(user2, ethers.parseEther("0.5")); 
        const balance = await personalBank.balanceOf(user2.address);
         expect(balance).to.equal(ethers.parseEther("0.5"));

    })
}); */  }) 