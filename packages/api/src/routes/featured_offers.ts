import { Router } from 'express';
import { getDb } from '../db';

const router = Router();

// Создать спецпредложение
router.post('/', async (req, res) => {
  try {
    const db = getDb();
    const { title, description, flight_id, discount_price } = req.body;
    await db.query(
      'INSERT INTO featured_offers (title, description, flight_id, discount_price, is_active, created_at) VALUES (?, ?, ?, ?, 1, NOW())',
      [title, description, flight_id, discount_price]
    );
    res.json({ success: true });
  } catch (err) {
    console.error('Ошибка создания спецпредложения:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

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

// Получить все спецпредложения (для админки — без фильтра is_active)
router.get('/', async (req, res) => {
  try {
    const db = getDb();
    // Если явно передан ?activeOnly=1 — фильтруем только активные
    const { activeOnly, flight_id } = req.query;
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
      WHERE al.is_active = 1
    `;
    const params: any[] = [];
    if (activeOnly === '1') {
      query += ' AND fo.is_active = 1';
    }
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


// Активировать спецпредложение
router.post('/:id/activate', async (req, res) => {
  try {
    const db = getDb();
    await db.query('UPDATE featured_offers SET is_active = 1 WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error('Ошибка активации спецпредложения:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Деактивировать спецпредложение
router.post('/:id/deactivate', async (req, res) => {
  try {
    const db = getDb();
    await db.query('UPDATE featured_offers SET is_active = 0 WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error('Ошибка деактивации спецпредложения:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Редактировать спецпредложение
router.put('/:id', async (req, res) => {
  try {
    const db = getDb();
    const { title, description, flight_id, discount_price } = req.body;
    await db.query('UPDATE featured_offers SET title = ?, description = ?, flight_id = ?, discount_price = ? WHERE id = ?', [title, description, flight_id, discount_price, req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error('Ошибка редактирования спецпредложения:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Удалить спецпредложение
router.delete('/:id', async (req, res) => {
  try {
    const db = getDb();
    await db.query('DELETE FROM featured_offers WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error('Ошибка удаления спецпредложения:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

export default router;
