const fs = require("fs");
const path = require("path");
const db = require("../config/db").promise();

// Column aliases so the JSON matches what the React component expects
const COLS = `
  id,
  uploaded_by   AS uploadedBy,
  file_path     AS filePath,
  original_name AS originalName,
  link_url      AS linkUrl,
  description,
  is_active     AS isActive,
  sort_order    AS sortOrder,
  created_at    AS createdAt`;

const isValidUrl = (value) => {
  try {
    return ["http:", "https:"].includes(new URL(value).protocol);
  } catch {
    return false;
  }
};

const clean = (v) => (typeof v === "string" && v.trim() ? v.trim() : null);

const parseArray = (raw) => {
  try {
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
};

const removeFile = (filePath) => {
  if (!filePath) return;
  fs.unlink(path.join(process.cwd(), filePath), () => {}); // ignore if already gone
};

const isAdmin = (req) => req.user.role === "admin";

// GET /api/ads  - admin sees all, host sees own
exports.getAds = async (req, res) => {
  try {
    const [rows] = isAdmin(req)
      ? await db.query(`SELECT ${COLS} FROM ad_images ORDER BY sort_order ASC, id ASC`)
      : await db.query(
          `SELECT ${COLS} FROM ad_images WHERE uploaded_by = ? ORDER BY sort_order ASC, id ASC`,
          [req.user.id]
        );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to load advertisements" });
  }
};

// GET /api/ads/public - active ads only, no auth (for client-facing form pages)
exports.getPublicAds = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT id, file_path AS filePath, link_url AS linkUrl, description
       FROM ad_images WHERE is_active = 1 ORDER BY sort_order ASC, id ASC`
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to load advertisements" });
  }
};

// POST /api/ads  - multipart: images[], links (JSON array), descriptions (JSON array)
exports.createAds = async (req, res) => {
  const files = req.files || [];
  const discard = () => files.forEach((f) => fs.unlink(f.path, () => {}));

  try {
    if (files.length === 0) {
      return res.status(400).json({ message: "Please choose at least one image" });
    }

    const links = parseArray(req.body.links).map(clean);
    const descriptions = parseArray(req.body.descriptions).map(clean);

    if (links.some((l) => l && !isValidUrl(l))) {
      discard();
      return res.status(400).json({ message: "One or more links are not valid http/https URLs" });
    }
    if (descriptions.some((d) => d && d.length > 5000)) {
      discard();
      return res.status(400).json({ message: "Description is too long" });
    }

    const [[{ next }]] = await db.query(
      "SELECT COALESCE(MAX(sort_order), -1) + 1 AS next FROM ad_images WHERE uploaded_by = ?",
      [req.user.id]
    );

    const rows = files.map((f, i) => [
      req.user.id,
      `/uploads/ads/${f.filename}`,
      f.originalname.slice(0, 255),
      links[i] || null,
      descriptions[i] || null,
      next + i,
    ]);

    await db.query(
      `INSERT INTO ad_images (uploaded_by, file_path, original_name, link_url, description, sort_order)
       VALUES ?`,
      [rows]
    );

    res.status(201).json({ message: "Advertisements uploaded" });
  } catch (err) {
    discard();
    console.error(err);
    res.status(500).json({ message: "Upload failed" });
  }
};

// PATCH /api/ads/:id  - any of { isActive, linkUrl, description }
exports.updateAd = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { isActive, linkUrl, description } = req.body;

    const [[ad]] = await db.query("SELECT id, uploaded_by FROM ad_images WHERE id = ?", [id]);
    if (!ad) return res.status(404).json({ message: "Advertisement not found" });
    if (!isAdmin(req) && ad.uploaded_by !== req.user.id) {
      return res.status(403).json({ message: "Not allowed" });
    }

    const sets = [];
    const values = [];

    if (isActive !== undefined) {
      sets.push("is_active = ?");
      values.push(isActive ? 1 : 0);
    }
    if (linkUrl !== undefined) {
      const link = clean(linkUrl);
      if (link && (!isValidUrl(link) || link.length > 500)) {
        return res.status(400).json({ message: "Enter a valid http/https URL" });
      }
      sets.push("link_url = ?");
      values.push(link);
    }
    if (description !== undefined) {
      sets.push("description = ?");
      values.push(clean(description));
    }

    if (sets.length === 0) {
      return res.status(400).json({ message: "Nothing to update" });
    }

    await db.query(`UPDATE ad_images SET ${sets.join(", ")} WHERE id = ?`, [...values, id]);
    res.json({ message: "Advertisement updated" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update advertisement" });
  }
};

// PATCH /api/ads/reorder  - body: { ids: [3, 1, 2] } in the new order
exports.reorderAds = async (req, res) => {
  const ids = Array.isArray(req.body.ids) ? req.body.ids.map(Number) : [];
  if (ids.length === 0 || ids.some((n) => !Number.isInteger(n))) {
    return res.status(400).json({ message: "Invalid order" });
  }

  const conn = await db.getConnection();
  try {
    if (!isAdmin(req)) {
      const [owned] = await conn.query(
        "SELECT id FROM ad_images WHERE id IN (?) AND uploaded_by = ?",
        [ids, req.user.id]
      );
      if (owned.length !== ids.length) {
        return res.status(403).json({ message: "Not allowed" });
      }
    }

    await conn.beginTransaction();
    for (let i = 0; i < ids.length; i++) {
      await conn.query("UPDATE ad_images SET sort_order = ? WHERE id = ?", [i, ids[i]]);
    }
    await conn.commit();
    res.json({ message: "Order saved" });
  } catch (err) {
    await conn.rollback();
    console.error(err);
    res.status(500).json({ message: "Failed to save order" });
  } finally {
    conn.release();
  }
};

// DELETE /api/ads/:id
exports.deleteAd = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const [[ad]] = await db.query(
      "SELECT id, uploaded_by, file_path FROM ad_images WHERE id = ?",
      [id]
    );
    if (!ad) return res.status(404).json({ message: "Advertisement not found" });
    if (!isAdmin(req) && ad.uploaded_by !== req.user.id) {
      return res.status(403).json({ message: "Not allowed" });
    }

    await db.query("DELETE FROM ad_images WHERE id = ?", [id]);
    removeFile(ad.file_path);
    res.json({ message: "Advertisement deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete advertisement" });
  }
};