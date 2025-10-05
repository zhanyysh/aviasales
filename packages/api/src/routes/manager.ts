import { Router } from 'express';
import { getDb } from '../db';

const router = Router();





router.get('/statistics', async (req, res) => {
  const db = getDb();
  // @ts-ignore
  const managerId = req.user?.id;
  if (!managerId) {
    return res.status(401).json({ error: 'Unauthorized: managerId missing' });
  }
  try {
    // Получить все airline_id, которыми управляет менеджер
    const [airlines] = await db.query(`SELECT id FROM airlines WHERE manager_id = ?`, [managerId]);
    const airlineIds = (airlines as any[]).map(a => a.id);
    if (airlineIds.length === 0) {
      return res.json({ totalFlights: 0, totalPaidBookings: 0, totalReservedBookings: 0, totalRevenue: 0, flights: [] });
    }
    // Получить все рейсы этих компаний
    const [flights] = await db.query(`SELECT id, flight_number, departure_time FROM flights WHERE airline_id IN (${airlineIds.join(',')})`);
    let totalPaidBookings = 0;
    let totalReservedBookings = 0;
    let totalRevenue = 0;
    const flightsStats = [];
    for (const flight of flights as any[]) {
      // Оплаченные (Confirmed)
      const [paid] = await db.query(`SELECT COUNT(*) as paid, SUM(total_price) as revenue FROM bookings WHERE flight_id = ? AND status = 'CONFIRMED'`, [flight.id]);
      // Забронированные (Confirmed + Not paid)
      const [reserved] = await db.query(`SELECT COUNT(*) as reserved FROM bookings WHERE flight_id = ? AND (status = 'CONFIRMED' OR status = 'NOT_PAID')`, [flight.id]);
      const paidArr = paid as any[];
      const reservedArr = reserved as any[];
      totalPaidBookings += paidArr[0]?.paid || 0;
      totalReservedBookings += reservedArr[0]?.reserved || 0;
      totalRevenue += Number(paidArr[0]?.revenue) || 0;
      flightsStats.push({
        id: flight.id,
        flight_number: flight.flight_number,
        departure_time: flight.departure_time,
        paidBookings: paidArr[0]?.paid || 0,
        reservedBookings: reservedArr[0]?.reserved || 0,
        revenue: Number(paidArr[0]?.revenue) || 0,
      });
    }
    res.json({
      totalFlights: (flights as any[]).length,
      totalPaidBookings,
      totalReservedBookings,
      totalRevenue,
      flights: flightsStats,
    });
  } catch (err) {
    console.error('Ошибка статистики менеджера:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

export default router;
