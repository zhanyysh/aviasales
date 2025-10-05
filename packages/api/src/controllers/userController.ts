import { Request, Response } from 'express';
import { getDb } from '../db';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

// Middleware: Проверка роли ADMIN
function requireAdmin(req: Request, res: Response, next: Function) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: 'No token provided.' });
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    if (decoded.role !== 'ADMIN') return res.status(403).json({ message: 'Forbidden' });
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid token.' });
  }
}

// Получить всех пользователей
export const getAllUsers = [requireAdmin, async (req: Request, res: Response) => {
  try {
    const db = getDb();
    const [users] = await db.query('SELECT id, email, full_name, role, is_blocked, created_at FROM users');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Failed to get users', error: (error as Error).message });
  }
}];

// Заблокировать пользователя
export const blockUser = [requireAdmin, async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const db = getDb();
    await db.query('UPDATE users SET is_blocked = 1 WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: 'Failed to block user', error: (error as Error).message });
  }
}];

// Разблокировать пользователя
export const unblockUser = [requireAdmin, async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const db = getDb();
    await db.query('UPDATE users SET is_blocked = 0 WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: 'Failed to unblock user', error: (error as Error).message });
  }
}];
