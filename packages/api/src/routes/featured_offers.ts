
import { Router } from 'express';
import { getDb } from '../db';

const router = Router();

// Получить одно спецпредложение по id
router.get('/:id', async (req, res) => {
  try {
    const db = getDb();
    const [rows] = await db.query('SELECT * FROM featured_offers WHERE id = ?', [req.params.id]);
    const offers = rows as any[];
    if (!offers || offers.length === 0) {
      return res.status(404).json({ error: 'Offer not found' });
    }
    res.json(offers[0]);
  } catch (err) {
    console.error('Ошибка получения спецпредложения:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Получить все или одно предложение по id рейса
router.get('/', async (req, res) => {
  try {
    const db = getDb();
    const { flight_id } = req.query;
    let query = `
      SELECT fo.*, f.departure_airport_id, f.arrival_airport_id, f.departure_time, f.arrival_time, f.airline_id,
        da.name AS departure_airport_name, da.city AS departure_city,
        aa.name AS arrival_airport_name, aa.city AS arrival_city,
        al.name AS airline_name
      FROM featured_offers fo
      JOIN flights f ON fo.flight_id = f.id
      JOIN airports da ON f.departure_airport_id = da.id
      JOIN airports aa ON f.arrival_airport_id = aa.id
      JOIN airlines al ON f.airline_id = al.id
      WHERE fo.is_active = 1
    `;
    const params: any[] = [];
    if (flight_id) {
      query += ' AND fo.flight_id = ?';
      params.push(flight_id);
    }
    const [rows] = await db.query(query, params);
    res.json(flight_id ? (rows as any[])[0] || null : rows);
  } catch (err) {
    console.error('Ошибка получения спецпредложений:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

export default router;
