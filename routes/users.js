const express = require("express");
const router = express.Router();
const SHA256 = require("crypto-js/sha256");
const encBase64 = require("crypto-js/enc-base64");
const uid2 = require("uid2");
const cloudinary = require("cloudinary").v2;

const User = require("../models/User");

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

// SIGN UP

router.post("/user/signup", async (req, res) => {
  try {
    if (!req.fields.username) {
      res.status(400).json({ message: "Please enter a valid username." });
    }
    const user = await User.findOne({ email: req.fields.email });

    if (user) {
      res.status(400).json({ error: { message: "User already exists." } });
    } else {
      //Password generator
      const salt = uid2(32);
      const hash = SHA256(req.fields.password + salt).toString(encBase64);
      const token = uid2(16);

      const newUser = new User({
        email: req.fields.email,
        account: {
          username: req.fields.username,
          avatar: {},
        },
        newsletter: req.fields.newsletter,
        salt: salt,
        hash: hash,
        token: token,
      });

      // Profil picture
      if (req.files.picture) {
        const profilPicture = await cloudinary.uploader.upload(
          req.files.picture.path
        );
        newUser.account.avatar = profilPicture.secure_url;
      }
      await newUser.save();

      res.status(200).json({
        message: "Account created !",
        _id: newUser.id,
        token: newUser.token,
        account: newUser.account,
      });
    }
  } catch (error) {
    res.status(400).json({ error: { message: error.message } });
  }
});

// LOG IN
router.post("/user/login", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.fields.email });
    if (user) {
      const hash = SHA256(req.fields.password + user.salt).toString(encBase64);

      if (user.hash === hash) {
        res.status(200).json({
          message: "You are now logged in !",
          _id: user.id,
          token: user.token,
          account: user.account,
        });
      } else {
        res.status(401).json({ message: "Invalid email or password." });
      }
    } else {
      res.status(401).json({ message: "invalid email or password." });
    }
  } catch (error) {
    res.status(400).json({ error: { message: error.message } });
  }
});

module.exports = router;
