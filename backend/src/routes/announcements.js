// ═══════════════════════════════════════
//  NEXOWORK — Announcements Routes
// ═══════════════════════════════════════
const router = require("express").Router();
const auth   = require("../middleware/auth");
const { getPool } = require("../db/postgres");

router.get("/", auth, async (req, res) => {
  try {
    const db = getPool();
    const result = await db.query(
      `SELECT a.*, u.name AS author_name, u.avatar, u.color
       FROM announcements a
       LEFT JOIN users u ON u.id = a.author_id
       ORDER BY a.created_at DESC`
    );
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post("/", auth, async (req, res) => {
  if (!["admin","gerente"].includes(req.user.role?.toLowerCase())) {
    return res.status(403).json({ error: "Solo administradores pueden publicar anuncios" });
  }
  const { title, content, important = false } = req.body;
  if (!title?.trim() || !content?.trim()) return res.status(400).json({ error: "Título y contenido requeridos" });
  try {
    const db = getPool();
    const result = await db.query(
      "INSERT INTO announcements (title,content,author_id,important) VALUES($1,$2,$3,$4) RETURNING *",
      [title.trim(), content.trim(), req.user.id, important]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete("/:id", auth, async (req, res) => {
  if (!["admin","gerente"].includes(req.user.role?.toLowerCase())) {
    return res.status(403).json({ error: "Acceso denegado" });
  }
  try {
    const db = getPool();
    await db.query("DELETE FROM announcements WHERE id=$1", [req.params.id]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
