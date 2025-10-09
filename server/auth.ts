import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import { db } from './db';
import { users } from '@shared/schema';
import { eq } from 'drizzle-orm';

const SALT_ROUNDS = 10;

// Extend Express Session to include userId
declare module 'express-session' {
  interface SessionData {
    userId?: string;
  }
}

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        name: string | null;
      };
    }
  }
}

// Hash password
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

// Verify password
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// Authentication middleware
export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const userId = req.session?.userId;

  if (!userId) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'AUTH_REQUIRED',
        message: 'Authentication required'
      }
    });
  }

  try {
    const user = await db.select({
      id: users.id,
      email: users.email,
      name: users.name
    }).from(users).where(eq(users.id, userId)).limit(1);

    if (!user[0]) {
      req.session.destroy(() => {});
      return res.status(401).json({
        success: false,
        error: {
          code: 'AUTH_REQUIRED',
          message: 'Invalid session'
        }
      });
    }

    req.user = user[0];
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'DATABASE_ERROR',
        message: 'Authentication failed'
      }
    });
  }
}
