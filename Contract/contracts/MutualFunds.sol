// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract MutualFunds {
    struct FundsBoughtStruct {
        uint256 buyingId;
        address userId;
        string mutualfundname;
        uint256 amount;          
        uint256 boughtat;          
        uint256 timestamp;
        uint256 amountdeposited;    
    }

    struct FundsSoldStruct {
        uint256 sellingId;
        uint256 buyingId;
        address userId;
        string mutualfundname;
        uint256 amount;
        uint256 soldat;
        uint256 timestamp;
    }

    address public owner;

    modifier onlyOwner() {
        require(msg.sender == owner, "Not the contract owner");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    FundsBoughtStruct[] public allHoldings;
    FundsBoughtStruct[] public allBoughtHistory;
    FundsSoldStruct[] public allSoldHistory;

    event FundBought(uint256 buyingId, address indexed userId);
    event FundSold(uint256 sellingId, address indexed userId);
  event FundsDeposited(uint256 amountDeposited, uint256 balance);
    event FundsWithdrawn(uint256 amountWithdrawn, uint256 balance);
    // 🟢 BUYING FUNCTION
    function buying(
        string memory _fundname,
        uint256 _fundquantity,
        uint256 _price,
        uint256 _buyingID,
        uint256 _amount
    ) public payable {
        // ✅ Check that correct ETH is sent
        require(msg.value == _amount, "Incorrect ETH sent");

        // ✅ Add 2% extra on total cost
        uint256 totalCost = (_fundquantity * _price * 102) / 100;
        require(_amount == totalCost, "Incorrect payment amount");

        FundsBoughtStruct memory temp = FundsBoughtStruct({
            buyingId: _buyingID,
            userId: msg.sender,
            mutualfundname: _fundname,
            amount: _fundquantity,
            boughtat: _price,
            timestamp: block.timestamp,
            amountdeposited: _amount
        });

        allHoldings.push(temp);
        allBoughtHistory.push(temp);

        emit FundBought(_buyingID, msg.sender);
    }

    // 🔴 SELLING FUNCTION
    function selling(
        uint256 _buyingId,
        uint256 _fundquantity,
        uint256 _price,
        uint256 _sellingId
    ) public {
        bool found = false;
        string memory fundName = "";

        for (uint256 i = 0; i < allHoldings.length; i++) {
            if (
                allHoldings[i].buyingId == _buyingId &&
                allHoldings[i].amount >= _fundquantity
            ) {
                require(allHoldings[i].userId == msg.sender, "Not your fund");

                allHoldings[i].amount -= _fundquantity;
                fundName = allHoldings[i].mutualfundname;

                // Remove holding if fully sold
                if (allHoldings[i].amount == 0) {
                    for (uint256 j = i; j < allHoldings.length - 1; j++) {
                        allHoldings[j] = allHoldings[j + 1];
                    }
                    allHoldings.pop();
                }

                found = true;
                break;
            }
        }

        require(found, "Fund not found or insufficient quantity");

        // ✅ Calculate payout (2% deducted)
        uint256 totalAmount = _fundquantity * _price;
        uint256 payout = (totalAmount * 98) / 100;

        require(address(this).balance >= payout, "Insufficient contract balance");

        FundsSoldStruct memory sold = FundsSoldStruct({
            sellingId: _sellingId,
            buyingId: _buyingId,
            userId: msg.sender,
            mutualfundname: fundName,
            amount: _fundquantity,
            soldat: _price,
            timestamp: block.timestamp
        });

        allSoldHistory.push(sold);

        payable(msg.sender).transfer(payout);

        emit FundSold(_sellingId, msg.sender);
    } 






      function viewHoldingsByBuyingId(uint256 _buyingId) public view returns (FundsBoughtStruct memory) {
        for (uint256 i = 0; i < allHoldings.length; i++) {
            if (allHoldings[i].buyingId == _buyingId) {
                return allHoldings[i];
            }
        }
        revert("Holding not found");
    }

    function viewBoughtByBuyingId(uint256 _buyingId) public view returns (FundsBoughtStruct memory) {
        for (uint256 i = 0; i < allBoughtHistory.length; i++) {
            if (allBoughtHistory[i].buyingId == _buyingId) {
                return allBoughtHistory[i];
            }
        }
        revert("Bought history not found");
    }

   function getSoldBySellingId(uint256 _sellingId) public view returns (FundsSoldStruct memory) {
    for (uint256 i = 0; i < allSoldHistory.length; i++) {
        if (allSoldHistory[i].sellingId == _sellingId) {
            return allSoldHistory[i];
        }
    }
    revert("Sold stock not found for this sellingId");
} 




    // 🪙 Owner functions 
      function deposit() public payable onlyOwner {
        require(msg.value > 0, "Must deposit some ETH");
        emit FundsDeposited(msg.value, address(this).balance);
    }

    function withdraw(uint256 amount) public onlyOwner {
        require(address(this).balance >= amount, "Insufficient balance");
        payable(msg.sender).transfer(amount);
        emit FundsWithdrawn(amount, address(this).balance);
    }

    function getContractBalance() public view onlyOwner returns (uint256) {
        return address(this).balance;
    }
}