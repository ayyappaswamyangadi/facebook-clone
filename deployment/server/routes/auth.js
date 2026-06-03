require("dotenv").config();
const auth = require("express").Router();
const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// Register user
auth.post("/register", async (req, res) => {
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    const newUser = new User({
      userName: req.body.userName,
      email: req.body.email,
      password: hashedPassword,
      profilePicture: req.body.profilePicture || "",
      coverPicture: req.body.coverPicture || "",
      desc: req.body.desc || "",
      city: req.body.city || "",
      from: req.body.from || "",
    });

    const user = await newUser.save();

    const accessToken = jwt.sign(
      { id: user._id, isAdmin: user.isAdmin },
      process.env.MY_JWT_SECRET_KEY,
      { expiresIn: "7d" }
    );

    res
      .cookie("access_token", accessToken, {
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        sameSite: "lax",
      })
      .status(200)
      .json({
        _id: user._id,
        userName: user.userName,
        email: user.email,
        isAdmin: user.isAdmin,
        accessToken,
        profilePicture: user.profilePicture,
        coverPicture: user.coverPicture,
        followers: user.followers,
        following: user.following,
        desc: user.desc,
        city: user.city,
        from: user.from,
        relationship: user.relationship,
        createdAt: user.createdAt,
      });
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

// Login
auth.post("/login", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(404).json("user not found");

    const validatePassword = await bcrypt.compare(
      req.body.password,
      user.password
    );
    if (!validatePassword) return res.status(400).json("wrong password");

    const accessToken = jwt.sign(
      { id: user._id, isAdmin: user.isAdmin },
      process.env.MY_JWT_SECRET_KEY,
      { expiresIn: "7d" }
    );

    res
      .cookie("access_token", accessToken, {
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        sameSite: "lax",
      })
      .status(200)
      .json({
        _id: user._id,
        userName: user.userName,
        email: user.email,
        isAdmin: user.isAdmin,
        accessToken,
        profilePicture: user.profilePicture,
        coverPicture: user.coverPicture,
        followers: user.followers,
        following: user.following,
        desc: user.desc,
        city: user.city,
        from: user.from,
        relationship: user.relationship,
        createdAt: user.createdAt,
      });
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

// Logout
auth.post("/logout", (req, res) => {
  res
    .clearCookie("access_token")
    .status(200)
    .json("logged out successfully");
});

// Forgot / Reset Password
// Simple direct reset (no email token for demo app).
// User provides their email + new password and it's updated immediately.
auth.post("/forgot-password", async (req, res) => {
  const { email, newPassword } = req.body;

  if (!email || !newPassword) {
    return res.status(400).json("Email and new password are required.");
  }
  if (newPassword.length < 6) {
    return res.status(400).json("Password must be at least 6 characters.");
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json("No account found with that email address.");
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await User.findByIdAndUpdate(user._id, { password: hashedPassword });
    res.status(200).json("Password reset successful.");
  } catch (err) {
    console.log(err);
    res.status(500).json("Something went wrong. Please try again.");
  }
});

// Verify JWT middleware — supports httpOnly cookie OR Bearer token header
const verify = (req, res, next) => {
  let token = req.cookies.access_token;

  if (!token && req.headers.authorization?.startsWith("Bearer ")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (token) {
    jwt.verify(token, process.env.MY_JWT_SECRET_KEY, (err, user) => {
      if (err) return res.status(403).json("token is not valid!");
      req.user = user;
      next();
    });
  } else {
    res.status(401).json("you are not authenticated");
  }
};

auth.get("/", (req, res) => {
  res.send("Auth route is working");
});

module.exports = auth;
module.exports.verify = verify;
