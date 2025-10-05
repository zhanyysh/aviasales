import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getDb } from '../db';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

export const register = async (req: Request, res: Response) => {
    const { email, password, full_name } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required.' });
    }
    try {
        const db = getDb();
        // Проверяем, существует ли пользователь
        const [users] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
        if ((users as any[]).length > 0) {
            return res.status(409).json({ message: 'User already exists.' });
        }
        // Хешируем пароль
        const password_hash = await bcrypt.hash(password, 10);
        await db.query('INSERT INTO users (email, password_hash, full_name) VALUES (?, ?, ?)', [email, password_hash, full_name || null]);
        return res.status(201).json({ message: 'User registered successfully.' });
    } catch (error) {
        console.error('Register error:', error);
        return res.status(500).json({ message: 'Registration failed.', error: (error as Error).message });
    }
};

export const login = async (req: Request, res: Response) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required.' });
    }
    try {
        const db = getDb();
        const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if ((users as any[]).length === 0) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }
        const user = (users as any[])[0];
        if (user.is_blocked) {
            return res.status(403).json({ message: 'Your account is blocked. Access denied.' });
        }
        const valid = await bcrypt.compare(password, user.password_hash);
        if (!valid) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }
        // Генерируем JWT
        const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
        return res.json({ token, user: { id: user.id, email: user.email, full_name: user.full_name, role: user.role } });
    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({ message: 'Login failed.', error: (error as Error).message });
    }
};
