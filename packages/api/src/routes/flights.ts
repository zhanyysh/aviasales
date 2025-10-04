import { Router } from 'express';
import { searchFlights, getFlightById } from '../controllers/flightController';

const router = Router();

// GET /api/flights/search?from=JFK&to=LAX&date=2025-11-15
router.get('/search', searchFlights);

// GET /api/flights/:id
router.get('/:id', getFlightById);

export default router;
