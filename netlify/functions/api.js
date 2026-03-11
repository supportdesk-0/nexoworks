// ═══════════════════════════════════════════════════════════
//  NEXOWORK — Netlify Serverless Function
//  Wraps the Express app so it runs as a Netlify Function.
//  URL: /.netlify/functions/api/...
// ═══════════════════════════════════════════════════════════

const serverless = require("serverless-http");
const express    = require("express");
const cors       = require("cors");

// Build a lightweight Express app inline
// (avoids path resolution issues in Netlify's bundler)
const app = express();

app.use(cors({ origin: "*", credentials: true }));
app.use(express.json({ limit: "10mb" }));

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ── Routes ───────────────────────────────────────────────────
// Auth
const bcrypt = require("bcryptjs");
const jwt    = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "nexowork_dev_secret";

app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: "Credenciales requeridas" });
  try {
    const { Pool } = require("pg");
    const db = new Pool({ connectionString: process.env.POSTGRES_URL, ssl: { rejectUnauthorized: false } });
    const result = await db.query("SELECT * FROM users WHERE email=$1", [email]);
    const user = result.rows[0];
    if (!user) return res.status(401).json({ error: "Credenciales incorrectas" });
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: "Credenciales incorrectas" });
    const { password: _, ...safeUser } = user;
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: "7d" });
    res.json({ token, user: safeUser });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/auth/register", async (req, res) => {
  const { name, email, password, dept = "General" } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: "Todos los campos son requeridos" });
  try {
    const { Pool } = require("pg");
    const db = new Pool({ connectionString: process.env.POSTGRES_URL, ssl: { rejectUnauthorized: false } });
    const exists = await db.query("SELECT id FROM users WHERE email=$1", [email]);
    if (exists.rows.length) return res.status(409).json({ error: "El correo ya está registrado" });
    const hash   = await bcrypt.hash(password, 12);
    const avatar = (name[0] + (name.split(" ")[1]?.[0] || "")).toUpperCase();
    const colors = ["#2563EB","#8B5CF6","#10B981","#F59E0B","#EC4899"];
    const color  = colors[Math.floor(Math.random() * colors.length)];
    const result = await db.query(
      "INSERT INTO users (name,email,password,role,dept,avatar,color) VALUES($1,$2,$3,$4,$5,$6,$7) RETURNING id,name,email,role,dept,avatar,color",
      [name, email, hash, "employee", dept, avatar, color]
    );
    const user = result.rows[0];
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: "7d" });
    res.status(201).json({ token, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 404
app.use((req, res) => res.status(404).json({ error: "Route not found" }));

module.exports.handler = serverless(app);

