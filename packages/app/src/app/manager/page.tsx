"use client";
const API_URL = 'https://aviasales-api-xi.vercel.app';
import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

interface ManagerStats {
  totalFlights: number;
  totalPaidBookings: number;
  totalReservedBookings: number;
  totalRevenue: number;
  flights: Array<{
    id: number;
    flight_number: string;
    departure_time: string;
    paidBookings: number;
    reservedBookings: number;
    revenue: number;
  }>;
}

export default function ManagerPanel() {
  // Список аэропортов
  const [airports, setAirports] = useState<Array<{ id: number; name: string; city: string; iata_code: string }>>([]);
  useEffect(() => {
    const fetchAirports = async () => {
      const res = await fetch(`${API_URL}/api/airports`);
      if (res.ok) {
        const data = await res.json();
        setAirports(data);
      }
    };
    fetchAirports();
  }, []);
  const [stats, setStats] = useState<ManagerStats | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    fetch(`${API_URL}/api/manager/statistics`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then(res => res.json())
      .then(data => {
        setStats(data);
        setLoading(false);
      });
  }, []);

  // Состояния для формы создания рейса
  const [createFlightLoading, setCreateFlightLoading] = useState(false);
  const [createFlightError, setCreateFlightError] = useState<string | null>(null);
  const [createFlightSuccess, setCreateFlightSuccess] = useState<string | null>(null);
  const [flightForm, setFlightForm] = useState({
    flight_number: '',
    departure_time: '',
    arrival_time: '',
    base_price: '',
    departure_airport_id: '',
    arrival_airport_id: '',
    total_seats: '',
    stops: '',
  });

  // airline info for manager
  const [airline, setAirline] = useState<{ id: number; name: string } | null>(null);
  useEffect(() => {
    const fetchAirline = async () => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      if (!token) return;
      // Получаем airline менеджера
      const res = await fetch(`${API_URL}/api/manager/airline`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setAirline(data);
      }
    };
    fetchAirline();
  }, []);

  const handleFlightFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFlightForm({ ...flightForm, [e.target.name]: e.target.value });
  };

  const handleCreateFlight = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateFlightLoading(true);
    setCreateFlightError(null);
    setCreateFlightSuccess(null);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const response = await fetch(`${API_URL}/api/flights`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(flightForm),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to create flight');
      }
      setCreateFlightSuccess('Flight created successfully!');
      setFlightForm({
        flight_number: '',
        departure_time: '',
        arrival_time: '',
        base_price: '',
        departure_airport_id: '',
        arrival_airport_id: '',
        total_seats: '',
        stops: '',
      });
    } catch (err: any) {
      setCreateFlightError(err.message);
    } finally {
      setCreateFlightLoading(false);
    }
  };

  return (
    <main className="max-w-4xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Manager Panel</h1>
      {/* Форма создания рейса */}
      <div className="bg-white rounded shadow p-6 mb-8">
        <h2 className="text-lg font-bold mb-4">Add New Flight</h2>
        {airline && (
          <div className="mb-2 text-indigo-700 font-semibold">Your airline: {airline.name}</div>
        )}
        <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={handleCreateFlight}>
          <input name="flight_number" value={flightForm.flight_number} onChange={handleFlightFormChange} className="border p-2 rounded" placeholder="Flight Number" required />
          <div className="flex flex-col">
            <label htmlFor="departure_time" className="text-sm text-gray-600 mb-1">Departure date and time</label>
            <input
              id="departure_time"
              name="departure_time"
              value={flightForm.departure_time}
              onChange={handleFlightFormChange}
              className="border p-2 rounded"
              type="datetime-local"
              placeholder="Departure date and time"
              required
            />
          </div>
          <div className="flex flex-col">
            <label htmlFor="arrival_time" className="text-sm text-gray-600 mb-1">Arrival date and time</label>
            <input
              id="arrival_time"
              name="arrival_time"
              value={flightForm.arrival_time}
              onChange={handleFlightFormChange}
              className="border p-2 rounded"
              type="datetime-local"
              placeholder="Arrival date and time"
              required
            />
          </div>
          <input name="base_price" value={flightForm.base_price} onChange={handleFlightFormChange} className="border p-2 rounded" placeholder="Base Price" required />
          <select
            name="departure_airport_id"
            value={flightForm.departure_airport_id}
            onChange={handleFlightFormChange}
            className="border p-2 rounded"
            required
          >
            <option value="">Select departure airport</option>
            {airports.map(a => (
              <option key={a.id} value={a.id}>
                {a.city} — {a.name} ({a.iata_code})
              </option>
            ))}
          </select>
          <select
            name="arrival_airport_id"
            value={flightForm.arrival_airport_id}
            onChange={handleFlightFormChange}
            className="border p-2 rounded"
            required
          >
            <option value="">Select arrival airport</option>
            {airports.map(a => (
              <option key={a.id} value={a.id}>
                {a.city} — {a.name} ({a.iata_code})
              </option>
            ))}
          </select>
          <input name="total_seats" value={flightForm.total_seats} onChange={handleFlightFormChange} className="border p-2 rounded" placeholder="Total Seats" required />
          <input name="stops" value={flightForm.stops} onChange={handleFlightFormChange} className="border p-2 rounded" placeholder="Stops (0 for direct)" required />
          <button type="submit" className="col-span-1 md:col-span-2 bg-indigo-600 text-white py-2 rounded mt-2" disabled={createFlightLoading}>{createFlightLoading ? 'Adding...' : 'Add Flight'}</button>
        </form>
        {createFlightError && <p className="text-red-600 mt-2">{createFlightError}</p>}
        {createFlightSuccess && <p className="text-green-600 mt-2">{createFlightSuccess}</p>}
      </div>
      {loading && <p>Loading...</p>}
      {stats && (
        <>
          <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded shadow p-4 text-center">
              <div className="text-lg">Flights managed</div>
              <div className="text-2xl font-bold">{stats.totalFlights}</div>
            </div>
            <div className="bg-white rounded shadow p-4 text-center">
              <div className="text-lg">Paid bookings</div>
              <div className="text-2xl font-bold text-black">{stats.totalPaidBookings}</div>
            </div>
            <div className="bg-white rounded shadow p-4 text-center">
              <div className="text-lg">Reserved bookings</div>
              <div className="text-2xl font-bold text-black">{stats.totalReservedBookings}</div>
            </div>
            <div className="bg-white rounded shadow p-4 text-center">
              <div className="text-lg">Revenue</div>
              <div className="text-2xl font-bold text-indigo-700">${(typeof stats.totalRevenue === 'number' && !isNaN(stats.totalRevenue) ? stats.totalRevenue : 0).toLocaleString()}</div>
            </div>
          </div>
          <h2 className="text-xl font-bold mb-4">Flights</h2>
          <div className="bg-white rounded shadow p-4 mb-8">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.flights}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="flight_number" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="bookings" fill="#8884d8" name="Bookings" />
                <Bar dataKey="revenue" fill="#82ca9d" name="Revenue" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <table className="w-full table-auto bg-white rounded shadow">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-2">Flight</th>
                <th className="px-4 py-2">Departure</th>
                <th className="px-4 py-2">Paid bookings</th>
                <th className="px-4 py-2">Reserved bookings</th>
                <th className="px-4 py-2">Revenue</th>
              </tr>
            </thead>
            <tbody>
              {(Array.isArray(stats.flights) ? stats.flights : []).map(f => (
                <tr key={f.id}>
                  <td className="px-4 py-2 font-semibold">{f.flight_number}</td>
                  <td className="px-4 py-2">{f.departure_time}</td>
                  <td className="px-4 py-2 text-black">{f.paidBookings}</td>
                  <td className="px-4 py-2 text-black">{f.reservedBookings}</td>
                  <td className="px-4 py-2">${f.revenue.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </main>
  );
}
