const { Client } = require('pg');
const bcrypt = require('bcrypt');

const client = new Client('postgres://postgres:adm12@localhost:5432/adolataidb');

client.connect().then(async () => {
  try {
    const hash = await bcrypt.hash('949392250AdminAdm', 10);
    // Remove old admin
    await client.query("DELETE FROM users WHERE email = 'admin'");
    // Insert new admin
    const res = await client.query("SELECT * FROM users WHERE email = 'admAdmin12'");
    if (res.rowCount === 0) {
      await client.query("INSERT INTO users (full_name, email, password, role) VALUES ($1, $2, $3, $4)", ['Real Admin', 'admAdmin12', hash, 'admin']);
      console.log('Real Admin created');
    } else {
      await client.query("UPDATE users SET password = $1 WHERE email = 'admAdmin12'", [hash]);
      console.log('Real Admin updated');
    }
  } catch (e) {
    console.error(e);
  } finally {
    client.end();
  }
});
