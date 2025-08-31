const mongoose = require("mongoose");

const User = require("../models/User.model");

const router = require("express").Router();

// Get all Users
router.get("/", async (req, res) => {
  try {
    const Users = await User.find().select("-password");
    res.status(200).json(Users);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

// Post a new User
router.post("/", async (req, res) => {
  try {
    const {email, password } = req.body;
    const newUser = new User({ email, passwordHash: password });
    const savedUser = await newUser.save();
    res.status(201).json(savedUser);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

module.exports = router;