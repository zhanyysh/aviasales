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
  <div className="w-full max-w-3xl mx-auto mt-8">
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-2xl font-bold mb-6 text-gray-800 text-center">Таблица вылетов на сегодня</h2>
        <div className="overflow-x-auto">
          <table className="w-full table-auto border-separate border-spacing-y-2">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Рейс</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Авиакомпания</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Откуда</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Куда</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Вылет</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Прилёт</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Пересадки</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Места</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Цена</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Подробнее</th>
              </tr>
            </thead>
            <tbody>
              {flights.map(flight => (
                <tr
                  key={flight.id}
                  className="bg-white hover:bg-indigo-50 transition rounded shadow-sm"
                  style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
                >
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{flight.flight_number}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{flight.airline_name} {flight.airline_iata ? `(${flight.airline_iata})` : ''}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{flight.departure_city} ({flight.departure_iata})</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{flight.arrival_city} ({flight.arrival_iata})</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{new Date(flight.departure_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{new Date(flight.arrival_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{typeof flight.stops !== 'undefined' ? flight.stops : 'N/A'}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{flight.seats_available}</td>
                  <td className="px-4 py-3 text-sm text-indigo-600 font-semibold">${flight.base_price}</td>
                  <td className="px-4 py-3">
                    <Link href={`/flight/${flight.id}`} className="inline-block bg-indigo-100 text-indigo-700 px-3 py-1 rounded hover:bg-indigo-200 transition text-xs font-medium">Подробнее</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
