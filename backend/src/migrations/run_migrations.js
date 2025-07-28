const fs = require('fs');
const path = require('path');
const { pool } = require('../config/db');

class MigrationRunner {
  constructor() {
    this.migrationsDir = __dirname;
    this.migrations = [];
  }

  async loadMigrations() {
    const files = fs.readdirSync(this.migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort(); // This will sort numerically: 001_, 002_, etc.

    for (const file of files) {
      const migrationPath = path.join(this.migrationsDir, file);
      const sql = fs.readFileSync(migrationPath, 'utf8');
      this.migrations.push({
        name: file,
        sql: sql
      });
    }
  }

  async createMigrationsTable() {
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        executed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;
    
    try {
      await pool.query(createTableSQL);
      console.log('✅ Migrations table created/verified');
    } catch (error) {
      console.error('❌ Error creating migrations table:', error);
      throw error;
    }
  }

  async getExecutedMigrations() {
    try {
      const result = await pool.query('SELECT name FROM migrations ORDER BY id');
      return result.rows.map(row => row.name);
    } catch (error) {
      console.error('❌ Error getting executed migrations:', error);
      return [];
    }
  }

  async executeMigration(migration) {
    try {
      console.log(`🔄 Executing migration: ${migration.name}`);
      
      // Execute the migration SQL
      await pool.query(migration.sql);
      
      // Record the migration as executed
      await pool.query(
        'INSERT INTO migrations (name) VALUES ($1)',
        [migration.name]
      );
      
      console.log(`✅ Migration ${migration.name} executed successfully`);
    } catch (error) {
      console.error(`❌ Error executing migration ${migration.name}:`, error);
      throw error;
    }
  }

  async run() {
    try {
      console.log('🚀 Starting database migrations...');
      
      // Load all migration files
      await this.loadMigrations();
      console.log(`📁 Found ${this.migrations.length} migration(s)`);
      
      // Create migrations table if it doesn't exist
      await this.createMigrationsTable();
      
      // Get already executed migrations
      const executedMigrations = await this.getExecutedMigrations();
      console.log(`📋 Already executed: ${executedMigrations.length} migration(s)`);
      
      // Execute pending migrations
      let executedCount = 0;
      for (const migration of this.migrations) {
        if (!executedMigrations.includes(migration.name)) {
          await this.executeMigration(migration);
          executedCount++;
        } else {
          console.log(`⏭️  Skipping already executed migration: ${migration.name}`);
        }
      }
      
      if (executedCount === 0) {
        console.log('✨ All migrations are up to date!');
      } else {
        console.log(`🎉 Successfully executed ${executedCount} new migration(s)`);
      }
      
    } catch (error) {
      console.error('💥 Migration failed:', error);
      process.exit(1);
    } finally {
      await pool.end();
    }
  }
}

// Run migrations if this file is executed directly
if (require.main === module) {
  const runner = new MigrationRunner();
  runner.run();
}

module.exports = MigrationRunner;