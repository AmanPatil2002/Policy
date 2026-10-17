const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../config/db").promise(); // adjust path to your db file

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const signToken = (user) =>
  jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "1d" }
  );

// Seeds the default admin once at startup (if it doesn't exist)
exports.seedAdmin = async () => {
  try {
    const email = process.env.ADMIN_EMAIL;
    const password = process.env.ADMIN_PASSWORD;
    if (!email || !password) {
      console.log("ADMIN_EMAIL / ADMIN_PASSWORD missing in .env, skipping admin seed");
      return;
    }

    const [rows] = await db.query("SELECT id FROM users WHERE email = ?", [
      email.toLowerCase(),
    ]);
    if (rows.length) return;

    const hash = await bcrypt.hash(password, 10);
    await db.query(
      "INSERT INTO users (email, password_hash, role) VALUES (?, ?, 'admin')",
      [email.toLowerCase(), hash]
    );
    console.log("Default admin created");
  } catch (err) {
    console.error("Admin seed failed:", err.message);
  }
};

// POST /auth/login  (admin + host)
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [
      email.trim().toLowerCase(),
    ]);
    const user = rows[0];

    // Same message for unknown email / wrong password (avoids user enumeration)
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    if (!user.is_active) {
      return res.status(403).json({ message: "Account is disabled" });
    }

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return res.status(401).json({ message: "Invalid credentials" });

    const token = signToken(user);
    res.json({
      message: "Login successful",
      token,
      user: { id: user.id, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// POST /auth/hosts  (admin only) – create a host
exports.createHost = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }
    if (!EMAIL_REGEX.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }
    if (password.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters" });
    }

    const normalized = email.trim().toLowerCase();
    const [exists] = await db.query("SELECT id FROM users WHERE email = ?", [normalized]);
    if (exists.length) {
      return res.status(409).json({ message: "Email already registered" });
    }

    const hash = await bcrypt.hash(password, 10);
    const [result] = await db.query(
      "INSERT INTO users (email, password_hash, role) VALUES (?, ?, 'host')",
      [normalized, hash]
    );

    res.status(201).json({
      message: "Host created successfully",
      host: { id: result.insertId, email: normalized, role: "host" },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// GET /auth/hosts  (admin only) – list hosts
exports.getHosts = async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT id, email, is_active, created_at FROM users WHERE role = 'host' ORDER BY created_at DESC"
    );
    res.json({ hosts: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// PATCH /auth/hosts/:id/status  (admin only) – enable/disable a host
exports.setHostStatus = async (req, res) => {
  try {
    const { is_active } = req.body;
    if (typeof is_active !== "boolean") {
      return res.status(400).json({ message: "is_active must be true or false" });
    }
    const [result] = await db.query(
      "UPDATE users SET is_active = ? WHERE id = ? AND role = 'host'",
      [is_active ? 1 : 0, req.params.id]
    );
    if (!result.affectedRows) return res.status(404).json({ message: "Host not found" });
    res.json({ message: `Host ${is_active ? "enabled" : "disabled"}` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// GET /auth/me  (any logged-in user)
exports.me = async (req, res) => {
  res.json({ user: req.user });
};