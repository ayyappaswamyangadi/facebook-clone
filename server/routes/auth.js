require("dotenv").config();
const auth = require("express").Router();
const User = require("../models/User");
const Otp = require("../models/Otp");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendOtpEmail = async (to, otp, purpose) => {
  const subject =
    purpose === "register" ? "Verify your email - Facebook" : "Reset your password - Facebook";
  const action =
    purpose === "register"
      ? "complete your account registration"
      : "reset your password";

  await transporter.sendMail({
    from: `"Facebook Clone" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;padding:24px;border:1px solid #e0e0e0;border-radius:8px;">
        <h2 style="color:#1877f2;">Your verification code</h2>
        <p>Use the code below to ${action}. It expires in <strong>10 minutes</strong>.</p>
        <div style="font-size:36px;font-weight:bold;letter-spacing:8px;color:#1877f2;padding:16px 0;">${otp}</div>
        <p style="color:#888;font-size:13px;">If you didn't request this, you can safely ignore this email.</p>
      </div>
    `,
  });
};

const sendAdminNotificationEmail = async (adminEmail, userData) => {
  await transporter.sendMail({
    from: `"Facebook Clone" <${process.env.EMAIL_USER}>`,
    to: adminEmail,
    subject: "New User Registration – Facebook Clone",
    html: `
      <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;padding:24px;border:1px solid #e0e0e0;border-radius:8px;">
        <h2 style="color:#1877f2;">New User Registered</h2>
        <p>A new account was created on Facebook Clone.</p>
        <table style="width:100%;border-collapse:collapse;margin:16px 0;">
          <tr><td style="padding:8px 12px;font-weight:bold;color:#65676b;background:#f7f8fa;">Username</td><td style="padding:8px 12px;">${userData.userName}</td></tr>
          <tr><td style="padding:8px 12px;font-weight:bold;color:#65676b;">Email</td><td style="padding:8px 12px;">${userData.email}</td></tr>
          <tr><td style="padding:8px 12px;font-weight:bold;color:#65676b;background:#f7f8fa;">Registered At</td><td style="padding:8px 12px;background:#f7f8fa;">${new Date().toLocaleString()}</td></tr>
        </table>
      </div>
    `,
  });
};

// Send OTP — used for both register and reset flows
auth.post("/send-otp", async (req, res) => {
  try {
    const { email, purpose } = req.body;

    if (!email || !["register", "reset"].includes(purpose)) {
      return res.status(400).json("Email and a valid purpose are required.");
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await User.findOne({ email: normalizedEmail });

    if (purpose === "register" && existingUser) {
      return res.status(400).json("An account with this email already exists.");
    }
    if (purpose === "reset" && !existingUser) {
      return res.status(404).json("No account found with that email address.");
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    await Otp.deleteMany({ email: normalizedEmail, purpose });
    await new Otp({ email: normalizedEmail, otp, purpose }).save();

    await sendOtpEmail(normalizedEmail, otp, purpose);

    res.status(200).json("OTP sent to your email address.");
  } catch (err) {
    console.log(err);
    res.status(500).json("Failed to send OTP. Please try again.");
  }
});

// Register new user (requires OTP verification)
auth.post("/register", async (req, res) => {
  try {
    const { userName, email, password, otp } = req.body;

    if (!userName || !email || !password || !otp) {
      return res.status(400).json("All fields including OTP are required.");
    }
    if (password.length < 6) {
      return res.status(400).json("Password must be at least 6 characters.");
    }

    const normalizedEmail = email.trim().toLowerCase();
    const otpRecord = await Otp.findOne({ email: normalizedEmail, purpose: "register" });

    if (!otpRecord || otpRecord.otp !== otp.trim()) {
      return res.status(400).json("Invalid or expired OTP. Please request a new one.");
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({ userName, email: normalizedEmail, password: hashedPassword });
    await newUser.save();

    await Otp.deleteMany({ email: normalizedEmail, purpose: "register" });

    if (process.env.ADMIN_EMAIL) {
      sendAdminNotificationEmail(process.env.ADMIN_EMAIL, { userName, email: normalizedEmail })
        .catch(err => console.error("Admin notification failed:", err));
    }

    res.status(200).json("Registration successful.");
  } catch (err) {
    console.log(err);
    if (err.code === 11000) {
      res.status(400).json("Username or email already exists.");
    } else {
      res.status(500).json("Something went wrong. Please try again.");
    }
  }
});

// User login
auth.post("/login", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(404).json("Invalid credentials");
    }

    const validatePassword = await bcrypt.compare(req.body.password, user.password);
    if (!validatePassword) {
      return res.status(400).json("Invalid credentials");
    }

    const accessToken = jwt.sign(
      { id: user._id, isAdmin: user.isAdmin },
      process.env.MY_JWT_SECRET_KEY,
      { expiresIn: "7d" }
    );

    res
      .cookie("access_token", accessToken, { httpOnly: true })
      .status(200)
      .json({
        userName: user.userName,
        isAdmin: user.isAdmin,
        _id: user._id,
        accessToken,
        profilePicture: user.profilePicture,
        coverPicture: user.coverPicture,
        followers: user.followers,
        following: user.following,
        desc: user.desc,
        city: user.city,
        from: user.from,
        createdAt: user.createdAt,
      });
  } catch (err) {
    console.log(err);
    res.status(500).json("Something went wrong. Please try again.");
  }
});

// Forgot password (requires OTP verification)
auth.post("/forgot-password", async (req, res) => {
  try {
    const { email, newPassword, otp } = req.body;

    if (!email || !newPassword || !otp) {
      return res.status(400).json("Email, new password, and OTP are required.");
    }
    if (newPassword.length < 6) {
      return res.status(400).json("Password must be at least 6 characters.");
    }

    const normalizedEmail = email.trim().toLowerCase();
    const otpRecord = await Otp.findOne({ email: normalizedEmail, purpose: "reset" });

    if (!otpRecord || otpRecord.otp !== otp.trim()) {
      return res.status(400).json("Invalid or expired OTP. Please request a new one.");
    }

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(404).json("No account found with that email address.");
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    await User.findByIdAndUpdate(user._id, { $set: { password: hashedPassword } });

    await Otp.deleteMany({ email: normalizedEmail, purpose: "reset" });

    res.status(200).json("Password reset successful.");
  } catch (err) {
    console.log(err);
    res.status(500).json("Something went wrong. Please try again.");
  }
});

const verify = (req, res, next) => {
  const cookieToken = req.cookies?.access_token;
  const authHeader = req.headers.authorization;
  const bearerToken = authHeader?.startsWith("Bearer ")
    ? authHeader.split(" ")[1]
    : null;
  const token = cookieToken || bearerToken;

  if (token) {
    jwt.verify(token, process.env.MY_JWT_SECRET_KEY, (err, user) => {
      if (err) {
        return res.status(403).json("Token is not valid.");
      }
      req.user = user;
      next();
    });
  } else {
    res.status(401).json("You are not authenticated.");
  }
};

auth.get("/", (_req, res) => {
  res.send("Auth route is working.");
});

module.exports = auth;
module.exports.verify = verify;
