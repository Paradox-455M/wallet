const fs = require('fs');
const path = require('path');
const { pool } = require('../config/db');

async function runMigration() {
  const migrationPath = path.join(__dirname, '001_create_transactions_table.sql');
  const sql = fs.readFileSync(migrationPath, 'utf8');
  try {
    await pool.query(sql);
    console.log('Migration applied successfully.');
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigration();