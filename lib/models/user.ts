import { query, transaction } from '@/lib/database';
import { logger } from '@/lib/logger';
import * as Sentry from '@sentry/nextjs';
import bcrypt from 'bcryptjs';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  company: string;
  phone?: string;
  passwordHash: string;
  status: 'trial' | 'active' | 'expired' | 'cancelled';
  trialStartDate?: Date;
  trialEndDate?: Date;
  subscriptionId?: string;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
  metadata?: Record<string, any>;
}

export interface CreateUserInput {
  email: string;
  firstName: string;
  lastName: string;
  company: string;
  phone?: string;
  password: string;
  status?: User['status'];
  metadata?: Record<string, any>;
}

export interface UpdateUserInput {
  firstName?: string;
  lastName?: string;
  company?: string;
  phone?: string;
  status?: User['status'];
  subscriptionId?: string;
  metadata?: Record<string, any>;
}

export class UserModel {
  static async create(input: CreateUserInput): Promise<User> {
    return Sentry.startSpan(
      {
        op: "db.user.create",
        name: "Create User",
      },
      async (span) => {
        try {
          span.setAttribute("email", input.email);
          span.setAttribute("company", input.company);

          const passwordHash = await bcrypt.hash(input.password, 12);
          const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          
          // Set trial dates if status is trial
          let trialStartDate: Date | null = null;
          let trialEndDate: Date | null = null;
          
          if (input.status === 'trial' || !input.status) {
            trialStartDate = new Date();
            trialEndDate = new Date();
            trialEndDate.setDate(trialEndDate.getDate() + 14); // 14-day trial
          }

          const insertQuery = `
            INSERT INTO users (
              id, email, first_name, last_name, company, phone, password_hash,
              status, trial_start_date, trial_end_date, created_at, updated_at, metadata
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW(), $11)
            RETURNING *
          `;

          const values = [
            userId,
            input.email.toLowerCase(),
            input.firstName,
            input.lastName,
            input.company,
            input.phone || null,
            passwordHash,
            input.status || 'trial',
            trialStartDate,
            trialEndDate,
            JSON.stringify(input.metadata || {}),
          ];

          const result = await query<User>(insertQuery, values);

          if (result.rows.length === 0) {
            throw new Error('Failed to create user');
          }

          const user = this.mapRowToUser(result.rows[0]);
          
          logger.info('User created successfully', {
            userId: user.id,
            email: user.email,
            company: user.company,
            status: user.status,
          });

          span.setAttribute("user_id", user.id);
          span.setAttribute("status", "success");

          return user;
        } catch (error) {
          logger.error('Failed to create user', error as Error, {
            email: input.email,
            company: input.company,
          });
          
          Sentry.captureException(error);
          span.setAttribute("error", true);
          throw error;
        }
      }
    );
  }

  static async findById(id: string): Promise<User | null> {
    return Sentry.startSpan(
      {
        op: "db.user.findById",
        name: "Find User by ID",
      },
      async (span) => {
        try {
          span.setAttribute("user_id", id);

          const findQuery = `
            SELECT * FROM users WHERE id = $1
          `;

          const result = await query<User>(findQuery, [id]);

          if (result.rows.length === 0) {
            span.setAttribute("found", false);
            return null;
          }

          const user = this.mapRowToUser(result.rows[0]);
          span.setAttribute("found", true);
          span.setAttribute("status", user.status);

          return user;
        } catch (error) {
          logger.error('Failed to find user by ID', error as Error, { userId: id });
          Sentry.captureException(error);
          span.setAttribute("error", true);
          throw error;
        }
      }
    );
  }

  static async findByEmail(email: string): Promise<User | null> {
    return Sentry.startSpan(
      {
        op: "db.user.findByEmail",
        name: "Find User by Email",
      },
      async (span) => {
        try {
          span.setAttribute("email", email);

          const findQuery = `
            SELECT * FROM users WHERE email = $1
          `;

          const result = await query<User>(findQuery, [email.toLowerCase()]);

          if (result.rows.length === 0) {
            span.setAttribute("found", false);
            return null;
          }

          const user = this.mapRowToUser(result.rows[0]);
          span.setAttribute("found", true);
          span.setAttribute("user_id", user.id);
          span.setAttribute("status", user.status);

          return user;
        } catch (error) {
          logger.error('Failed to find user by email', error as Error, { email });
          Sentry.captureException(error);
          span.setAttribute("error", true);
          throw error;
        }
      }
    );
  }

