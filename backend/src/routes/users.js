// ═══════════════════════════════════════
//  NEXOWORK — Users Routes
// ═══════════════════════════════════════
const router = require("express").Router();
const auth   = require("../middleware/auth");
const { getPool } = require("../db/postgres");

// GET /api/users — list all users
router.get("/", auth, async (req, res) => {
  try {
    const db = getPool();
    const result = await db.query("SELECT id,name,email,role,dept,avatar,color,online,created_at FROM users ORDER BY name");
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/users/:id
router.get("/:id", auth, async (req, res) => {
  try {
    const db = getPool();
    const result = await db.query("SELECT id,name,email,role,dept,avatar,color,online FROM users WHERE id=$1", [req.params.id]);
    if (!result.rows.length) return res.status(404).json({ error: "Usuario no encontrado" });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// PATCH /api/users/:id — update role (admin only)
router.patch("/:id", auth, async (req, res) => {
  if (req.user.role !== "admin") return res.status(403).json({ error: "Acceso denegado" });
  const { role, dept } = req.body;
  try {
    const db = getPool();
    const result = await db.query("UPDATE users SET role=COALESCE($1,role), dept=COALESCE($2,dept) WHERE id=$3 RETURNING id,name,role,dept", [role, dept, req.params.id]);
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
