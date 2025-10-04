import { useEffect, useState } from 'react';
import { Flight } from '../types';
import Link from 'next/link';

export default function FlightTable() {
  const [flights, setFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Получаем ближайшие вылеты (например, 10 следующих рейсов)
    fetch('/api/flights/upcoming')
      .then(res => res.ok ? res.json() : Promise.reject(res))
      .then(data => {
        setFlights(data);
        setLoading(false);
      })
      .catch(err => {
        setError('Ошибка загрузки рейсов');
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Загрузка таблицы вылетов...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (flights.length === 0) return <p>Нет вылетов на сегодня.</p>;

  return (
    <div className="w-full max-w-5xl mx-auto mt-8">
      <h2 className="text-2xl font-bold mb-4">Таблица вылетов на сегодня</h2>
      <table className="w-full table-auto border-collapse bg-white shadow rounded">
        <thead>
          <tr className="bg-gray-100">
            <th className="px-4 py-2">Рейс</th>
            <th className="px-4 py-2">Авиакомпания</th>
            <th className="px-4 py-2">Откуда</th>
            <th className="px-4 py-2">Куда</th>
            <th className="px-4 py-2">Время вылета</th>
            <th className="px-4 py-2">Время прилёта</th>
            <th className="px-4 py-2">Пересадки</th>
            <th className="px-4 py-2">Места</th>
            <th className="px-4 py-2">Цена</th>
            <th className="px-4 py-2">Подробнее</th>
          </tr>
        </thead>
        <tbody>
          {flights.map(flight => (
            <tr key={flight.id} className="border-b">
              <td className="px-4 py-2">{flight.flight_number}</td>
              <td className="px-4 py-2">{flight.airline_name} {flight.airline_iata ? `(${flight.airline_iata})` : ''}</td>
              <td className="px-4 py-2">{flight.departure_city} ({flight.departure_iata})</td>
              <td className="px-4 py-2">{flight.arrival_city} ({flight.arrival_iata})</td>
              <td className="px-4 py-2">{new Date(flight.departure_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
              <td className="px-4 py-2">{new Date(flight.arrival_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
              <td className="px-4 py-2">{typeof flight.stops !== 'undefined' ? flight.stops : 'N/A'}</td>
              <td className="px-4 py-2">{flight.seats_available}</td>
              <td className="px-4 py-2">${flight.base_price}</td>
              <td className="px-4 py-2">
                <Link href={`/flight/${flight.id}`} className="text-blue-600 hover:underline">Подробнее</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
