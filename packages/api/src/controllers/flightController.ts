// Получить ближайшие вылеты (например, 10 следующих)
export const getUpcomingFlights = async (req: Request, res: Response) => {
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
                airline.iata_code as airline_iata,
                f.stops
            FROM flights f
            JOIN airports dep_airport ON f.departure_airport_id = dep_airport.id
            JOIN airports arr_airport ON f.arrival_airport_id = arr_airport.id
            JOIN airlines airline ON f.airline_id = airline.id
            LEFT JOIN bookings b ON f.id = b.flight_id AND b.status = 'CONFIRMED'
            WHERE f.departure_time > NOW()
            GROUP BY f.id
            ORDER BY f.departure_time ASC
            LIMIT 10
        `;
        const [rows] = await db.query(query);
        res.json(rows);
    } catch (error) {
        console.error('Error getting upcoming flights:', error);
        res.status(500).json({ message: 'Failed to get upcoming flights', error: (error as Error).message });
    }
};
import { Request, Response } from 'express';
import { getDb } from '../db';

export const searchFlights = async (req: Request, res: Response) => {
    const { from, to, date, minPrice, maxPrice, airline } = req.query;
        const { stops } = req.query; // Added stops to the query parameters

    // Basic validation
    if (!from || !to || !date) {
        return res.status(400).json({ message: 'Missing required query parameters: from, to, date' });
    }

    try {
        const db = getDb();
        let query = `
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
                airline.iata_code as airline_iata,
                f.stops
            FROM flights f
            JOIN airports dep_airport ON f.departure_airport_id = dep_airport.id
            JOIN airports arr_airport ON f.arrival_airport_id = arr_airport.id
            JOIN airlines airline ON f.airline_id = airline.id
            LEFT JOIN bookings b ON f.id = b.flight_id AND b.status = 'CONFIRMED'
            WHERE dep_airport.city = ? AND arr_airport.city = ? AND DATE(f.departure_time) = ?
        `;
        const params: any[] = [from, to, date];
        if (minPrice) {
            query += ' AND f.base_price >= ?';
            params.push(minPrice);
        }
        if (maxPrice) {
            query += ' AND f.base_price <= ?';
            params.push(maxPrice);
        }
        if (airline) {
            query += ' AND airline.name LIKE ?';
            params.push(`%${airline}%`);
        }
            // Фильтрация по количеству пересадок
            if (stops !== undefined && stops !== '') {
                if (stops === '0') {
                    query += ' AND f.stops = 0';
                } else if (stops === '1') {
                    query += ' AND f.stops = 1';
                } else if (stops === '2') {
                    query += ' AND f.stops >= 2';
                }
            }
        query += ' GROUP BY f.id HAVING seats_available > 0';
        const [rows] = await db.query(query, params);
        res.json(rows);
    } catch (error) {
        console.error('Error searching flights:', error);
        res.status(500).json({ message: 'Failed to search flights', error: (error as Error).message });
    }
};

export const getFlightById = async (req: Request, res: Response) => {
    const { id } = req.params;
    if (!id) {
        return res.status(400).json({ message: 'Missing flight id' });
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
                    , f.stops
            FROM flights f
            JOIN airports dep_airport ON f.departure_airport_id = dep_airport.id
            JOIN airports arr_airport ON f.arrival_airport_id = arr_airport.id
            JOIN airlines airline ON f.airline_id = airline.id
            LEFT JOIN bookings b ON f.id = b.flight_id AND b.status = 'CONFIRMED'
            WHERE f.id = ?
            GROUP BY f.id
        `;
        const [rows]: any = await db.query(query, [id]);
        if (!rows || rows.length === 0) {
            return res.status(404).json({ message: 'Flight not found' });
        }
        res.json(rows[0]);
    } catch (error) {
        console.error('Error getting flight by id:', error);
        res.status(500).json({ message: 'Failed to get flight', error: (error as Error).message });
    }
};
