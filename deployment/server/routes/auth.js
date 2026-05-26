require("dotenv").config();
const auth = require("express").Router();
const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

//Register user dynamically
auth.post("/register", async (req, res) => {
  try {
    //hashing password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    //creating new user
    const newUser = new User({
      userName: req.body.userName,
      email: req.body.email,
      password: hashedPassword,
      profilePicture: req.body.profilePicture,
      coverPicture: req.body.coverPicture,
      followers: req.body.followers,
      following: req.body.following,
      desc: req.body.desc,
      city: req.body.city,
      from: req.body.from,
    });

    //saving user to db
    const user = await newUser.save();

    //generate accessToken AFTER user is saved so user._id is available
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
    res.status(500).json(err);
  }
});

//user login process
auth.post("/login", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(404).json("user not found");

    const validatePassword = await bcrypt.compare(
      req.body.password,
      user.password
    );
    if (!validatePassword) return res.status(400).json("wrong password");

    //generate accessToken
    const accessToken = jwt.sign(
      { id: user._id, isAdmin: user.isAdmin },
      process.env.MY_JWT_SECRET_KEY,
      { expiresIn: "15m" }
    );

    res
      .cookie("access_token", accessToken, {
        httpOnly: true,
      })
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
    res.status(500).json(err);
  }
});

const verify = (req, res, next) => {
  const token = req.cookies.access_token;

  if (token) {
    jwt.verify(token, process.env.MY_JWT_SECRET_KEY, (err, user) => {
      if (err) {
        return res.status(403).json("token is not valid!");
      }
      req.user = user;
      next();
    });
  } else {
    res.status(401).json("you are not authenticated");
  }
};

auth.get("/", (req, res) => {
  res.send("I am in auth page right now");
});

module.exports = auth;
module.exports.verify = verify;
