import express from "express";
import cors from "cors";
import dbConnect1 from "./database1.js";
import dbConnect2 from "./Counter/counter.js";
import dbConnect3 from "./Stocks/Holdings.js";
import dbConnect4 from "./Stocks/SoldStocks.js";
import dbConnect5 from "./Stocks/PostingHoldings.js";
import dbConnect6 from "./User/CreatingUser.js";
import dbConnect7 from "./Stocks/SoldingStocks.js";
import dbConnect8 from "./Stocks/Buying.js";
import dbConnect9 from "./Stocks/Boughts.js";
import dbConnect10 from "./User/Login.js";
import dbConnect11 from "./Counter/CounterUpdate.js";
import dbConnect12 from "./Stocks/Holdings2.js";
import dbConnect13 from "./Stocks/UpdatingHoldings.js";
import dbConnect14 from "./Stocks/DeletingHoldings.js";
import dbConnect15 from "./Counter/counter2.js";
import dbConnect16 from "./Counter/CounterUpdate2.js";
import FundsHoldings from "./MutualFunds/FundsHoldings.js";
import UpdatingFunds from "./MutualFunds/UpdatingFunds.js";
import DeletingFundHoldings from "./MutualFunds/DeletingFundHoldings.js";
import FundsBought from "./MutualFunds/FundsBought.js";
import FundsBuying from "./MutualFunds/FundsBuying.js";
import SoldingFunds from "./MutualFunds/SoldingFunds.js";
import SoldFunds from "./MutualFunds/SoldFunds.js";
import PostingFundsHoldings from "./MutualFunds/PostingFundHoldings.js";

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send("yo man wassup");
});

app.listen(PORT, () => {
  console.log(`yo bitch i m there at http://localhost:${PORT}`);
});


app.get('/Profile/:_id', async (req, res) => {
  try {
    const { _id } = req.params;
    const data = await dbConnect1(_id);
    res.send(data[0]); 
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: "Failed to fetch profile" });
  }
}); 
app.get('/Profile/:email', async (req, res) => {
  try {
    const { email } = req.params;
    const data = await dbConnect10(email);
    res.send(data); 
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: "Failed to fetch profile" });
  }
}); 

app.get('/Counter/buyingId', async (req, res) => {
  try {
    const data = await dbConnect2();
    res.send(data); 
    console.log(data[0].value); 
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: "Failed to fetch the Count" });
  }
}); 

app.get('/Profile/Holdings/:Userid', async (req, res) => {
  try {
    const { Userid } = req.params;
    const data = await dbConnect3(Userid);
    res.send(data); 
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: "Failed to fetch Holdings" });
  }
}) 

app.get('/Profile/SoldStocks/:Userid', async (req, res) => {
   try {
    const { Userid } = req.params;
    const data = await dbConnect4(Userid);
    res.send(data); 
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: "Failed to fetch sold stocks" });
  }
}) 

app.post('/Holdings', async (req, res) => {
  try {
    const data = req.body;
    const holding = Array.isArray(data) ? data : [data];
    const result = await dbConnect5(holding);  
    res.status(200).json({
      message: 'Stocks Added',
      insertedCount: result.insertedCount,
      insertedIds: result.insertedIds
    });
  } catch (err) {
    console.error('Error adding Stock:', err);
    res.status(500).send('Internal Server Error');
  }
});

app.post('/Users', async (req, res) => {
  try {
    const User = req.body;
    if (!Array.isArray(User)) {
      return res.status(400).send('Invalid input: data must be an array');
    }
    const result = await dbConnect6(User);
    res.status(200).json({
      message: 'User Created',
      insertedCount: result.insertedCount,
      insertedIds: result.insertedIds 
    });
  } catch (err){
     console.error('Error adding user', err);
        res.status(500).send('Internal Server Error');
  }
})  

app.post('/StocksSold', async (req, res) => {
  try {
    const data = req.body;
  
    const StockSold = Array.isArray(data) ? data : [data];
 const result = await dbConnect7(StockSold);
    res.status(200).json({
      message: 'Stock Sold',
      insertedCount: result.insertedCount,
      insertedIds: result.insertedIds 
    });
  } catch (err) {
    console.error('Error adding user', err);
        res.status(500).send('Internal Server Error');
  }
})

app.post('/Buying', async (req, res) => {
  try {
    const data = req.body;

    const boughts = Array.isArray(data) ? data : [data];
  
    const result = await dbConnect8(boughts);
    res.status(200).json({
      message: 'Stocks Added',
      insertedCount: result.insertedCount,
      insertedIds: result.insertedIds
    });
  } catch (err){
     console.error('Error adding Stock', err);
        res.status(500).send('Internal Server Error');
  }
}) 

app.get('/Profile/Boughts/:Userid', async (req, res) => {
   try {
    const { Userid } = req.params;
    const data = await dbConnect9(Userid);
    res.send(data); 
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: "Failed to fetch sold stocks" });
  }
}) 

app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
   
    
    const user = await dbConnect10(email); 

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    console.log(password);
    console.log(user.password); 
     
    if (user.password != password) {
      return res.status(401).json({ message: 'Incorrect password' });
    }

    return res.status(200).json({ userId: user._id, message: 'Login successful' });

  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});

