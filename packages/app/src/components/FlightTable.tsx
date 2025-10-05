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
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
  <h2 className="text-2xl font-bold mb-6 text-gray-800 text-center">Таблица ближайших рейс</h2>
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
              {flights.map(f => (
                <tr key={f.id}>
                  <td className="px-4 py-2 font-semibold">{f.flight_number}</td>
                  <td className="px-4 py-2">{f.airline_name}</td>
                  <td className="px-4 py-2">{f.departure_city} ({f.departure_iata})</td>
                  <td className="px-4 py-2">{f.arrival_city} ({f.arrival_iata})</td>
                  <td className="px-4 py-2">{new Date(f.departure_time).toLocaleString()}</td>
                  <td className="px-4 py-2">{new Date(f.arrival_time).toLocaleString()}</td>
                  <td className="px-4 py-2">{f.stops}</td>
                  <td className="px-4 py-2">{f.seats_available}</td>
                  <td className="px-4 py-2 font-bold text-indigo-600">${(typeof f.base_price === 'number' ? f.base_price : parseFloat(f.base_price)).toFixed(2)}</td>
                  <td className="px-4 py-2">
                    <a href={`/flight/${f.id}`} className="px-3 py-1 rounded bg-indigo-100 text-indigo-700 hover:bg-indigo-200 transition">Подробнее</a>
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
