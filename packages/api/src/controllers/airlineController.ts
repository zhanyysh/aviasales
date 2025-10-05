export const getAirlineById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const db = getDb();
    const [rows] = await db.query('SELECT id, name, iata_code, is_active, manager_id FROM airlines WHERE id = ?', [id]);
    if (!rows || (Array.isArray(rows) && rows.length === 0)) {
      return res.status(404).json({ message: 'Airline not found' });
    }
    res.json(Array.isArray(rows) ? rows[0] : rows);
  } catch (error) {
    res.status(500).json({ message: 'Failed to get airline', error: (error as Error).message });
  }
};
import { Request, Response } from 'express';
import { getDb } from '../db';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

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

export const getAllAirlines = async (req: Request, res: Response) => {
  try {
    const db = getDb();
    const [airlines] = await db.query('SELECT id, name, iata_code, is_active, manager_id FROM airlines');
    res.json(airlines);
  } catch (error) {
    res.status(500).json({ message: 'Failed to get airlines', error: (error as Error).message });
  }
};

export const addAirline = [requireAdmin, async (req: Request, res: Response) => {
  const { name, iata_code } = req.body;
  if (!name || !iata_code) return res.status(400).json({ message: 'Name and IATA code required.' });
  try {
    const db = getDb();
    await db.query('INSERT INTO airlines (name, iata_code, is_active) VALUES (?, ?, 1)', [name, iata_code]);
    res.status(201).json({ success: true });
  } catch (error) {
    res.status(500).json({ message: 'Failed to add airline', error: (error as Error).message });
  }
}];

export const deactivateAirline = [requireAdmin, async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const db = getDb();
    await db.query('UPDATE airlines SET is_active = 0 WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: 'Failed to deactivate airline', error: (error as Error).message });
  }
}];

export const deleteAirline = [requireAdmin, async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const db = getDb();
    await db.query('DELETE FROM airlines WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete airline', error: (error as Error).message });
  }
}];

// Активировать авиакомпанию
export const activateAirline = [requireAdmin, async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const db = getDb();
    await db.query('UPDATE airlines SET is_active = 1 WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: 'Failed to activate airline', error: (error as Error).message });
  }
}];

// Заготовка: назначить менеджера
export const assignManager = [requireAdmin, async (req: Request, res: Response) => {
  const { id } = req.params;
  const { manager_id } = req.body;
  if (!manager_id) return res.status(400).json({ message: 'Manager ID required.' });
  try {
    const db = getDb();
    await db.query('UPDATE airlines SET manager_id = ? WHERE id = ?', [manager_id, id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: 'Failed to assign manager', error: (error as Error).message });
  }
}];
