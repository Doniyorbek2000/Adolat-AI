const { Client } = require('pg');
const bcrypt = require('bcrypt');

const client = new Client('postgres://postgres:adm12@localhost:5432/adolataidb');

client.connect().then(async () => {
  try {
    const res = await client.query("SELECT * FROM users WHERE email = 'user@test.com'");
    if (res.rowCount === 0) {
      const hash = await bcrypt.hash('password123', 10);
      await client.query("INSERT INTO users (full_name, email, password, role) VALUES ($1, $2, $3, $4)", ['Test User', 'user@test.com', hash, 'user']);
      console.log('Test user created');
    } else {
      console.log('User exists');
    }
  } catch (e) {
    console.error(e);
  } finally {
    client.end();
  }
});
