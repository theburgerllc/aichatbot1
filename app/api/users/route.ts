import { NextRequest, NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';
import { logger } from '@/lib/logger';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

type UserData = {
  firstName: string;
  lastName: string;
  email: string;
  company: string;
  phone?: string;
  password?: string;
  trialEndDate?: string;
  subscription?: {
    id: string;
    status: string;
    planId: string;
  };
};

type LoginData = {
  email: string;
  password: string;
};

export async function POST(request: NextRequest) {
  return Sentry.startSpan(
    {
      op: "http.server",
      name: "POST /api/users",
    },
    async () => {
      try {
        const { action, ...data } = await request.json();
        
        logger.info('User API request received', { action, email: data.email });

        switch (action) {
          case 'create_trial_user':
            return await createTrialUser(data);
          case 'login':
            return await loginUser(data);
          case 'verify_token':
            return await verifyToken(request);
          default:
            logger.warn('Invalid user API action', { action });
            return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
        }
      } catch (error) {
        logger.error('User API error', { error: error instanceof Error ? error.message : error });
        Sentry.captureException(error);
        return NextResponse.json(
          { error: 'User operation failed' },
          { status: 500 }
        );
      }
    }
  );
}

async function createTrialUser(data: UserData) {
  return Sentry.startSpan(
    {
      op: "user.create_trial",
      name: "Create Trial User",
    },
    async (span) => {
      try {
        span.setAttribute("email", data.email);
        span.setAttribute("company", data.company);

        // Check if user already exists
        const existingUser = await findUserByEmail(data.email);
        if (existingUser) {
          return NextResponse.json(
            { error: 'User already exists with this email' },
            { status: 409 }
          );
        }

        // Generate temporary password for trial users
        const tempPassword = Math.random().toString(36).slice(-8);
        const hashedPassword = await bcrypt.hash(tempPassword, 12);

        // Calculate trial end date (14 days from now)
        const trialEndDate = new Date();
        trialEndDate.setDate(trialEndDate.getDate() + 14);

        const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        const newUser = {
          id: userId,
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email.toLowerCase(),
          company: data.company,
          phone: data.phone || '',
          password: hashedPassword,
          tempPassword,
          trialEndDate: trialEndDate.toISOString(),
          status: 'trial',
          createdAt: new Date().toISOString(),
          subscription: data.subscription || null,
        };

        // In production, this would be saved to database
        // For now, we'll simulate successful creation
        await simulateUserCreation(newUser);

        logger.info('Trial user created successfully', {
          userId: newUser.id,
          email: newUser.email,
          company: newUser.company,
          trialEndDate: newUser.trialEndDate
        });

        // Generate JWT token
        const token = generateJWT(newUser);

        // Send welcome email with login credentials
        await sendWelcomeEmail(newUser);

        span.setAttribute("user_id", newUser.id);
        span.setAttribute("status", "success");

        return NextResponse.json({
          success: true,
          user: {
            id: newUser.id,
            firstName: newUser.firstName,
            lastName: newUser.lastName,
            email: newUser.email,
            company: newUser.company,
            trialEndDate: newUser.trialEndDate,
            status: newUser.status,
          },
          token,
          tempPassword, // Only returned during trial creation
        });
      } catch (error) {
        logger.error('Trial user creation failed', {
          error: error instanceof Error ? error.message : error,
          email: data.email
        });
        
        Sentry.captureException(error);
        span.setAttribute("error", true);
        
        return NextResponse.json(
          { error: 'Failed to create trial user' },
          { status: 500 }
        );
      }
    }
  );
}

async function loginUser(data: LoginData) {
  return Sentry.startSpan(
    {
      op: "user.login",
      name: "User Login",
    },
    async (span) => {
      try {
        span.setAttribute("email", data.email);

        const user = await findUserByEmail(data.email);
        if (!user) {
          return NextResponse.json(
            { error: 'Invalid credentials' },
            { status: 401 }
          );
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(data.password, user.password);
        if (!isValidPassword) {
          return NextResponse.json(
            { error: 'Invalid credentials' },
            { status: 401 }
          );
        }

        // Check if trial has expired
        if (user.status === 'trial' && new Date() > new Date(user.trialEndDate)) {
          return NextResponse.json(
            { error: 'Trial has expired' },
            { status: 403 }
          );
        }

        // Generate JWT token
        const token = generateJWT(user);

        logger.info('User login successful', {
          userId: user.id,
          email: user.email,
          status: user.status
        });

        span.setAttribute("user_id", user.id);
        span.setAttribute("status", "success");

        return NextResponse.json({
          success: true,
          user: {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            company: user.company,
            status: user.status,
            trialEndDate: user.trialEndDate,
          },
          token,
        });
      } catch (error) {
        logger.error('User login failed', {
          error: error instanceof Error ? error.message : error,
          email: data.email
        });
        
        Sentry.captureException(error);
        span.setAttribute("error", true);
        
        return NextResponse.json(
          { error: 'Login failed' },
          { status: 500 }
        );
      }
    }
  );
}

async function verifyToken(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    
    const user = await findUserById(decoded.userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        company: user.company,
        status: user.status,
        trialEndDate: user.trialEndDate,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }
}

// Mock database functions (replace with actual database calls in production)
async function findUserByEmail(email: string) {
  // Simulate database lookup
  return null; // User not found
}

async function findUserById(id: string) {
  // Simulate database lookup
  return null; // User not found
}

async function simulateUserCreation(user: any) {
  // Simulate database save
  await new Promise(resolve => setTimeout(resolve, 100));
  return user;
}

function generateJWT(user: any) {
  return jwt.sign(
    { 
      userId: user.id, 
      email: user.email,
      status: user.status 
    },
    process.env.JWT_SECRET!,
    { expiresIn: '7d' }
  );
}

async function sendWelcomeEmail(user: any) {
  try {
    // Send email using your email service
    logger.info('Welcome email sent', {
      userId: user.id,
      email: user.email,
      tempPassword: user.tempPassword
    });
    
    // In production, integrate with your email service (Resend, SendGrid, etc.)
    return true;
  } catch (error) {
    logger.error('Failed to send welcome email', { error, userId: user.id });
    return false;
  }
}