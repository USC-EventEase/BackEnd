const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const fs = require("fs");
require('./jobs/dynamicPrice')(); 
const initSaltJob = require('./jobs/saltUpdate');


dotenv.config();
const app = express();

// Load secrets from Docker secrets if running in a container
const MONGO_URI = process.env.MONGO_URI || (fs.existsSync("/run/secrets/mongo_uri") ? fs.readFileSync("/run/secrets/mongo_uri", "utf8").trim() : null);
const JWT_SECRET = process.env.JWT_SECRET || (fs.existsSync("/run/secrets/jwt_secret") ? fs.readFileSync("/run/secrets/jwt_secret", "utf8").trim() : null);

// Ensure secrets are loaded
if (!MONGO_URI || !JWT_SECRET) {
  console.error("❌ Missing required environment variables!");
  process.exit(1);
}

// Middleware
app.use(express.json());
app.use(cors());

// Routes
const authRoutes = require("./routes/auth");
const adminRoutes = require("./routes/adminRoutes")
const userRoutes = require("./routes/userRoutes")
const analyticsRoutes = require("./routes/analytics");
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/user", userRoutes);
app.use("/api/analytics", analyticsRoutes);


// MongoDB Connection (Only if not in test mode)
if (process.env.NODE_ENV !== "test") {
  mongoose
    .connect(MONGO_URI)
    .then(() => console.log("✅ Connected to MongoDB Cloud"))
    .catch((err) => console.error("❌ MongoDB Connection Failed", err));
}

// Start Server **Only if not running tests**
let server;
if (process.env.NODE_ENV !== "test") {
  initSaltJob();
  const PORT = process.env.PORT || 5000;
  server = app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
}

// Export app and server (Important for testing)
module.exports = { app, server };
