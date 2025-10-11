import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

function requireManager(req: Request, res: Response, next: Function) {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: 'No token provided.' });
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, JWT_SECRET) as any;
        if (decoded.role !== 'MANAGER') return res.status(403).json({ message: 'Forbidden: Only managers can add flights.' });
        next();
    } catch {
        return res.status(401).json({ message: 'Invalid token.' });
    }
}

export const createFlight = [requireManager, async (req: Request, res: Response) => {
    const { flight_number, departure_time, arrival_time, base_price, departure_airport_id, arrival_airport_id, total_seats, stops } = req.body;
    if (!flight_number || !departure_time || !arrival_time || !base_price || !departure_airport_id || !arrival_airport_id || !total_seats) {
        return res.status(400).json({ message: 'Missing required fields.' });
    }
    try {
        const db = getDb();
        // Получаем airline_id по user_id менеджера
        const authHeader = req.headers.authorization;
        const token = authHeader ? authHeader.split(' ')[1] : null;
        let managerId = null;
        if (token) {
          const decoded = jwt.verify(token, JWT_SECRET) as any;
          managerId = decoded.id;
        }
        if (!managerId) return res.status(403).json({ message: 'Manager id not found in token.' });
        // Находим airline_id по manager_id
        const [rows]: any = await db.query('SELECT id, name FROM airlines WHERE manager_id = ?', [managerId]);
        if (!rows || rows.length === 0) {
          return res.status(400).json({ message: 'No airline found for this manager.' });
        }
        const airline_id = rows[0].id;
        await db.query(
            `INSERT INTO flights (flight_number, departure_time, arrival_time, base_price, airline_id, departure_airport_id, arrival_airport_id, total_seats, stops)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [flight_number, departure_time, arrival_time, base_price, airline_id, departure_airport_id, arrival_airport_id, total_seats, stops || 0]
        );
        res.status(201).json({ message: 'Flight created successfully.' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to create flight', error: (error as Error).message });
    }
}];
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
            WHERE f.departure_time > NOW() AND f.departure_time < DATE_ADD(NOW(), INTERVAL 7 DAY) AND airline.is_active = 1
            GROUP BY f.id
            ORDER BY f.departure_time ASC
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
            WHERE dep_airport.city = ? AND arr_airport.city = ? AND DATE(f.departure_time) = ? AND airline.is_active = 1
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
            WHERE f.id = ? AND airline.is_active = 1
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
