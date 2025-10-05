"use client";
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
  const [stats, setStats] = useState<ManagerStats | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    fetch('/api/manager/statistics', {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then(res => res.json())
      .then(data => {
        setStats(data);
        setLoading(false);
      });
  }, []);

  return (
    <main className="max-w-4xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Manager Panel</h1>
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
