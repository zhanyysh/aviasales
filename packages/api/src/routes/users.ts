import { Router } from 'express';
import { getAllUsers, blockUser, unblockUser } from '../controllers/userController';
import { getDb } from '../db';

const router = Router();

router.get('/', getAllUsers);
router.post('/:id/block', blockUser);
router.post('/:id/unblock', unblockUser);


// Назначить пользователя менеджером
router.post('/:id/make-manager', async (req, res) => {
	const db = getDb();
	const userId = req.params.id;
	try {
		await db.query('UPDATE users SET role = ? WHERE id = ?', ['MANAGER', userId]);
		res.json({ success: true });
	} catch (err) {
		console.error('Ошибка назначения менеджером:', err);
		res.status(500).json({ error: 'Ошибка сервера' });
	}
});

// Назначить пользователя обычным юзером
router.post('/:id/make-user', async (req, res) => {
	const db = getDb();
	const userId = req.params.id;
	try {
		await db.query('UPDATE users SET role = ? WHERE id = ?', ['USER', userId]);
		res.json({ success: true });
	} catch (err) {
		console.error('Ошибка назначения пользователем:', err);
		res.status(500).json({ error: 'Ошибка сервера' });
	}
});

export default router;
