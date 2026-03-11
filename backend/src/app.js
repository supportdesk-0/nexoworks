// ═══════════════════════════════════════════════════════════
//  NEXOWORK — Express Backend
//  Node.js + Express API server
//  Runs locally OR as Netlify serverless function
// ═══════════════════════════════════════════════════════════

require("dotenv").config();
const express = require("express");
const cors    = require("cors");

const authRoutes         = require("./routes/auth");
const usersRoutes        = require("./routes/users");
const announcementsRoutes = require("./routes/announcements");
const filesRoutes        = require("./routes/files");
const channelsRoutes     = require("./routes/channels");

const app = express();

// ── Middleware ───────────────────────────────────────────────
app.use(cors({
  origin: process.env.FRONTEND_URL || "*",
  credentials: true,
}));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// ── Health check ─────────────────────────────────────────────
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString(), version: "1.0.0" });
});

// ── Routes ───────────────────────────────────────────────────
app.use("/api/auth",          authRoutes);
app.use("/api/users",         usersRoutes);
app.use("/api/announcements", announcementsRoutes);
app.use("/api/files",         filesRoutes);
app.use("/api/channels",      channelsRoutes);

// ── 404 handler ──────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// ── Error handler ─────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ error: err.message || "Internal server error" });
});

// ── Standalone server (local dev) ────────────────────────────
if (require.main === module) {
  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => console.log(`✅ NexoWork API running at http://localhost:${PORT}`));
}

module.exports = app;
