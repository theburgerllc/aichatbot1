import { Pool, PoolClient, QueryResult } from 'pg';
import * as Sentry from '@sentry/nextjs';
import { logger } from '@/lib/logger';

interface DatabaseConfig {
  connectionString: string;
  ssl?: boolean;
  max?: number;
  idleTimeoutMillis?: number;
  connectionTimeoutMillis?: number;
  maxUses?: number;
  allowExitOnIdle?: boolean;
}

interface QueryOptions {
  timeout?: number;
  retries?: number;
  transaction?: boolean;
}

class DatabaseManager {
  private pool: Pool | null = null;
  private isConnected: boolean = false;
  private connectionAttempts: number = 0;
  private maxConnectionAttempts: number = 5;

  constructor() {
    this.initializePool();
  }

  private initializePool() {
    try {
      const config: DatabaseConfig = {
        connectionString: process.env.DATABASE_URL!,
        ssl: process.env.NODE_ENV === 'production' ? true : false,
        max: parseInt(process.env.DB_POOL_MAX || '20'), // Maximum number of clients in the pool
        idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT || '30000'), // 30 seconds
        connectionTimeoutMillis: parseInt(process.env.DB_CONNECTION_TIMEOUT || '10000'), // 10 seconds
        maxUses: parseInt(process.env.DB_MAX_USES || '7500'), // Maximum uses of a connection before closing
        allowExitOnIdle: true,
      };

      this.pool = new Pool(config);

      // Set up event handlers
      this.pool.on('connect', () => {
        this.isConnected = true;
        this.connectionAttempts = 0;
        logger.info('Database connection established', {
          poolSize: this.pool?.totalCount || 0,
          idleClients: this.pool?.idleCount || 0,
          waitingClients: this.pool?.waitingCount || 0,
        });
      });

      this.pool.on('error', (err) => {
        this.isConnected = false;
        logger.error('Database pool error', err);
        Sentry.captureException(err);
        
        // Attempt to reconnect
        this.handleConnectionError();
      });

      this.pool.on('remove', () => {
        logger.debug('Database client removed from pool');
      });

      logger.info('Database pool initialized', config);
    } catch (error) {
      logger.error('Failed to initialize database pool', error as Error);
      Sentry.captureException(error);
      throw error;
    }
  }

  private async handleConnectionError() {
    if (this.connectionAttempts >= this.maxConnectionAttempts) {
      logger.error('Maximum connection attempts reached', {
        attempts: this.connectionAttempts,
        maxAttempts: this.maxConnectionAttempts,
      });
      return;
    }

    this.connectionAttempts++;
    const delay = Math.min(1000 * Math.pow(2, this.connectionAttempts), 30000); // Exponential backoff, max 30s

    logger.info('Attempting to reconnect to database', {
      attempt: this.connectionAttempts,
      delayMs: delay,
    });

    setTimeout(() => {
      this.initializePool();
    }, delay);
  }

  async query<T = any>(
    text: string,
    params?: any[],
    options: QueryOptions = {}
  ): Promise<QueryResult<T>> {
    return Sentry.startSpan(
      {
        op: "db.query",
        name: "Database Query",
      },
      async (span) => {
        const startTime = Date.now();
        let client: PoolClient | null = null;

        try {
          if (!this.pool) {
            throw new Error('Database pool not initialized');
          }

          span.setAttribute("query", text.substring(0, 100)); // First 100 chars for debugging
          span.setAttribute("has_params", !!params?.length);

          // Get client from pool with timeout
          const clientPromise = this.pool.connect();
          const timeoutPromise = new Promise<never>((_, reject) => {
            setTimeout(() => reject(new Error('Connection timeout')), options.timeout || 10000);
          });

          client = await Promise.race([clientPromise, timeoutPromise]);

          // Set query timeout
          if (options.timeout) {
            await client.query('SET statement_timeout = $1', [options.timeout]);
          }

          // Execute query
          const result = await client.query<T>(text, params);
          const duration = Date.now() - startTime;

          logger.debug('Database query executed', {
            query: text.substring(0, 100),
            duration,
            rowCount: result.rowCount,
            paramCount: params?.length || 0,
          });

          span.setAttribute("duration", duration);
          span.setAttribute("row_count", result.rowCount || 0);
          span.setAttribute("status", "success");

          return result;
        } catch (error) {
          const duration = Date.now() - startTime;
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';

          logger.error('Database query failed', error as Error, {
            query: text.substring(0, 100),
            duration,
            attempt: (options.retries || 0) + 1,
          });

          span.setAttribute("error", true);
          span.setAttribute("error_message", errorMessage);
          span.setAttribute("duration", duration);

          Sentry.captureException(error);

          // Retry logic
          if (options.retries && options.retries > 0 && this.shouldRetry(error as Error)) {
            logger.info('Retrying database query', {
              query: text.substring(0, 100),
              retriesLeft: options.retries - 1,
            });

            await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before retry
            return this.query(text, params, { ...options, retries: options.retries - 1 });
          }

          throw error;
        } finally {
          if (client) {
            client.release();
          }
        }
      }
    );
  }

  async transaction<T>(
    callback: (client: PoolClient) => Promise<T>,
    options: QueryOptions = {}
  ): Promise<T> {
    return Sentry.startSpan(
      {
        op: "db.transaction",
        name: "Database Transaction",
      },
      async (span) => {
        let client: PoolClient | null = null;

        try {
          if (!this.pool) {
            throw new Error('Database pool not initialized');
          }

          client = await this.pool.connect();
          
          await client.query('BEGIN');
          logger.debug('Database transaction started');

          const result = await callback(client);

          await client.query('COMMIT');
          logger.debug('Database transaction committed');

          span.setAttribute("status", "committed");
          return result;
        } catch (error) {
          if (client) {
            try {
              await client.query('ROLLBACK');
              logger.debug('Database transaction rolled back');
              span.setAttribute("status", "rolled_back");
            } catch (rollbackError) {
              logger.error('Failed to rollback transaction', rollbackError as Error);
              Sentry.captureException(rollbackError);
            }
          }

          logger.error('Database transaction failed', error as Error);
          span.setAttribute("error", true);
          Sentry.captureException(error);
          throw error;
        } finally {
          if (client) {
            client.release();
          }
        }
      }
    );
  }

  async healthCheck(): Promise<{ healthy: boolean; details: any }> {
    try {
      const result = await this.query('SELECT 1 as health_check', [], { timeout: 5000 });
      
      const poolStatus = {
        totalCount: this.pool?.totalCount || 0,
        idleCount: this.pool?.idleCount || 0,
        waitingCount: this.pool?.waitingCount || 0,
        maxCount: this.pool?.options?.max || 0,
      };

      return {
        healthy: result.rows[0]?.health_check === 1,
        details: {
          connected: this.isConnected,
          pool: poolStatus,
          timestamp: new Date().toISOString(),
        },
      };
    } catch (error) {
      logger.error('Database health check failed', error as Error);
      return {
        healthy: false,
        details: {
          error: error instanceof Error ? error.message : 'Unknown error',
          connected: this.isConnected,
          timestamp: new Date().toISOString(),
        },
      };
    }
  }

  async getPoolStats() {
    return {
      totalCount: this.pool?.totalCount || 0,
      idleCount: this.pool?.idleCount || 0,
      waitingCount: this.pool?.waitingCount || 0,
      maxCount: this.pool?.options?.max || 0,
      isConnected: this.isConnected,
    };
  }

  private shouldRetry(error: Error): boolean {
    // Retry on connection errors, timeouts, but not on constraint violations
    const retryableErrors = [
      'ECONNRESET',
      'ECONNREFUSED',
      'ETIMEDOUT',
      'ENOTFOUND',
      'Connection timeout',
    ];

    return retryableErrors.some(retryableError => 
      error.message.includes(retryableError)
    );
  }

  async close(): Promise<void> {
    if (this.pool) {
      await this.pool.end();
      this.pool = null;
      this.isConnected = false;
      logger.info('Database pool closed');
    }
  }
}

// Singleton instance
const database = new DatabaseManager();

// Export commonly used functions
export const query = database.query.bind(database);
export const transaction = database.transaction.bind(database);
export const healthCheck = database.healthCheck.bind(database);
export const getPoolStats = database.getPoolStats.bind(database);
export const closeDatabase = database.close.bind(database);

export default database;

// Graceful shutdown
if (typeof process !== 'undefined') {
  process.on('SIGINT', async () => {
    logger.info('Received SIGINT, closing database connections...');
    await closeDatabase();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    logger.info('Received SIGTERM, closing database connections...');
    await closeDatabase();
    process.exit(0);
  });
}