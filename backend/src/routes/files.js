// ═══════════════════════════════════════
//  NEXOWORK — Files Routes
//  Files are stored in Firebase Storage
//  Metadata stored in PostgreSQL
// ═══════════════════════════════════════
const router = require("express").Router();
const auth   = require("../middleware/auth");
const { getPool } = require("../db/postgres");

router.get("/", auth, async (req, res) => {
  try {
    const db = getPool();
    const result = await db.query(
      `SELECT f.*, u.name AS uploader_name
       FROM files f
       LEFT JOIN users u ON u.id = f.uploaded_by
       ORDER BY f.created_at DESC`
    );
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post("/", auth, async (req, res) => {
  const { name, url, size_bytes, mime_type } = req.body;
  if (!name || !url) return res.status(400).json({ error: "Nombre y URL requeridos" });
  try {
    const db = getPool();
    const result = await db.query(
      "INSERT INTO files (name,url,size_bytes,mime_type,uploaded_by) VALUES($1,$2,$3,$4,$5) RETURNING *",
      [name, url, size_bytes || 0, mime_type || "application/octet-stream", req.user.id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete("/:id", auth, async (req, res) => {
  try {
    const db = getPool();
    await db.query("DELETE FROM files WHERE id=$1 AND (uploaded_by=$2 OR $3='admin')", [req.params.id, req.user.id, req.user.role]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
