import { Router } from 'express';
import { getDb } from '../db';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const db = getDb();
    const [rows] = await db.query(`
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
    `);
    res.json(rows);
  } catch (err) {
    console.error('Ошибка получения спецпредложений:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

export default router;
