import { Router } from 'express';
import { searchFlights, getFlightById, getUpcomingFlights } from '../controllers/flightController';

const router = Router();

// GET /api/flights/search?from=JFK&to=LAX&date=2025-11-15
router.get('/search', searchFlights);

// GET /api/flights/upcoming
router.get('/upcoming', getUpcomingFlights);

// GET /api/flights/:id
router.get('/:id', getFlightById);

export default router;
