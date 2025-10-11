import { Router } from 'express';
import { getDb } from '../db';

const router = Router();

// GET /api/airports - список аэропортов
router.get('/', async (req, res) => {
  try {
    const db = getDb();
    const [rows] = await db.query('SELECT id, name, city, iata_code FROM airports ORDER BY city, name');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Failed to get airports', error: (error as Error).message });
  }
});

export default router;
