// ═══════════════════════════════════════
//  NEXOWORK — Auth Routes
//  POST /api/auth/register
//  POST /api/auth/login
//  POST /api/auth/logout
// ═══════════════════════════════════════
const router  = require("express").Router();
const bcrypt  = require("bcryptjs");
const jwt     = require("jsonwebtoken");
const { getPool } = require("../db/postgres");

const JWT_SECRET = process.env.JWT_SECRET || "nexowork_dev_secret";
const SALT_ROUNDS = 12;

function signToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}

// POST /api/auth/register
router.post("/register", async (req, res) => {
  const { name, email, password, dept = "General" } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: "Todos los campos son requeridos" });
  try {
    const db = getPool();
    const exists = await db.query("SELECT id FROM users WHERE email=$1", [email]);
    if (exists.rows.length) return res.status(409).json({ error: "El correo ya está registrado" });

    const hash   = await bcrypt.hash(password, SALT_ROUNDS);
    const avatar = (name[0] + (name.split(" ")[1]?.[0] || "")).toUpperCase();
    const colors = ["#2563EB","#8B5CF6","#10B981","#F59E0B","#EC4899","#14B8A6"];
    const color  = colors[Math.floor(Math.random() * colors.length)];

    const result = await db.query(
      "INSERT INTO users (name,email,password,role,dept,avatar,color) VALUES($1,$2,$3,$4,$5,$6,$7) RETURNING id,name,email,role,dept,avatar,color",
      [name, email, hash, "employee", dept, avatar, color]
    );
    const user = result.rows[0];
    res.status(201).json({ token: signToken(user), user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al registrar usuario" });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: "Credenciales requeridas" });
  try {
    const db   = getPool();
    const result = await db.query("SELECT * FROM users WHERE email=$1", [email]);
    const user = result.rows[0];
    if (!user) return res.status(401).json({ error: "Credenciales incorrectas" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: "Credenciales incorrectas" });

    await db.query("UPDATE users SET online=TRUE WHERE id=$1", [user.id]);
    const { password: _, ...safeUser } = user;
    res.json({ token: signToken(user), user: safeUser });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al iniciar sesión" });
  }
});

// POST /api/auth/logout
router.post("/logout", require("../middleware/auth"), async (req, res) => {
  try {
    const db = getPool();
    await db.query("UPDATE users SET online=FALSE WHERE id=$1", [req.user.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Error al cerrar sesión" });
  }
});

module.exports = router;
