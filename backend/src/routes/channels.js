// ═══════════════════════════════════════
//  NEXOWORK — Channels Routes
//  GET  /api/channels
//  GET  /api/channels/:id/messages
//  POST /api/channels/:id/messages
// ═══════════════════════════════════════
const router = require("express").Router();
const auth   = require("../middleware/auth");
const { getPool } = require("../db/postgres");

router.get("/", auth, async (req, res) => {
  try {
    const db = getPool();
    const result = await db.query("SELECT * FROM channels ORDER BY name");
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get("/:id/messages", auth, async (req, res) => {
  const limit = parseInt(req.query.limit) || 50;
  try {
    const db = getPool();
    const result = await db.query(
      `SELECT m.*, u.name AS user_name, u.avatar, u.color
       FROM messages m
       LEFT JOIN users u ON u.id = m.user_id
       WHERE m.channel_id=$1
       ORDER BY m.created_at ASC
       LIMIT $2`,
      [req.params.id, limit]
    );
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post("/:id/messages", auth, async (req, res) => {
  const { text } = req.body;
  if (!text?.trim()) return res.status(400).json({ error: "Mensaje vacío" });
  try {
    const db = getPool();
    const result = await db.query(
      "INSERT INTO messages (channel_id, user_id, text) VALUES($1,$2,$3) RETURNING *",
      [req.params.id, req.user.id, text.trim()]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
