const jwt = require("jsonwebtoken");
const fs = require("fs");

// Load JWT secret from environment variables or Docker secrets
const JWT_SECRET = process.env.JWT_SECRET || (fs.existsSync("/run/secrets/jwt_secret") ? fs.readFileSync("/run/secrets/jwt_secret", "utf8").trim() : null);

if (!JWT_SECRET) {
  console.error("❌ Missing JWT Secret! Authentication middleware will not work.");
  process.exit(1);
}

const authenticate = (req, res, next) => {
  const authHeader = req.header("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Access Denied: No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const verified = jwt.verify(token, JWT_SECRET);
    req.user = verified; // Contains userId and type from the token
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid Token" });
  }
};

const authorizeAdmin = (req, res, next) => {
  if (req.user.type !== "admin") {
    return res.status(403).json({ message: "Access denied. Admins only." });
  }
  next();
};

module.exports = {authorizeAdmin, authenticate}
