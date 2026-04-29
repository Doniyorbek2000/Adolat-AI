const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function run() {
  await pool.query("UPDATE ai_settings SET timeout_ms = 30000;");
  const res = await pool.query("SELECT * FROM ai_settings LIMIT 1;");
  console.log(res.rows);
  pool.end();
}
run();
