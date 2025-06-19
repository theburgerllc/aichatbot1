import fs from 'fs';
import path from 'path';
import { query, transaction } from '@/lib/database';
import { logger } from '@/lib/logger';
import * as Sentry from '@sentry/nextjs';

interface Migration {
  version: string;
  filename: string;
  sql: string;
}

interface MigrationRecord {
  version: string;
  filename: string;
  applied_at: Date;
  checksum: string;
}

export class MigrationRunner {
  private migrationsPath: string;

  constructor(migrationsPath?: string) {
    this.migrationsPath = migrationsPath || path.join(process.cwd(), 'lib/migrations');
  }

  async runMigrations(): Promise<void> {
    return Sentry.startSpan(
      {
        op: "db.migrations",
        name: "Run Database Migrations",
      },
      async (span) => {
        try {
          logger.info('Starting database migrations');

          // Ensure migrations table exists
          await this.createMigrationsTable();

          // Get pending migrations
          const pendingMigrations = await this.getPendingMigrations();
          
          if (pendingMigrations.length === 0) {
            logger.info('No pending migrations found');
            span.setAttribute("migrations_count", 0);
            return;
          }

          logger.info('Found pending migrations', { 
            count: pendingMigrations.length,
            migrations: pendingMigrations.map(m => m.filename)
          });

          // Apply each migration in a transaction
          for (const migration of pendingMigrations) {
            await this.applyMigration(migration);
          }

          logger.info('All migrations completed successfully', {
            appliedCount: pendingMigrations.length
          });

          span.setAttribute("migrations_count", pendingMigrations.length);
          span.setAttribute("status", "success");
        } catch (error) {
          logger.error('Migration failed', error as Error);
          Sentry.captureException(error);
          span.setAttribute("error", true);
          throw error;
        }
      }
    );
  }

  private async createMigrationsTable(): Promise<void> {
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS schema_migrations (
        version VARCHAR(255) PRIMARY KEY,
        filename VARCHAR(255) NOT NULL,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        checksum VARCHAR(64) NOT NULL
      );
      
      CREATE INDEX IF NOT EXISTS idx_schema_migrations_applied_at 
      ON schema_migrations(applied_at);
    `;

    await query(createTableSQL);
    logger.debug('Migrations table ensured');
  }

  private async getPendingMigrations(): Promise<Migration[]> {
    try {
      // Read all migration files
      const migrationFiles = fs.readdirSync(this.migrationsPath)
        .filter(file => file.endsWith('.sql'))
        .sort();

      // Get applied migrations
      const appliedResult = await query<MigrationRecord>(
        'SELECT version, filename, checksum FROM schema_migrations ORDER BY version'
      );

      const appliedMigrations = new Set(appliedResult.rows.map(row => row.filename));

      // Filter out already applied migrations
      const pendingFiles = migrationFiles.filter(file => !appliedMigrations.has(file));

      // Load migration content
      const migrations: Migration[] = [];
      for (const file of pendingFiles) {
        const filePath = path.join(this.migrationsPath, file);
        const sql = fs.readFileSync(filePath, 'utf-8');
        const version = this.extractVersionFromFilename(file);
        
        migrations.push({
          version,
          filename: file,
          sql
        });
      }

      return migrations;
    } catch (error) {
      logger.error('Failed to get pending migrations', error as Error);
      throw error;
    }
  }

  private async applyMigration(migration: Migration): Promise<void> {
    return transaction(async (client) => {
      try {
        logger.info('Applying migration', { 
          version: migration.version,
          filename: migration.filename 
        });

        // Calculate checksum
        const checksum = this.calculateChecksum(migration.sql);

        // Execute migration SQL
        await client.query(migration.sql);

        // Record migration as applied
        await client.query(
          `INSERT INTO schema_migrations (version, filename, checksum) 
           VALUES ($1, $2, $3)`,
          [migration.version, migration.filename, checksum]
        );

        logger.info('Migration applied successfully', {
          version: migration.version,
          filename: migration.filename,
          checksum
        });
      } catch (error) {
        logger.error('Failed to apply migration', error as Error, {
          version: migration.version,
          filename: migration.filename
        });
        throw error;
      }
    });
  }

  async getAppliedMigrations(): Promise<MigrationRecord[]> {
    try {
      const result = await query<MigrationRecord>(
        'SELECT * FROM schema_migrations ORDER BY applied_at ASC'
      );
      return result.rows;
    } catch (error) {
      logger.error('Failed to get applied migrations', error as Error);
      throw error;
    }
  }

  async validateMigrations(): Promise<{ valid: boolean; issues: string[] }> {
    try {
      const issues: string[] = [];

      // Check if all migration files still exist
      const appliedMigrations = await this.getAppliedMigrations();
      
      for (const migration of appliedMigrations) {
        const filePath = path.join(this.migrationsPath, migration.filename);
        
        if (!fs.existsSync(filePath)) {
          issues.push(`Migration file missing: ${migration.filename}`);
          continue;
        }

        // Verify checksum
        const sql = fs.readFileSync(filePath, 'utf-8');
        const currentChecksum = this.calculateChecksum(sql);
        
        if (currentChecksum !== migration.checksum) {
          issues.push(`Migration checksum mismatch: ${migration.filename}`);
        }
      }

      return {
        valid: issues.length === 0,
        issues
      };
    } catch (error) {
      logger.error('Failed to validate migrations', error as Error);
      return {
        valid: false,
        issues: ['Failed to validate migrations: ' + (error as Error).message]
      };
    }
  }

  private extractVersionFromFilename(filename: string): string {
    const match = filename.match(/^(\d+)_/);
    return match ? match[1] : filename;
  }

  private calculateChecksum(content: string): string {
    const crypto = require('crypto');
    return crypto.createHash('sha256').update(content).digest('hex');
  }
}

// Export singleton instance
export const migrationRunner = new MigrationRunner();

// CLI interface for running migrations
export async function runMigrations() {
  try {
    await migrationRunner.runMigrations();
    console.log('✅ Migrations completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Only run if called directly
if (require.main === module) {
  runMigrations();
}