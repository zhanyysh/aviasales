import { Router } from 'express';
import { searchFlights } from '../controllers/flightController';

const router = Router();

// GET /api/flights/search?from=JFK&to=LAX&date=2025-11-15
router.get('/search', searchFlights);

export default router;
