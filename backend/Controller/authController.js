const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../config/db").promise();

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;

const signToken = (user) =>
  jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "1d" }
  );

const isValidId = (id) => /^\d+$/.test(String(id));

// Seeds the default admin once at startup (if it doesn't exist)
exports.seedAdmin = async () => {
  try {
    const email = process.env.ADMIN_EMAIL;
    const password = process.env.ADMIN_PASSWORD;
    if (!email || !password) {
      console.log("ADMIN_EMAIL / ADMIN_PASSWORD missing in .env, skipping admin seed");
      return;
    }

    const normalized = email.trim().toLowerCase();
    const [rows] = await db.query("SELECT id FROM users WHERE email = ?", [normalized]);
    if (rows.length) return;

    const hash = await bcrypt.hash(password, 10);
    await db.query(
      "INSERT INTO users (email, password_hash, role) VALUES (?, ?, 'admin')",
      [normalized, hash]
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
    if (typeof email !== "string" || typeof password !== "string" || !email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [
      email.trim().toLowerCase(),
    ]);
    const user = rows[0];

    // Same message for unknown email / wrong password (avoids user enumeration)
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return res.status(401).json({ message: "Invalid credentials" });

    // Check status only after the password is verified, so it can't be used to probe emails
    if (!user.is_active) {
      return res.status(403).json({ message: "Account is disabled" });
    }

    res.json({
      message: "Login successful",
      token: signToken(user),
      user: { id: user.id, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// POST /auth/hosts  (admin only) - create a host
exports.createHost = async (req, res) => {
  try {
    const { email, password, is_active = true } = req.body;
    if (typeof email !== "string" || typeof password !== "string" || !email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }
    if (typeof is_active !== "boolean") {
      return res.status(400).json({ message: "is_active must be true or false" });
    }

    const normalized = email.trim().toLowerCase();
    if (!EMAIL_REGEX.test(normalized)) {
      return res.status(400).json({ message: "Invalid email format" });
    }
    if (password.length < MIN_PASSWORD_LENGTH) {
      return res
        .status(400)
        .json({ message: `Password must be at least ${MIN_PASSWORD_LENGTH} characters` });
    }

    const [exists] = await db.query("SELECT id FROM users WHERE email = ?", [normalized]);
    if (exists.length) {
      return res.status(409).json({ message: "Email already registered" });
    }

    const hash = await bcrypt.hash(password, 10);
    const [result] = await db.query(
      "INSERT INTO users (email, password_hash, role, is_active) VALUES (?, ?, 'host', ?)",
      [normalized, hash, is_active ? 1 : 0]
    );

    res.status(201).json({
      message: "Host created successfully",
      host: { id: result.insertId, email: normalized, role: "host", is_active },
    });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ message: "Email already registered" });
    }
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// GET /auth/hosts  (admin only) - list hosts
exports.getHosts = async (_req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT id, email, is_active, created_at, updated_at FROM users WHERE role = 'host' ORDER BY created_at DESC"
    );
    res.json({ hosts: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// GET /auth/hosts/:id  (admin only) - single host
exports.getHostById = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ message: "Invalid host id" });
    }
    const [rows] = await db.query(
      "SELECT id, email, is_active, created_at, updated_at FROM users WHERE id = ? AND role = 'host'",
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ message: "Host not found" });
    res.json({ host: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// PUT /auth/hosts/:id  (admin only) - edit a host (email, password, is_active; all optional)
exports.updateHost = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) {
      return res.status(400).json({ message: "Invalid host id" });
    }

    const { email, password, is_active } = req.body;
    const fields = [];
    const values = [];

    if (email !== undefined) {
      if (typeof email !== "string") {
        return res.status(400).json({ message: "Invalid email format" });
      }
      const normalized = email.trim().toLowerCase();
      if (!EMAIL_REGEX.test(normalized)) {
        return res.status(400).json({ message: "Invalid email format" });
      }
      const [dup] = await db.query("SELECT id FROM users WHERE email = ? AND id <> ?", [
        normalized,
        id,
      ]);
      if (dup.length) {
        return res.status(409).json({ message: "Email already registered" });
      }
      fields.push("email = ?");
      values.push(normalized);
    }

    if (password !== undefined) {
      if (typeof password !== "string" || password.length < MIN_PASSWORD_LENGTH) {
        return res
          .status(400)
          .json({ message: `Password must be at least ${MIN_PASSWORD_LENGTH} characters` });
      }
      fields.push("password_hash = ?");
      values.push(await bcrypt.hash(password, 10));
    }

    if (is_active !== undefined) {
      if (typeof is_active !== "boolean") {
        return res.status(400).json({ message: "is_active must be true or false" });
      }
      fields.push("is_active = ?");
      values.push(is_active ? 1 : 0);
    }

    if (!fields.length) {
      return res.status(400).json({ message: "Nothing to update" });
    }

    const [result] = await db.query(
      `UPDATE users SET ${fields.join(", ")} WHERE id = ? AND role = 'host'`,
      [...values, id]
    );
    if (!result.affectedRows) return res.status(404).json({ message: "Host not found" });

    res.json({ message: "Host updated successfully" });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ message: "Email already registered" });
    }
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// PATCH /auth/hosts/:id/status  (admin only) - enable/disable a host
exports.setHostStatus = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ message: "Invalid host id" });
    }
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

// DELETE /auth/hosts/:id  (admin only) - delete a host
exports.deleteHost = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ message: "Invalid host id" });
    }
    const [result] = await db.query("DELETE FROM users WHERE id = ? AND role = 'host'", [
      req.params.id,
    ]);
    if (!result.affectedRows) return res.status(404).json({ message: "Host not found" });
    res.json({ message: "Host deleted successfully" });
  } catch (err) {
    // Host still owns form links / submissions via foreign keys
    if (err.code === "ER_ROW_IS_REFERENCED_2") {
      return res.status(409).json({
        message: "Host has linked data and can't be deleted. Disable the host instead.",
      });
    }
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// GET /auth/me  (any logged-in user)
exports.me = async (req, res) => {
  res.json({ user: req.user });
};