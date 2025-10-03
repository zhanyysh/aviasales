import { Request, Response } from 'express';
import { getDb } from '../db';

export const searchFlights = async (req: Request, res: Response) => {
    const { from, to, date } = req.query;

    // Basic validation
    if (!from || !to || !date) {
        return res.status(400).json({ message: 'Missing required query parameters: from, to, date' });
    }

    try {
        const db = getDb();
        const query = `
            SELECT
                f.id,
                f.flight_number,
                f.departure_time,
                f.arrival_time,
                f.base_price,
                (f.total_seats - COUNT(b.id)) as seats_available,
                dep_airport.name as departure_airport_name,
                dep_airport.city as departure_city,
                dep_airport.iata_code as departure_iata,
                arr_airport.name as arrival_airport_name,
                arr_airport.city as arrival_city,
                arr_airport.iata_code as arrival_iata,
                airline.name as airline_name,
                airline.iata_code as airline_iata
            FROM flights f
            JOIN airports dep_airport ON f.departure_airport_id = dep_airport.id
            JOIN airports arr_airport ON f.arrival_airport_id = arr_airport.id
            JOIN airlines airline ON f.airline_id = airline.id
            LEFT JOIN bookings b ON f.id = b.flight_id AND b.status = 'CONFIRMED'
            WHERE
                dep_airport.city = ? AND
                arr_airport.city = ? AND
                DATE(f.departure_time) = ?
            GROUP BY f.id
            HAVING seats_available > 0;
        `;

        const [rows] = await db.query(query, [from, to, date]);
        
        res.json(rows);

    } catch (error) {
        console.error('Error searching flights:', error);
        res.status(500).json({ message: 'Failed to search flights', error: (error as Error).message });
    }
};
