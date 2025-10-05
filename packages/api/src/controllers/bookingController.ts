import { Request, Response } from 'express';
import { getDb } from '../db';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

export const createBooking = async (req: Request, res: Response) => {
    // Получаем токен из заголовка
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: 'No token provided.' });
    const token = authHeader.split(' ')[1];
    let userId;
    try {
        const decoded = jwt.verify(token, JWT_SECRET) as any;
        userId = decoded.id;
    } catch {
        return res.status(401).json({ message: 'Invalid token.' });
    }

    const { flight_id, passenger_details, total_price } = req.body;
    if (!flight_id || !passenger_details || !total_price) {
        return res.status(400).json({ message: 'Missing required fields.' });
    }
    try {
        const db = getDb();
        // Генерируем уникальный confirmation_id
        const confirmation_id = 'CONF-' + Math.random().toString(36).substr(2, 9).toUpperCase();
        await db.query(
            'INSERT INTO bookings (user_id, flight_id, confirmation_id, passenger_details, total_price, status) VALUES (?, ?, ?, ?, ?, ?)',
            [userId, flight_id, confirmation_id, JSON.stringify(passenger_details), total_price, 'NOT_PAID']
        );
        res.status(201).json({ message: 'Booking created.' });
    } catch (error) {
        res.status(500).json({ message: 'Booking failed.', error: (error as Error).message });
    }
};

export const payBooking = async (req: Request, res: Response) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: 'No token provided.' });
    const token = authHeader.split(' ')[1];
    let userId;
    try {
        const decoded = jwt.verify(token, JWT_SECRET) as any;
        userId = decoded.id;
    } catch {
        return res.status(401).json({ message: 'Invalid token.' });
    }
    const { bookingId } = req.params;
    try {
        const db = getDb();
        // Проверяем, что бронирование принадлежит пользователю и не оплачено
        const [rows] = await db.query('SELECT * FROM bookings WHERE id = ? AND user_id = ?', [bookingId, userId]);
        if ((rows as any[]).length === 0) {
            return res.status(404).json({ message: 'Booking not found.' });
        }
        const booking = (rows as any[])[0];
        if (booking.status !== 'NOT_PAID') {
            return res.status(400).json({ message: 'Booking already paid or canceled.' });
        }
        await db.query('UPDATE bookings SET status = ? WHERE id = ?', ['CONFIRMED', bookingId]);
        res.json({ message: 'Payment successful.', confirmation_id: booking.confirmation_id });
    } catch (error) {
        res.status(500).json({ message: 'Payment failed.', error: (error as Error).message });
    }
};

export const getUserBookings = async (req: Request, res: Response) => {
    const { userId } = req.params;
    try {
        const db = getDb();
        const [rows] = await db.query(
            `SELECT b.*, f.flight_number, f.departure_time, f.arrival_time, f.base_price, f.stops,
                f.total_seats, f.airline_id, f.departure_airport_id, f.arrival_airport_id,
                dep_airport.name as departure_airport_name, dep_airport.city as departure_city, dep_airport.iata_code as departure_iata,
                arr_airport.name as arrival_airport_name, arr_airport.city as arrival_city, arr_airport.iata_code as arrival_iata,
                airline.name as airline_name, airline.iata_code as airline_iata
             FROM bookings b
             JOIN flights f ON b.flight_id = f.id
             JOIN airports dep_airport ON f.departure_airport_id = dep_airport.id
             JOIN airports arr_airport ON f.arrival_airport_id = arr_airport.id
             JOIN airlines airline ON f.airline_id = airline.id
             WHERE b.user_id = ? AND airline.is_active = 1 ORDER BY b.created_at DESC`,
            [userId]
        );
        // Парсим passenger_details для каждого бронирования
        const bookings = Array.isArray(rows) ? rows.map((row: any) => {
            try {
                row.passenger_details = row.passenger_details ? JSON.parse(row.passenger_details) : null;
            } catch {
                row.passenger_details = null;
            }
            return row;
        }) : rows;
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: 'Failed to get bookings.', error: (error as Error).message });
    }
};

export const cancelBooking = async (req: Request, res: Response) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: 'No token provided.' });
    const token = authHeader.split(' ')[1];
    let userId;
    try {
        const decoded = jwt.verify(token, JWT_SECRET) as any;
        userId = decoded.id;
    } catch {
        return res.status(401).json({ message: 'Invalid token.' });
    }
    const { bookingId } = req.params;
    try {
        const db = getDb();
        // Получаем бронирование и время рейса через JOIN
        const [rows] = await db.query(
            `SELECT b.*, f.departure_time FROM bookings b JOIN flights f ON b.flight_id = f.id WHERE b.id = ? AND b.user_id = ?`,
            [bookingId, userId]
        );
        if ((rows as any[]).length === 0) {
            return res.status(404).json({ message: 'Booking not found.' });
        }
        const booking = (rows as any[])[0];
        const flightTime = new Date(booking.departure_time).getTime();
        const now = Date.now();
        let newStatus = 'CANCELED';
        if (flightTime - now > 24 * 60 * 60 * 1000) {
            newStatus = 'REFUNDED';
        }
        await db.query('UPDATE bookings SET status = ? WHERE id = ?', [newStatus, bookingId]);
        res.json({ message: 'Booking updated.', status: newStatus });
    } catch (error) {
        res.status(500).json({ message: 'Cancel failed.', error: (error as Error).message });
    }
};
