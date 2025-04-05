const jwt = require("jsonwebtoken");
const fs = require("fs");

// Load JWT secret from environment variables or Docker secrets
const JWT_SECRET = process.env.JWT_SECRET || (fs.existsSync("/run/secrets/jwt_secret") ? fs.readFileSync("/run/secrets/jwt_secret", "utf8").trim() : null);

if (!JWT_SECRET) {
  console.error("❌ Missing JWT Secret! Authentication middleware will not work.");
  process.exit(1);
}

// Middleware to authenticate users
module.exports = (req, res, next) => {
  // Extract token from Authorization header
  const authHeader = req.header("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Access Denied: No token provided" });
  }

  // Get the actual token (remove "Bearer ")
  const token = authHeader.split(" ")[1];

  try {
    // Verify the token
    const verified = jwt.verify(token, JWT_SECRET);
    req.user = verified; // Attach user info to request
    next(); // Proceed to next middleware
  } catch (err) {
    return res.status(401).json({ message: "Invalid Token" });
  }
};
