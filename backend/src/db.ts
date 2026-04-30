import { Pool } from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

export const initDB = async () => {
  try {
    const client = await pool.connect();
    console.log('Connected to PostgreSQL successfully.');
    
    // Create users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        full_name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        phone VARCHAR(50),
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'user',
        tier VARCHAR(50) DEFAULT 'free',
        blocked BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_active TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        total_chats INT DEFAULT 0,
        total_docs INT DEFAULT 0,
        total_spent INT DEFAULT 0
      );
    `);

    // Create transactions table
    await client.query(`
      CREATE TABLE IF NOT EXISTS transactions (
        id SERIAL PRIMARY KEY,
        user_id INT REFERENCES users(id),
        amount INT NOT NULL,
        click_trans_id VARCHAR(255),
        status VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create sources table for Source Registry
    await client.query(`
      CREATE TABLE IF NOT EXISTS sources (
        id SERIAL PRIMARY KEY,
        source_name VARCHAR(255) NOT NULL,
        source_type VARCHAR(50),
        base_url VARCHAR(255),
        trust_level INT DEFAULT 1,
        update_frequency VARCHAR(50),
        allowed_content_types TEXT,
        parser_type VARCHAR(50),
        citation_format TEXT,
        last_synced_at TIMESTAMP,
        status VARCHAR(50) DEFAULT 'active',
        category VARCHAR(50) -- e.g., 'tax', 'legal', 'service'
      );
    `);

    // Update legal_knowledge table for RAG with source link
    await client.query(`
      CREATE TABLE IF NOT EXISTS legal_knowledge (
        id SERIAL PRIMARY KEY,
        source_id INT REFERENCES sources(id),
        content TEXT NOT NULL,
        source_title TEXT,
        source_link TEXT,
        article_ref VARCHAR(255),
        embedding JSONB,
        category VARCHAR(50),
        metadata JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create ai_logs table
    await client.query(`
      CREATE TABLE IF NOT EXISTS ai_logs (
        id SERIAL PRIMARY KEY,
        user_id INT REFERENCES users(id),
        provider VARCHAR(50),
        model VARCHAR(50),
        prompt_tokens INT,
        completion_tokens INT,
        total_tokens INT,
        latency_ms INT,
        cost_estimate DECIMAL(10, 6),
        error_message TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create ai_settings table
    await client.query(`
      CREATE TABLE IF NOT EXISTS ai_settings (
        id SERIAL PRIMARY KEY,
        primary_provider VARCHAR(50) DEFAULT 'openai',
        fallback_provider VARCHAR(50) DEFAULT 'gemini',
        primary_model VARCHAR(50) DEFAULT 'gpt-4o-mini',
        fallback_model VARCHAR(50) DEFAULT 'gemini-2.5-flash',
        timeout_ms INT DEFAULT 10000,
        retry_count INT DEFAULT 1,
        is_active BOOLEAN DEFAULT true,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Insert default settings
    const settingsCount = await client.query("SELECT COUNT(*) FROM ai_settings");
    if (parseInt(settingsCount.rows[0].count) === 0) {
      await client.query("INSERT INTO ai_settings (primary_provider) VALUES ('openai')");
    }

    // Insert initial sources
    const sourcesCount = await client.query("SELECT COUNT(*) FROM sources");
    if (parseInt(sourcesCount.rows[0].count) === 0) {
      await client.query(`
        INSERT INTO sources (source_name, source_type, base_url, trust_level, category) VALUES
        ('Lex.uz', 'legal', 'https://lex.uz', 5, 'legal'),
        ('Soliq.uz', 'tax', 'https://soliq.uz', 5, 'tax'),
        ('My.gov.uz', 'service', 'https://my.gov.uz', 5, 'service'),
        ('President.uz', 'official', 'https://president.uz', 5, 'official'),
        ('Gov.uz', 'government', 'https://gov.uz', 4, 'official'),
        ('Adliya.uz', 'legal', 'https://adliya.uz', 5, 'legal'),
        ('Central Bank', 'finance', 'https://cbu.uz', 5, 'finance'),
        ('Kadastr', 'property', 'https://kadastr.uz', 5, 'property'),
        ('Customs', 'customs', 'https://customs.uz', 5, 'customs')
      `);
    }

    // Insert real admin if not exists
    const adminExists = await client.query("SELECT * FROM users WHERE email = 'admAdmin12'");
    if (adminExists.rowCount === 0) {
      const bcrypt = require('bcrypt');
      const hash = await bcrypt.hash('949392250AdminAdm', 10);
      await client.query(
        "INSERT INTO users (full_name, email, password, role) VALUES ($1, $2, $3, $4)",
        ['Admin', 'admAdmin12', hash, 'admin']
      );
      console.log('Real Admin user created successfully.');
    }
    
    client.release();
  } catch (err) {
    console.error('Database connection error:', err);
  }
};

export default pool;
