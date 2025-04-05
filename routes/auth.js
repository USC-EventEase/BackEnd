const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const fs = require("fs");

const router = express.Router();

// Load secret for JWT from Docker secrets or environment
const JWT_SECRET = process.env.JWT_SECRET || (fs.existsSync("/run/secrets/jwt_secret") ? fs.readFileSync("/run/secrets/jwt_secret", "utf8").trim() : null);

if (!JWT_SECRET) {
  console.error("❌ Missing JWT Secret!");
  process.exit(1);
}

// Signup Route
router.post("/signup", async (req, res) => {
    try {
      const { name, email, password } = req.body;
  
    //   console.log("📌 Received Request:", req.body); // Debugging
  
      if (!name || !email || !password) {
        console.log(name, email, password);
        return res.status(400).json({ message: "All fields are required" });
      }
  
      let user = await User.findOne({ email });
      if (user) return res.status(400).json({ message: "User already exists" });
  
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
  
      user = new User({ name, email, password: hashedPassword });
  
      await user.save();
    //   console.log("✅ User Created:", user); // Debugging
  
      res.status(201).json({ message: "User registered successfully" });
    } catch (err) {
      console.error("❌ Server Error:", err);
      res.status(500).json({ message: "Server Error: " + err.message });
    }
  });
  

// Login Route
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid email or password" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid email or password" });

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: "1h" });

    res.status(200).json({ token, userId: user._id });
  } catch (err) {
    res.status(500).json({ message: "Server Error: "+err });
  }
});

module.exports = router;
