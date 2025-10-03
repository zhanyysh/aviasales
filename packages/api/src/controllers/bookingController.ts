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
            [userId, flight_id, confirmation_id, JSON.stringify(passenger_details), total_price, 'CONFIRMED']
        );
        res.status(201).json({ message: 'Booking created.', confirmation_id });
    } catch (error) {
        res.status(500).json({ message: 'Booking failed.', error: (error as Error).message });
    }
};

export const getUserBookings = async (req: Request, res: Response) => {
    const { userId } = req.params;
    try {
        const db = getDb();
        const [rows] = await db.query(
            `SELECT b.*, f.flight_number, f.departure_time, f.arrival_time, f.base_price, f.departure_airport_id, f.arrival_airport_id, f.airline_id
             FROM bookings b
             JOIN flights f ON b.flight_id = f.id
             WHERE b.user_id = ? ORDER BY b.created_at DESC`,
            [userId]
        );
        res.json(rows);
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
