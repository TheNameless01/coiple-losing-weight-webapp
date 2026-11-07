import crypto from 'crypto';
import { Request, Response, NextFunction } from 'express';
import { db, User } from './db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'couplefit_dev_secret_key_32bytes_long';

// In-memory or session map: token -> { userId, expiresAt }
const activeSessions = new Map<string, { userId: string; expiresAt: number }>();

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  const [salt, originalHash] = storedHash.split(':');
  if (!salt || !originalHash) return false;
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(originalHash, 'hex'));
}

export function hashInvitationToken(token: string): string {
  return crypto.createHmac('sha256', JWT_SECRET).update(token).digest('hex');
}

export function createSession(userId: string): string {
  const token = crypto.randomBytes(32).toString('hex');
  // 30 days session
  const expiresAt = Date.now() + 30 * 24 * 60 * 60 * 1000;
  activeSessions.set(token, { userId, expiresAt });
  return token;
}

export function getSessionUser(token: string): User | null {
  const session = activeSessions.get(token);
  if (!session) return null;
  if (Date.now() > session.expiresAt) {
    activeSessions.delete(token);
    return null;
  }
  const data = db.getData();
  return data.users.find((u) => u.id === session.userId) || null;
}

export interface AuthenticatedRequest extends Request {
  user?: User;
}

export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: missing or invalid Bearer token' });
  }

  const token = authHeader.split(' ')[1];
  const user = getSessionUser(token);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized: session expired or invalid' });
  }

  req.user = user;
  next();
}
