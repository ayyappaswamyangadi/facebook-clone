require("dotenv").config();
const auth = require("express").Router();
const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// Register new user
auth.post("/register", async (req, res) => {
  try {
    const { userName, email, password } = req.body;

    if (!userName || !email || !password) {
      return res.status(400).json("Username, email, and password are required.");
    }
    if (password.length < 6) {
      return res.status(400).json("Password must be at least 6 characters.");
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      userName,
      email,
      password: hashedPassword,
    });

    await newUser.save();
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
      return res.status(404).json("User not found.");
    }

    const validatePassword = await bcrypt.compare(
      req.body.password,
      user.password
    );
    if (!validatePassword) {
      return res.status(400).json("Wrong password.");
    }

    const accessToken = jwt.sign(
      { id: user._id, isAdmin: user.isAdmin },
      process.env.MY_JWT_SECRET_KEY,
      { expiresIn: "15m" }
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

// Forgot password — reset by email (no email token; direct reset)
auth.post("/forgot-password", async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    if (!email || !newPassword) {
      return res.status(400).json("Email and new password are required.");
    }
    if (newPassword.length < 6) {
      return res.status(400).json("Password must be at least 6 characters.");
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user) {
      return res.status(404).json("No account found with that email address.");
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    await User.findByIdAndUpdate(user._id, { $set: { password: hashedPassword } });

    res.status(200).json("Password reset successful.");
  } catch (err) {
    console.log(err);
    res.status(500).json("Something went wrong. Please try again.");
  }
});

const verify = (req, res, next) => {
  const token = req.cookies.access_token;
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
