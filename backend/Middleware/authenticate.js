const jwt = require("jsonwebtoken");
const db = require("../config/db").promise();

// Verifies JWT and confirms the user still exists and is active
exports.authenticate = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Authentication token missing" });
    }

    const token = header.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const [rows] = await db.query(
      "SELECT id, email, role, is_active FROM users WHERE id = ?",
      [decoded.id]
    );
    const user = rows[0];
    if (!user || !user.is_active) {
      return res.status(401).json({ message: "User not found or disabled" });
    }

    req.user = { id: user.id, email: user.email, role: user.role };
    next();
  } catch (err) {
    const message =
      err.name === "TokenExpiredError" ? "Token expired" : "Invalid token";
    return res.status(401).json({ message });
  }
};

// Role guard: authorize("admin") or authorize("admin", "host")
exports.authorize = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({ message: "Access denied" });
  }
  next();
};