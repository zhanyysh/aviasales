import { Router } from 'express';
import { getDb } from '../db';
import multer from 'multer';
import path from 'path';


import { Request, Response } from 'express';

const storage = multer.diskStorage({
  destination: function (req: Request, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) {
    cb(null, path.join(__dirname, '../../public/banners'));
  },
  filename: function (req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});
const upload = multer({ storage });

const router = Router();

// Получить все баннеры
router.get('/', async (req: Request, res: Response) => {
  try {
    const db = getDb();
    const [rows] = await db.query('SELECT * FROM banners');
    res.json(rows);
  } catch (err) {
    console.error('Ошибка получения баннеров:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

router.put('/:id', async (req: Request, res: Response) => {
  try {
    const db = getDb();
    const { title, image_url, airline_id } = req.body;
    await db.query('UPDATE banners SET title = ?, image_url = ?, airline_id = ? WHERE id = ?', [title, image_url, airline_id, req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error('Ошибка редактирования баннера:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

router.post('/', upload.single('image'), async (req: Request, res: Response) => {
  try {
    const db = getDb();
    const { title, airline_id } = req.body;
    let image_url = req.body.image_url;
    if (req.file) {
      const file = req.file as Express.Multer.File;
      image_url = '/banners/' + file.filename;
    }
    await db.query('INSERT INTO banners (title, image_url, airline_id, is_active, created_at) VALUES (?, ?, ?, 0, NOW())', [title, image_url, airline_id]);
    res.json({ success: true });
  } catch (err) {
    console.error('Ошибка добавления баннера:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

router.post('/:id/deactivate', async (req, res) => {
  try {
    const db = getDb();
    await db.query('UPDATE banners SET is_active = 0 WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error('Ошибка деактивации баннера:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

router.post('/:id/activate', async (req, res) => {
  try {
    const db = getDb();
    await db.query('UPDATE banners SET is_active = 1 WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error('Ошибка активации баннера:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const db = getDb();
    await db.query('DELETE FROM banners WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error('Ошибка удаления баннера:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

export default router;