  static async update(id: string, input: UpdateUserInput): Promise<User | null> {
    return Sentry.startSpan(
      {
        op: "db.user.update",
        name: "Update User",
      },
      async (span) => {
        try {
          span.setAttribute("user_id", id);

          const updateFields: string[] = [];
          const updateValues: any[] = [];
          let paramIndex = 1;

          // Build dynamic update query
          if (input.firstName !== undefined) {
            updateFields.push(`first_name = $${paramIndex++}`);
            updateValues.push(input.firstName);
          }
          if (input.lastName !== undefined) {
            updateFields.push(`last_name = $${paramIndex++}`);
            updateValues.push(input.lastName);
          }
          if (input.company !== undefined) {
            updateFields.push(`company = $${paramIndex++}`);
            updateValues.push(input.company);
          }
          if (input.phone !== undefined) {
            updateFields.push(`phone = $${paramIndex++}`);
            updateValues.push(input.phone);
          }
          if (input.status !== undefined) {
            updateFields.push(`status = $${paramIndex++}`);
            updateValues.push(input.status);
          }
          if (input.subscriptionId !== undefined) {
            updateFields.push(`subscription_id = $${paramIndex++}`);
            updateValues.push(input.subscriptionId);
          }
          if (input.metadata !== undefined) {
            updateFields.push(`metadata = $${paramIndex++}`);
            updateValues.push(JSON.stringify(input.metadata));
          }

          if (updateFields.length === 0) {
            throw new Error('No fields to update');
          }

          updateFields.push(`updated_at = NOW()`);
          updateValues.push(id);

          const updateQuery = `
            UPDATE users 
            SET ${updateFields.join(', ')}
            WHERE id = $${paramIndex}
            RETURNING *
          `;

          const result = await query<User>(updateQuery, updateValues);

          if (result.rows.length === 0) {
            span.setAttribute("found", false);
            return null;
          }

          const user = this.mapRowToUser(result.rows[0]);
          
          logger.info('User updated successfully', {
            userId: user.id,
            updatedFields: Object.keys(input),
          });

          span.setAttribute("found", true);
          span.setAttribute("status", "success");

          return user;
        } catch (error) {
          logger.error('Failed to update user', error as Error, { userId: id });
          Sentry.captureException(error);
          span.setAttribute("error", true);
          throw error;
        }
      }
    );
  }

  static async updateLastLogin(id: string): Promise<void> {
    try {
      const updateQuery = `
        UPDATE users SET last_login_at = NOW() WHERE id = $1
      `;

      await query(updateQuery, [id]);
      
      logger.debug('User last login updated', { userId: id });
    } catch (error) {
      logger.error('Failed to update last login', error as Error, { userId: id });
      // Don't throw - this is not critical
    }
  }

  static async listTrialUsers(limit = 50, offset = 0): Promise<{ users: User[]; total: number }> {
    return Sentry.startSpan(
      {
        op: "db.user.listTrialUsers",
        name: "List Trial Users",
      },
      async (span) => {
        try {
          span.setAttribute("limit", limit);
          span.setAttribute("offset", offset);

          // Get total count
          const countQuery = `
            SELECT COUNT(*) as total FROM users WHERE status = 'trial'
          `;
          
          // Get users
          const usersQuery = `
            SELECT * FROM users 
            WHERE status = 'trial' 
            ORDER BY created_at DESC 
            LIMIT $1 OFFSET $2
          `;

          const [countResult, usersResult] = await Promise.all([
            query<{ total: string }>(countQuery),
            query<User>(usersQuery, [limit, offset]),
          ]);

          const users = usersResult.rows.map(row => this.mapRowToUser(row));
          const total = parseInt(countResult.rows[0]?.total || '0');

          span.setAttribute("total_count", total);
          span.setAttribute("returned_count", users.length);

          return { users, total };
        } catch (error) {
          logger.error('Failed to list trial users', error as Error);
          Sentry.captureException(error);
          span.setAttribute("error", true);
          throw error;
        }
      }
    );
  }

  static async getTrialExpiringUsers(daysUntilExpiry = 3): Promise<User[]> {
    try {
      const query = `
        SELECT * FROM users 
        WHERE status = 'trial' 
        AND trial_end_date BETWEEN NOW() AND NOW() + INTERVAL '${daysUntilExpiry} days'
        ORDER BY trial_end_date ASC
      `;

      const result = await query<User>(query);
      return result.rows.map(row => this.mapRowToUser(row));
    } catch (error) {
      logger.error('Failed to get trial expiring users', error as Error);
      throw error;
    }
  }

  private static mapRowToUser(row: any): User {
    return {
      id: row.id,
      email: row.email,
      firstName: row.first_name,
      lastName: row.last_name,
      company: row.company,
      phone: row.phone,
      passwordHash: row.password_hash,
      status: row.status,
      trialStartDate: row.trial_start_date,
      trialEndDate: row.trial_end_date,
      subscriptionId: row.subscription_id,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      lastLoginAt: row.last_login_at,
      metadata: row.metadata ? JSON.parse(row.metadata) : undefined,
    };
  }
}