app.put('/Counter/buyingId', async (req, res) => {
  const { value } = req.body;

  if (typeof value !== 'number') {
    return res.status(400).json({ message: 'Value must be a number' });
  }

  try {
    const result = await dbConnect11("buyingId", value); // Fixed use of ID

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'Counter not found' });
    }

    res.status(200).json({
      message: 'Counter updated successfully',
      matchedCount: result.matchedCount,
      modifiedCount: result.modifiedCount
    });
  } catch (err) {
    console.error("Error updating counter:", err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}); 

app.get('/Holdings/:_id', async (req, res) => {
  try {
    const { _id } = req.params;
    const data = await dbConnect12(_id);
    res.send(data); 
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: "Failed to fetch Holdings" });
  }
})  


app.put('/Holdings/:_id', async (req, res) => {
  const { Quantity } = req.body;
  const { _id } = req.params;

  if (typeof Quantity !== 'number') {
    return res.status(400).json({ message: 'Quantity must be a number' });
  }

  try {
    const result = await dbConnect13(_id, Quantity);

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'Holding not found' });
    }

    res.status(200).json({
      message: 'Quantity updated successfully',
      matchedCount: result.matchedCount,
      modifiedCount: result.modifiedCount
    });
  } catch (err) {
    console.error("Error updating holding:", err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}); 
app.delete('/Holdings/:_id', async (req, res) => {
  try {
    const { _id } = req.params;
    const result = await dbConnect14(_id);
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }
    res.status(200).json({ message: 'Item deleted' });
  } catch (err) {
    console.error('Error deleting item:', err);
    res.status(500).send('Internal Server Error');
  }
}); 


app.get('/Counter/sellingId', async (req, res) => {
  try {
    const data = await dbConnect15();
    res.send(data); 
    console.log(data[0].value); 
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: "Failed to fetch the Count" });
  }
}); 

app.put('/Counter/sellingId', async (req, res) => {
  const { value } = req.body;

  if (typeof value !== 'number') {
    return res.status(400).json({ message: 'Value must be a number' });
  }

  try {
    const result = await dbConnect16("sellingId", value); // Fixed use of ID

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'Counter not found' });
    }

    res.status(200).json({
      message: 'Counter updated successfully',
      matchedCount: result.matchedCount,
      modifiedCount: result.modifiedCount
    });
  } catch (err) {
    console.error("Error updating counter:", err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}); 


/* Mutual Funds */ 

app.post('/FundsHoldings', async (req, res) => {
  try {
    const data = req.body;
    const holding = Array.isArray(data) ? data : [data];
    const result = await PostingFundsHoldings(holding);  
    res.status(200).json({
      message: 'Stocks Added',
      insertedCount: result.insertedCount,
      insertedIds: result.insertedIds
    });
  } catch (err) {
    console.error('Error adding Stock:', err);
    res.status(500).send('Internal Server Error');
  }
});

app.put('/MutualHoldings/:_id', async (req, res) => {
  const { Quantity } = req.body;
  const { _id } = req.params;

  if (typeof Quantity !== 'number') {
    return res.status(400).json({ message: 'Quantity must be a number' });
  }

  try {
    const result = await UpdatingFunds(_id, Quantity);

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'Holding not found' });
    }

    res.status(200).json({
      message: 'Quantity updated successfully',
      matchedCount: result.matchedCount,
      modifiedCount: result.modifiedCount
    });
  } catch (err) {
    console.error("Error updating holding:", err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}); 
app.delete('/MutualHoldings/:_id', async (req, res) => {
  try {
    const { _id } = req.params;
    const result = await DeletingFundHoldings(_id);
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }
    res.status(200).json({ message: 'Item deleted' });
  } catch (err) {
    console.error('Error deleting item:', err);
    res.status(500).send('Internal Server Error');
  }
}); 


app.get('/Profile/FundsBoughts/:Userid', async (req, res) => {
   try {
    const { Userid } = req.params;
    const data = await FundsBought(Userid);
    res.send(data); 
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: "Failed to fetch sold stocks" });
  }
}) 

app.post('/FundsBuying', async (req, res) => {
  try {
    const data = req.body;

    const boughts = Array.isArray(data) ? data : [data];
  
    const result = await FundsBuying(boughts);
    res.status(200).json({
      message: 'Stocks Added',
      insertedCount: result.insertedCount,
      insertedIds: result.insertedIds
    });
  } catch (err){
     console.error('Error adding Stock', err);
        res.status(500).send('Internal Server Error');
  }
}) 

app.post('/SoldFunds', async (req, res) => {
  try {
    const data = req.body;
  
    const StockSold = Array.isArray(data) ? data : [data];
 const result = await SoldingFunds(StockSold);
    res.status(200).json({
      message: 'Stock Sold',
      insertedCount: result.insertedCount,
      insertedIds: result.insertedIds 
    });
  } catch (err) {
    console.error('Error adding user', err);
        res.status(500).send('Internal Server Error');
  }
})

app.get('/Profile/SoldFunds/:Userid', async (req, res) => {
   try {
    const { Userid } = req.params;
    const data = await SoldFunds(Userid);
    res.send(data); 
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: "Failed to fetch sold stocks" });
  }
}) 

app.get('/Profile/FundsHoldings/:Userid', async (req, res) => {
  try {
    const { Userid } = req.params;
    const data = await FundsHoldings(Userid);
    res.send(data); 
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: "Failed to fetch Holdings" });
  }
}) 