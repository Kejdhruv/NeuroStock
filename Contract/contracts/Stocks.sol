// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Stocks {
    struct StockBoughtStruct {
        uint256 buyingId;
        address userId;
        string stockname;
        uint256 stockquantity;
        uint256 stockprice;
        uint256 timestamp;
    }

    struct StockSoldStruct {
        uint256 sellingId;
        uint256 buyingId;
        address userId;
        string stockname;
        uint256 stockquantity;
        uint256 stockprice;
        uint256 timestamp;
    }

    address public owner;

    StockBoughtStruct[] public allHoldings;
    StockBoughtStruct[] public allBoughtHistory;
    StockSoldStruct[] public allSoldHistory;

    event StockBought(uint256 buyingId, address userId);
    event StockSold(uint256 sellingId, address userId);
    event FundsDeposited(uint256 amountDeposited, uint256 balance);
    event FundsWithdrawn(uint256 amountWithdrawn, uint256 balance);

    modifier onlyOwner {
        require(msg.sender == owner, "Not the contract owner");
        _;
    }

    constructor() {
        owner = msg.sender;
    }
    
    function buying(
        string memory _stockname,
        uint256 _stockquantity,
        uint256 _stockprice,
        uint256 _buyingID
    ) public payable {
        uint256 totalCost = _stockquantity * _stockprice;
        uint256 costWithCommission = (totalCost * 102) / 100;
        require(msg.value == costWithCommission, "Incorrect payment");

        StockBoughtStruct memory temp = StockBoughtStruct({
            buyingId: _buyingID,
            userId: msg.sender,
            stockname: _stockname,
            stockquantity: _stockquantity,
            stockprice: _stockprice,
            timestamp: block.timestamp
        });

        allHoldings.push(temp);
        allBoughtHistory.push(temp);

        emit StockBought(_buyingID, msg.sender);
    }

    function selling(
        uint256 _buyingId,
        uint256 _stockquantity,
        uint256 _stockprice,
        uint256 _sellingId
    ) public {
        bool found = false;
        string memory stockName = "";

        for (uint256 i = 0; i < allHoldings.length; i++) {
            if (
                allHoldings[i].buyingId == _buyingId &&
                allHoldings[i].stockquantity >= _stockquantity
            ) {
                require(allHoldings[i].userId == msg.sender, "Not your stock");

                allHoldings[i].stockquantity -= _stockquantity;
                stockName = allHoldings[i].stockname;

                if (allHoldings[i].stockquantity == 0) {
                    // Remove by shifting
                    for (uint256 j = i; j < allHoldings.length - 1; j++) {
                        allHoldings[j] = allHoldings[j + 1];
                    }
                    allHoldings.pop();
                }

                found = true;
                break;
            }
        }

        require(found, "Stock not found or insufficient quantity");

        uint256 totalAmount = _stockquantity * _stockprice;
        uint256 payout = (totalAmount * 98) / 100;
        require(address(this).balance >= payout, "Insufficient contract balance");

        StockSoldStruct memory sold = StockSoldStruct({
            sellingId: _sellingId,
            buyingId: _buyingId,
            userId: msg.sender,
            stockname: stockName,
            stockquantity: _stockquantity,
            stockprice: _stockprice,
            timestamp: block.timestamp
        });

        allSoldHistory.push(sold);
        payable(msg.sender).transfer(payout);

        emit StockSold(_sellingId, msg.sender);
    }

    // ===================== VIEW FUNCTIONS =====================

    function viewHoldingsByBuyingId(uint256 _buyingId) public view returns (StockBoughtStruct memory) {
        for (uint256 i = 0; i < allHoldings.length; i++) {
            if (allHoldings[i].buyingId == _buyingId) {
                return allHoldings[i];
            }
        }
        revert("Holding not found");
    }

    function viewBoughtByBuyingId(uint256 _buyingId) public view returns (StockBoughtStruct memory) {
        for (uint256 i = 0; i < allBoughtHistory.length; i++) {
            if (allBoughtHistory[i].buyingId == _buyingId) {
                return allBoughtHistory[i];
            }
        }
        revert("Bought history not found");
    }

   function getSoldBySellingId(uint256 _sellingId) public view returns (StockSoldStruct memory) {
    for (uint256 i = 0; i < allSoldHistory.length; i++) {
        if (allSoldHistory[i].sellingId == _sellingId) {
            return allSoldHistory[i];
        }
    }
    revert("Sold stock not found for this sellingId");
}

    // ===================== OWNER CONTROLS =====================
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