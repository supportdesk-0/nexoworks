// ═══════════════════════════════════════
//  NEXOWORK — PostgreSQL Connection (pg)
//  Uses connection pool for serverless
// ═══════════════════════════════════════
const { Pool } = require("pg");

let pool;

function getPool() {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.POSTGRES_URL,
      ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
      max: 5,           // small pool for serverless
      idleTimeoutMillis: 10000,
      connectionTimeoutMillis: 5000,
    });
    pool.on("error", (err) => console.error("PG pool error:", err));
  }
  return pool;
}

module.exports = { getPool };
