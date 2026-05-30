import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import CreateUser from "../../Database/User/CreatingUser.js";
import GetUser from "../../Database/User/GetUser.js";
dotenv.config();
const router = express.Router();
import nodemailer from "nodemailer";
import crypto from "crypto";

const pendingSignups = new Map();

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});
transporter.verify((error, success) => {
  if (error) {
    console.error("SMTP Error:", error);
  } else {
    console.log("SMTP Server Ready");
  }
});

const isProduction = process.env.NODE_ENV === "production";
const authCookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? "none" : "strict",
  maxAge: 60 * 60 * 1000,
  path: "/",
};

const clearAuthCookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? "none" : "strict",
  path: "/",
};



//OTP VERIFICATION

router.post("/Auth/Signup/InitiateOtp", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    // Check if user already exists
    const existingUser = await GetUser(email);
    if (existingUser) {
      return res.status(409).json({ message: "User already exists" });
    }

    // Generate a 6-digit OTP
    const otp = crypto.randomInt(100000, 999999).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    // Store only email + OTP (no user data needed here anymore)
    pendingSignups.set(email, { otp, expiresAt });

    // Send OTP email
    await transporter.sendMail({
      from: `"NeuroStock" <${process.env.MAIL_USER}>`,
      to: email,
      subject: "Your NeuroStock OTP",
      html: `
        <h2>Verify your email</h2>
        <p>Your one-time password is:</p>
        <h1 style="letter-spacing: 8px;">${otp}</h1>
        <p>This OTP expires in <strong>10 minutes</strong>.</p>
      `,
    });

    return res.status(200).json({ message: "OTP sent to email" });

  } catch (err) {
    console.error("InitiateOtp error:", err);
    return res.status(500).json({ error: "Failed to send OTP" });
  }
});



// Resend OTP 
router.post("/Auth/Signup/ResendOtp", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    // Check if user already exists
    const existingUser = await GetUser(email);
    if (existingUser) {
      return res.status(409).json({ message: "User already exists" });
    }

    // Generate fresh OTP regardless of whether one existed before
    const otp = crypto.randomInt(100000, 999999).toString();
    pendingSignups.set(email, { otp, expiresAt: Date.now() + 10 * 60 * 1000 });

    await transporter.sendMail({
      from: `"NeuroStock" <${process.env.MAIL_USER}>`,
      to: email,
      subject: "Your new NeuroStock OTP",
      html: `
        <h2>New OTP requested</h2>
        <p>Your new one-time password is:</p>
        <h1 style="letter-spacing: 8px;">${otp}</h1>
        <p>This OTP expires in <strong>10 minutes</strong>.</p>
      `,
    });

    return res.status(200).json({ message: "New OTP sent" });

  } catch (err) {
    console.error("ResendOtp error:", err);
    return res.status(500).json({ error: "Failed to resend OTP" });
  }
});




router.post('/Auth/Signup', async (req, res) => {
  try {
    const { firstName, lastName, email, password, otp } = req.body; // added otp

    if (!firstName || !email || !password || !lastName) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // ── OTP CHECK ──────────────────────────────────────────
    if (!otp) {
      return res.status(400).json({ message: "OTP is required" });
    }

    const pending = pendingSignups.get(email);

    if (!pending) {
      return res.status(404).json({ message: "No OTP found. Please request one first." });
    }
    if (Date.now() > pending.expiresAt) {
      pendingSignups.delete(email);
      return res.status(410).json({ message: "OTP expired. Please request a new one." });
    }
    if (pending.otp !== otp) {
      return res.status(401).json({ message: "Invalid OTP." });
    }

    pendingSignups.delete(email); // single use — remove after success
    // ── END OTP CHECK ──────────────────────────────────────

    const existingUser = await GetUser(email);
    if (existingUser) {
      return res.status(409).json({ message: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPass = await bcrypt.hash(password, salt);

    const newUser = {
      firstName,
      lastName,
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
      Userid: existingUser._id.toString(),
      firstName: existingUser.firstName,
      lastName: existingUser.lastName,
      Email: existingUser.email,
    };
    const token = jwt.sign(tokenData, process.env.TOKEN_SECRET, { expiresIn: "1h" });

    // set JWT in httpOnly cookie
    res.cookie("token", token, authCookieOptions);


    return res.status(200).json({
      message: "Login Successful",
      success: true,
      user: {
        Userid: existingUser._id,
        firstName: existingUser.firstName,
        lastName: existingUser.lastName,
        Email: existingUser.email,
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
    res.clearCookie("token", clearAuthCookieOptions);

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

  if (!token) {
    return res.status(401).json({ loggedIn: false });
  }

  try {
    const decoded = jwt.verify(token, process.env.TOKEN_SECRET);
    return res.json({ loggedIn: true, user: decoded });
  } catch {
    return res.status(401).json({ loggedIn: false });
  }
});



export default router;





