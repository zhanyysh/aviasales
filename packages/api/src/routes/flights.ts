import { Router } from 'express';
import { getDb } from '../db';

const router = Router();

// GET /api/flights/all
router.get('/all', async (req, res) => {
	try {
		const db = getDb();
		const [rows] = await db.query(`
			SELECT
				f.id,
				f.flight_number,
				f.departure_time,
				f.arrival_time,
				f.base_price,
				f.airline_id,
				dep_airport.name as departure_airport_name,
				dep_airport.city as departure_city,
				dep_airport.iata_code as departure_iata,
				arr_airport.name as arrival_airport_name,
				arr_airport.city as arrival_city,
				arr_airport.iata_code as arrival_iata,
				airline.name as airline_name,
				airline.iata_code as airline_iata,
				f.stops
			FROM flights f
			JOIN airports dep_airport ON f.departure_airport_id = dep_airport.id
			JOIN airports arr_airport ON f.arrival_airport_id = arr_airport.id
			JOIN airlines airline ON f.airline_id = airline.id
			ORDER BY f.departure_time ASC
		`);
		res.json(rows);
	} catch (err) {
		console.error('Ошибка получения всех рейсов:', err);
		res.status(500).json({ error: 'Ошибка сервера' });
	}
});

import { searchFlights, getFlightById, getUpcomingFlights, createFlight } from '../controllers/flightController';
// POST /api/flights (только для менеджеров)
router.post('/', createFlight);

// GET /api/flights/search?from=JFK&to=LAX&date=2025-11-15
router.get('/search', searchFlights);

// GET /api/flights/upcoming
router.get('/upcoming', getUpcomingFlights);

// GET /api/flights/:id
router.get('/:id', getFlightById);

export default router;
