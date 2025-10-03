import { Router } from 'express';
import { getDb } from '../db';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const db = getDb();
    const [rows] = await db.query('SELECT * FROM banners');
    res.json(rows);
  } catch (err) {
    console.error('Ошибка получения баннеров:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

export default router;
