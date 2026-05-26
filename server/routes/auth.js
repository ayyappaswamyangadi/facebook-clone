require("dotenv").config();
const auth = require("express").Router();
const User = require("../models/User");
const bcrypt = require("bcrypt");
const moment = require("moment");
const jwt = require("jsonwebtoken");

//Register new user
auth.post("/register", async (req, res) => {
  try {
    //hashing password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    const createdAtLocalTime = await moment
      .parseZone(req.body.createdAt)
      .format("lll");
    const updatedAtLocalTime = await moment
      .parseZone(req.body.updatedAt)
      .format("lll");

    //creating new user
    const newUser = await new User({
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
      createdAt: createdAtLocalTime,
      updatedAt: updatedAtLocalTime,
      // accessToken,
    });

    //saving user to db
    const user = await newUser.save();
    res.send(user);
    res
      .cookie("access_token", accessToken, { httpOnly: true })
      .status(200)
      .json({
        userName: user.userName,
        isAdmin: user.isAdmin,
        _id: user._id,
        // accessToken,
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
  }
});

//user login process
auth.post("/login", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      res.status(404).json("user not found");
      return;
    }

    const validatePassword = await bcrypt.compare(
      req.body.password,
      user.password,
    );
    if (!validatePassword) {
      res.status(400).json("wrong password");
      return;
    }

    //generate accessToken
    const accessToken = jwt.sign(
      { id: user._id, isAdmin: user.isAdmin },
      process.env.MY_JWT_SECRET_KEY,
      { expiresIn: "15m" },
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

  // if (authHeader) {
  if (token) {
    // const token = authHeader.split(" ")[1];

    jwt.verify(token, process.env.MY_JWT_SECRET_KEY, (err, user) => {
      if (err) {
        return res.status(403).json("token is not valid!");
      }
      req.user = user;
      next();
    });
  } else {
    res.status(401).json("ypu are not authenticated");
  }
};

auth.get("/", (req, res) => {
  res.send("I am in auth page right now");
});

module.exports = auth;
module.exports.verify = verify;
