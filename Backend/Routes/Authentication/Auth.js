import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import CreateUser from "../../Database/User/CreatingUser.js";
import GetUser from "../../Database/User/GetUser.js";
dotenv.config();
const router = express.Router();
import crypto from "crypto";
import SibApiV3Sdk from "sib-api-v3-sdk";

const defaultClient = SibApiV3Sdk.ApiClient.instance;

const apiKey = defaultClient.authentications["api-key"];

apiKey.apiKey = process.env.BREVO_API_KEY;

const emailApi = new SibApiV3Sdk.TransactionalEmailsApi();

const pendingSignups = new Map();

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

//OTP and EMAIL VERIFICATION

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
    await emailApi.sendTransacEmail({
      sender: {
        email: "nneurostock@gmail.com",
        name: "NeuroStock",
      },
      to: [
        {
          email: email,
        },
      ],
      subject: "Your NeuroStock OTP",
      htmlContent: `
<div style="background: linear-gradient(135deg, #f8fafc 0%, #eef2ff 100%); padding: 40px 16px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">

  <div style="max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 24px; padding: 40px 24px; box-shadow: 0 10px 40px rgba(15, 23, 42, 0.06); border: 1px solid rgba(99, 102, 241, 0.08);">

    <!-- Logo Badge -->
    <div style="text-align:center; margin-bottom:32px;">
      <div style="display:inline-block; padding:8px 18px; background:linear-gradient(135deg,#6366f1,#8b5cf6); border-radius:999px;">
        <span style="color:white; font-size:12px; font-weight:600; letter-spacing:1.5px; text-transform:uppercase;">
          NeuroStock
        </span>
      </div>
    </div>

    <!-- Heading -->
    <div style="text-align:center; margin-bottom:32px;">
      <h1 style="margin:0; font-size:24px; font-weight:700; color:#111827;">
        Verify Your Identity
      </h1>

      <p style="margin-top:12px; color:#6b7280; font-size:15px; line-height:1.6;">
        Use the verification code below to continue creating your NeuroStock account.
      </p>
    </div>

    <!-- OTP Area -->
    <div style="background:linear-gradient(135deg,#f8faff,#eef4ff); border:1px solid #dbeafe; border-radius:18px; padding:24px 16px; text-align:center;">

      <div style="font-size:11px; color:#6366f1; font-weight:700; letter-spacing:2px; text-transform:uppercase; margin-bottom:16px;">
        Verification Code
      </div>

      <div style="background:#ffffff; border:1px solid #e5e7eb; border-radius:12px; padding:16px 12px; text-align:center; box-shadow:0 4px 20px rgba(99,102,241,0.08);">
        <span style="display:inline-block; font-size:28px; font-weight:800; color:#111827; letter-spacing:6px; margin-right:-6px; line-height:1; white-space:nowrap;">
          ${otp}
        </span>
      </div>

      <p style="margin-top:16px; margin-bottom:0; color:#6b7280; font-size:13px;">
        This code will expire in <strong>10 minutes</strong>
      </p>

    </div>

    <!-- Message -->
    <div style="margin-top:32px;">
      <p style="color:#6b7280; font-size:14px; text-align:center; line-height:1.6; margin:0;">
        If you didn't request this verification code, you can safely ignore this email.
      </p>
    </div>

    <!-- Security Note -->
    <div style="margin-top:24px; background:#f8fafc; border-radius:12px; padding:16px;">
      <p style="margin:0; font-size:13px; color:#64748b; text-align:center; line-height:1.5;">
        For your security, never share this code with anyone. NeuroStock will never ask for your OTP.
      </p>
    </div>

    <!-- Footer -->
    <div style="margin-top:32px; border-top:1px solid #f1f5f9; padding-top:24px; text-align:center;">
      <p style="margin:0; color:#94a3b8; font-size:12px;">
        © 2026 NeuroStock · Smart Investing. Secure Trading.
      </p>
    </div>

  </div>

</div>
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

    await emailApi.sendTransacEmail({
      sender: {
        email: "nneurostock@gmail.com",
        name: "NeuroStock",
      },
      to: [
        {
          email: email,
        },
      ],
      subject: "Your NeuroStock OTP",
      htmlContent: `
<div style="background: linear-gradient(135deg, #f8fafc 0%, #eef2ff 100%); padding: 40px 16px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">

  <div style="max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 24px; padding: 40px 24px; box-shadow: 0 10px 40px rgba(15, 23, 42, 0.06); border: 1px solid rgba(99, 102, 241, 0.08);">

    <!-- Logo Badge -->
    <div style="text-align:center; margin-bottom:32px;">
      <div style="display:inline-block; padding:8px 18px; background:linear-gradient(135deg,#6366f1,#8b5cf6); border-radius:999px;">
        <span style="color:white; font-size:12px; font-weight:600; letter-spacing:1.5px; text-transform:uppercase;">
          NeuroStock
        </span>
      </div>
    </div>

    <!-- Heading -->
    <div style="text-align:center; margin-bottom:32px;">
      <h1 style="margin:0; font-size:24px; font-weight:700; color:#111827;">
        Verify Your Identity
      </h1>

      <p style="margin-top:12px; color:#6b7280; font-size:15px; line-height:1.6;">
        Use the verification code below to continue creating your NeuroStock account.
      </p>
    </div>

    <!-- OTP Area -->
    <div style="background:linear-gradient(135deg,#f8faff,#eef4ff); border:1px solid #dbeafe; border-radius:18px; padding:24px 16px; text-align:center;">

      <div style="font-size:11px; color:#6366f1; font-weight:700; letter-spacing:2px; text-transform:uppercase; margin-bottom:16px;">
        Verification Code
      </div>

      <div style="background:#ffffff; border:1px solid #e5e7eb; border-radius:12px; padding:16px 12px; text-align:center; box-shadow:0 4px 20px rgba(99,102,241,0.08);">
        <span style="display:inline-block; font-size:28px; font-weight:800; color:#111827; letter-spacing:6px; margin-right:-6px; line-height:1; white-space:nowrap;">
          ${otp}
        </span>
      </div>

      <p style="margin-top:16px; margin-bottom:0; color:#6b7280; font-size:13px;">
        This code will expire in <strong>10 minutes</strong>
      </p>

    </div>

    <!-- Message -->
    <div style="margin-top:32px;">
      <p style="color:#6b7280; font-size:14px; text-align:center; line-height:1.6; margin:0;">
        If you didn't request this verification code, you can safely ignore this email.
      </p>
    </div>

    <!-- Security Note -->
    <div style="margin-top:24px; background:#f8fafc; border-radius:12px; padding:16px;">
      <p style="margin:0; font-size:13px; color:#64748b; text-align:center; line-height:1.5;">
        For your security, never share this code with anyone. NeuroStock will never ask for your OTP.
      </p>
    </div>

    <!-- Footer -->
    <div style="margin-top:32px; border-top:1px solid #f1f5f9; padding-top:24px; text-align:center;">
      <p style="margin:0; color:#94a3b8; font-size:12px;">
        © 2026 NeuroStock · Smart Investing. Secure Trading.
      </p>
    </div>

  </div>

</div>
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

console.log("CREATE USER RESULT:", result);

if (result?.insertedId || result?.insertedIds || result?.acknowledged) {
  try {
    const mailResponse = await emailApi.sendTransacEmail({
      sender: {
        email: "nneurostock@gmail.com",
        name: "NeuroStock",
      },
      to: [
        {
          email,
          name: `${firstName} ${lastName}`,
        },
      ],
      subject: "🚀 Welcome to NeuroStock",
      htmlContent: `
<div style="background:linear-gradient(135deg,#f8fafc,#eef2ff);padding:60px 20px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">

  <div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 12px 40px rgba(15,23,42,.08);">

    <div style="background:linear-gradient(135deg,#6366f1,#8b5cf6);padding:48px;text-align:center;">
      <h1 style="color:white;margin:0;font-size:34px;font-weight:800;">
        Welcome to NeuroStock
      </h1>

      <p style="color:rgba(255,255,255,.92);margin-top:12px;font-size:16px;">
        Smart Investing. Intelligent Decisions.
      </p>
    </div>

    <div style="padding:48px;">

      <h2 style="margin-top:0;color:#111827;">
        Welcome aboard, ${firstName}! 🎉
      </h2>

      <p style="font-size:16px;color:#4b5563;line-height:1.8;">
        Your NeuroStock account has been successfully created and you're now ready to explore a smarter way of tracking, analyzing, and understanding the market.
      </p>

      <div style="
        background:linear-gradient(135deg,#f8faff,#eef4ff);
        border:1px solid #dbeafe;
        border-radius:18px;
        padding:28px;
        margin:32px 0;
      ">

        <h3 style="margin-top:0;color:#4338ca;">
          Your Account Details
        </h3>

        <p style="margin:8px 0;color:#374151;">
          <strong>Name:</strong> ${firstName} ${lastName}
        </p>

        <p style="margin:8px 0;color:#374151;">
          <strong>Email:</strong> ${email}
        </p>

        <p style="margin:8px 0;color:#374151;">
          <strong>Status:</strong> Active ✅
        </p>

      </div>

      <div style="
        background:#f9fafb;
        border-radius:16px;
        padding:24px;
        margin:30px 0;
      ">
        <p style="margin:10px 0;color:#374151;">📈 Track Stocks & Market Trends</p>
        <p style="margin:10px 0;color:#374151;">🤖 AI-Powered Predictions</p>
        <p style="margin:10px 0;color:#374151;">💼 Portfolio Monitoring</p>
        <p style="margin:10px 0;color:#374151;">⚡ Real-Time Insights</p>
      </div>

      <div style="text-align:center;margin:40px 0;">
        <a href="https://neuro-stock.vercel.app"
           style="
             background:linear-gradient(135deg,#6366f1,#8b5cf6);
             color:white;
             text-decoration:none;
             padding:16px 34px;
             border-radius:14px;
             display:inline-block;
             font-weight:700;
             font-size:15px;
           ">
          Launch NeuroStock →
        </a>
      </div>

      <p style="font-size:15px;color:#6b7280;line-height:1.8;">
        Thank you for joining NeuroStock. We are excited to be part of your investing journey and help you make better financial decisions with technology and data.
      </p>

    </div>

    <div style="
      border-top:1px solid #e5e7eb;
      padding:24px;
      text-align:center;
      color:#64748b;
      font-size:13px;
    ">
      © 2026 NeuroStock • Secure Investing Platform
    </div>

  </div>

</div>
`
    });
    console.log("WELCOME EMAIL RESPONSE:", mailResponse);
  } catch (mailErr) {
    console.error("WELCOME EMAIL FAILED:", mailErr);
    console.error(JSON.stringify(mailErr, null, 2));
  }
}

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





