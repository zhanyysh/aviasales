import { Router } from 'express';
import { getDb } from '../db';


const router = Router();

function getPeriodSql(period: string, field: string = 'created_at') {
  if (period === 'today') return `DATE(${field}) = CURDATE()`;
  if (period === 'week') return `YEARWEEK(${field}, 1) = YEARWEEK(CURDATE(), 1)`;
  if (period === 'month') return `YEAR(${field}) = YEAR(CURDATE()) AND MONTH(${field}) = MONTH(CURDATE())`;
  return '1'; // all time
}

router.get('/', async (req, res) => {
  const db = getDb();
  const period = typeof req.query.period === 'string' ? req.query.period : 'all';
  try {
    // Flights
    const [flights] = await db.query(`
      SELECT 
        COUNT(*) as total,
        SUM(departure_time > NOW()) as active,
        SUM(departure_time <= NOW()) as completed
      FROM flights
      WHERE ${getPeriodSql(period, 'departure_time')}
    `);
    // Bookings
  const [bookings] = await db.query(`SELECT COUNT(*) as passengers FROM bookings WHERE status != 'REFUNDED' AND ${getPeriodSql(period)}`);
  const [revenueRows] = await db.query(`SELECT SUM(total_price) as revenue FROM bookings WHERE status = 'CONFIRMED' AND ${getPeriodSql(period)}`);
    const flightsRow = (flights as any[])[0] || {};
    const bookingsRow = (bookings as any[])[0] || {};
    const revenueRow = (revenueRows as any[])[0] || {};
    res.json({
      totalFlights: flightsRow.total || 0,
      activeFlights: flightsRow.active || 0,
      completedFlights: flightsRow.completed || 0,
      totalPassengers: bookingsRow.passengers || 0,
      totalRevenue: revenueRow.revenue || 0,
    });
  } catch (err) {
    console.error('Ошибка статистики:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

export default router;
