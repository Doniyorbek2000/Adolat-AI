const { Pool } = require('pg');
require('dotenv').config({ path: './backend/.env' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function run() {
  const res = await pool.query("SELECT error_message FROM ai_logs WHERE provider='openai' ORDER BY id DESC LIMIT 5;");
  console.log(res.rows);
  pool.end();
}
run();
