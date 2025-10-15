// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Gold {
    struct GoldBoughtStruct {
        uint256 buyingId;
        address userId;
        string carrat;
        uint256 weight;
        uint256 priceperg;
        uint256 timestamp;
    }

    struct GoldSoldStruct {
        uint256 sellingId;
        uint256 buyingId;
        address userId;
        string carrat;
        uint256 weight;
        uint256 priceperg;
        uint256 timestamp;
    }

    address public owner;

    modifier onlyOwner {
        require(msg.sender == owner, "Not the contract owner");
        _;
    }

    event FundsDeposited(uint256 amountDeposited, uint256 balance);
    event FundsWithdrawn(uint256 amountWithdrawn, uint256 balance);
    event GoldBought(uint256 buyingId, address userId);
    event GoldSold(uint256 sellingId, address userId);

    constructor() {
        owner = msg.sender;
    }

    GoldBoughtStruct[] public allHoldings;
    GoldBoughtStruct[] public allBoughtHistory;
    GoldSoldStruct[] public allSoldHistory;

    function buying(
        string memory _carrat,
        uint256 _weight,
        uint256 _priceperg,
        uint256 _buyingId
    ) public payable {
        uint256 totalCost = _weight * _priceperg;
        uint256 costWithCommission = (totalCost * 102) / 100;
        require(msg.value == costWithCommission, "Incorrect payment");

        GoldBoughtStruct memory temp = GoldBoughtStruct({
            buyingId: _buyingId,
            userId: msg.sender,
            carrat: _carrat,
            weight: _weight,
            priceperg: _priceperg,
            timestamp: block.timestamp
        });

        allHoldings.push(temp);
        allBoughtHistory.push(temp);

        emit GoldBought(_buyingId, msg.sender);
    }

    function selling(
        uint256 _buyingId,
        uint256 _weight,
        uint256 _priceperg,
        uint256 _sellingId
    ) public {
        bool found = false;
        string memory carratType = "";

        for (uint256 i = 0; i < allHoldings.length; i++) {
            if (
                allHoldings[i].buyingId == _buyingId &&
                allHoldings[i].weight >= _weight 
            ) { 
                require(allHoldings[i].userId == msg.sender, "Not your stock");
                allHoldings[i].weight -= _weight;
                carratType = allHoldings[i].carrat;

                if (allHoldings[i].weight == 0) {
                    for (uint256 j = i; j < allHoldings.length - 1; j++) {
                        allHoldings[j] = allHoldings[j + 1];
                    }
                    allHoldings.pop();
                }

                found = true;
                break;
            }
        }

        require(found, "Gold not found or insufficient weight");

        uint256 totalAmount = _weight * _priceperg;
        uint256 payout = (totalAmount * 98) / 100;
        require(address(this).balance >= payout, "Insufficient contract balance");

        GoldSoldStruct memory sold = GoldSoldStruct({
            sellingId: _sellingId,
            buyingId: _buyingId,
            userId: msg.sender,
            carrat: carratType,
            weight: _weight,
            priceperg: _priceperg,
            timestamp: block.timestamp
        });

        allSoldHistory.push(sold);
        payable(msg.sender).transfer(payout);

        emit GoldSold(_sellingId, msg.sender);
    }
   
    function viewHoldingsByBuyingId(uint256 _buyingId) public view returns (GoldBoughtStruct memory) {
        for (uint256 i = 0; i < allHoldings.length; i++) {
            if (allHoldings[i].buyingId == _buyingId) {
                return allHoldings[i];
            }
        }
        revert("Holding not found");
    }

    function viewBoughtByBuyingId(uint256 _buyingId) public view returns (GoldBoughtStruct memory) {
        for (uint256 i = 0; i < allBoughtHistory.length; i++) {
            if (allBoughtHistory[i].buyingId == _buyingId) {
                return allBoughtHistory[i];
            }
        }
        revert("Bought history not found");
    }

   function getSoldBySellingId(uint256 _sellingId) public view returns (GoldSoldStruct memory) {
    for (uint256 i = 0; i < allSoldHistory.length; i++) {
        if (allSoldHistory[i].sellingId == _sellingId) {
            return allSoldHistory[i];
        }
    }
    revert("Sold stock not found for this sellingId");
}

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