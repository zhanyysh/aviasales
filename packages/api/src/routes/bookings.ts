import { Router } from 'express';
import { createBooking, getUserBookings, cancelBooking } from '../controllers/bookingController';

const router = Router();

// POST /api/bookings
router.post('/', createBooking);

// GET /api/bookings/user/:userId
router.get('/user/:userId', getUserBookings);

// POST /api/bookings/cancel/:bookingId
router.post('/cancel/:bookingId', cancelBooking);

export default router;
