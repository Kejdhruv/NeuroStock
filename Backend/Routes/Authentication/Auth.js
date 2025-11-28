import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv"; 
import CreateUser from "../../Database/User/CreatingUser.js";
import GetUser from "../../Database/User/GetUser.js";
dotenv.config();
const router = express.Router();

// User Signup
router.post('/Auth/Signup', async (req, res) => {
  try {
    const { firstName , lastName , email , password } = req.body;
    if (!firstName || !email || !password || !lastName) {
      return res.status(400).json({ message: "All fields are required" });
    }

    
    const existingUser = await GetUser(email); 
    if (existingUser) {
      return res.status(409).json({ message: "User already exists" });
    }

    // hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPass = await bcrypt.hash(password, salt); 

    const newUser = {
      firstName,
      lastName , 
      email,
      password: hashedPass,
      createdAt: new Date()
    }; 

    const result = await CreateUser([newUser]); 

    return res.status(201).json({
      message: "User added successfully",
      insertedId: result.insertedId
    }); 

  } catch (err) {
    console.error("Error Adding User", err);
    return res.status(500).json({ error: "Internal server error while adding data" });
  }
}); 




// User Login 
router.post('/Auth/Login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

   
    const existingUser = await GetUser(email); 
    if (!existingUser) {
      return res.status(404).json({ message: "User doesn't exist" });
    }

    
    const validPassword = await bcrypt.compare(password, existingUser.password);
    if (!validPassword) {
      return res.status(401).json({ message: "Incorrect Password" });
    }

    // generate JWT
    const tokenData = {
      UserId: existingUser._id.toString(), 
      firstName : existingUser.firstName , 
      lastName : existingUser.lastName , 
      email: existingUser.email,
    };
    const token = jwt.sign(tokenData, process.env.TOKEN_SECRET, { expiresIn: "1h" });

    // set JWT in httpOnly cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", 
      sameSite: "strict",
      maxAge: 60 * 60 * 1000, 
      path: "/",
    });

    
    return res.status(200).json({
      message: "Login Successful",
      success: true,
      user: {
        userId: existingUser._id,
        username: existingUser.username,
        email: existingUser.email,
        role:existingUser.role , 
      },
    });
  } catch (err) {
    console.error("Error Logging In", err);
    return res.status(500).json({ error: "Internal Server Error while logging in" });
  }
});

// User Logout 
router.get('/Auth/Logout', async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
    });

    return res.status(200).json({
      message: "Logout Successful",
      success: true
    });
  } catch (err) {
    console.error("Error Logout", err);
    return res.status(500).json({ error: "Internal Error while Logging Out" });
  }
});

//User Information 
router.get("/Auth/Me", (req, res) => {
  const token = req.cookies?.token;
  const decoded = jwt.verify(token, process.env.TOKEN_SECRET);
  res.json({ loggedIn: true, user: decoded });
});



export default router; 






