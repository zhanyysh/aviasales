'use client';

import { useEffect, useState } from 'react';
import { Flight } from '../../types';

interface Booking {
  id: number;
  confirmation_id: string;
  status: string;
  total_price: string;
  created_at: string;
  flight_number: string;
  departure_time: string;
  arrival_time: string;
  airline_name?: string;
  airline_iata?: string;
  departure_city?: string;
  departure_airport_name?: string;
  departure_iata?: string;
  arrival_city?: string;
  arrival_airport_name?: string;
  arrival_iata?: string;
  stops?: number;
  passenger_details?: { fullName?: string };
}

export default function ProfilePage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelingId, setCancelingId] = useState<number | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const user = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (!user || !token) {
      window.location.href = '/login';
      return;
    }
    const { id } = JSON.parse(user);
    fetch(`/api/bookings/user/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setBookings(data);
        setLoading(false);
      })
      .catch(err => {
        setError('Failed to load bookings');
        setLoading(false);
      });
  }, []);

  const handleCancel = async (bookingId: number) => {
    setCancelingId(bookingId);
    setMessage(null);
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`/api/bookings/cancel/${bookingId}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Cancel failed');
      setMessage(`Booking status updated: ${data.status}`);
        // Update ticket list after cancel
        const user = localStorage.getItem('user');
        if (user && token) {
          const { id } = JSON.parse(user);
          fetch(`/api/bookings/user/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
          })
            .then(res => res.json())
            .then(data => setBookings(data));
        }
    } catch (err) {
      setMessage((err as Error).message);
    } finally {
      setCancelingId(null);
    }
  };

  // Функция для определения названия кнопки
  const getCancelButtonText = (departure_time: string) => {
    const flightTime = new Date(departure_time).getTime();
    const now = Date.now();
    return (flightTime - now > 24 * 60 * 60 * 1000) ? 'Refund' : 'Cancel';
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-8 bg-gray-50">
      <h1 className="text-3xl font-bold mb-8 text-center">My Tickets</h1>
      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}
      {!loading && bookings.length === 0 && <p>No tickets found.</p>}
      <div className="w-full max-w-2xl flex flex-col gap-6">
        {bookings.map(b => (
          <div key={b.id} className="bg-white shadow-lg rounded-xl p-6 flex flex-col gap-4 border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${b.status === 'CONFIRMED' ? 'bg-green-100 text-green-700' : b.status === 'NOT_PAID' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-200 text-gray-700'}`}>{b.status}</span>
                {b.status === 'CONFIRMED' && (
                  <span className="text-xs text-gray-500">Confirmation: <span className="font-bold text-gray-700">{b.confirmation_id}</span></span>
                )}
              </div>
              {b.status === 'NOT_PAID' && (
                <button
                  className="px-4 py-2 bg-yellow-500 text-white rounded-lg font-semibold shadow hover:bg-yellow-600 disabled:bg-gray-400"
                  onClick={async () => {
                    const token = localStorage.getItem('token');
                    setMessage(null);
                    try {
                      const res = await fetch(`/api/bookings/pay/${b.id}`, {
                        method: 'POST',
                        headers: { Authorization: `Bearer ${token}` }
                      });
                      const data = await res.json();
                      if (!res.ok) throw new Error(data.message || 'Payment failed');
                      setMessage(`Payment successful! Confirmation: ${data.confirmation_id}`);
                      const user = localStorage.getItem('user');
                      if (user && token) {
                        const { id } = JSON.parse(user);
                        fetch(`/api/bookings/user/${id}`, {
                          headers: { Authorization: `Bearer ${token}` }
                        })
                          .then(res => res.json())
                          .then(data => setBookings(data));
                      }
                    } catch (err) {
                      setMessage((err as Error).message);
                    }
                  }}
                >
                  Pay
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
              <div className="font-medium text-gray-600">Flight:</div>
              <div className="font-semibold text-gray-900">{b.flight_number}</div>
              <div className="font-medium text-gray-600">Airline:</div>
              <div className="font-semibold text-gray-900">{b.airline_name} {b.airline_iata ? `(${b.airline_iata})` : ''}</div>
              <div className="font-medium text-gray-600">Route:</div>
              <div className="font-semibold text-gray-900">{b.departure_city} ({b.departure_airport_name}, {b.departure_iata}) → {b.arrival_city} ({b.arrival_airport_name}, {b.arrival_iata})</div>
              <div className="font-medium text-gray-600">Departure:</div>
              <div className="font-semibold text-gray-900">{new Date(b.departure_time).toLocaleString()}</div>
              <div className="font-medium text-gray-600">Arrival:</div>
              <div className="font-semibold text-gray-900">{new Date(b.arrival_time).toLocaleString()}</div>
              <div className="font-medium text-gray-600">Stops:</div>
              <div className="font-semibold text-gray-900">{typeof b.stops !== 'undefined' ? b.stops : 'N/A'}</div>
              <div className="font-medium text-gray-600">Passengers:</div>
              <div className="font-semibold text-gray-900">{Array.isArray(b.passenger_details) ? b.passenger_details.length : (b.passenger_details ? 1 : 'N/A')}</div>
              <div className="font-medium text-gray-600">Price:</div>
              <div className="font-semibold text-indigo-700">${b.total_price}</div>
              <div className="font-medium text-gray-600">Created:</div>
              <div className="font-semibold text-gray-900">{new Date(b.created_at).toLocaleString()}</div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <a href={`/flight/${b.flight_id}`} className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold shadow hover:bg-blue-700">Details</a>
              {b.status === 'CONFIRMED' && (
                <button
                  className="px-4 py-2 bg-red-600 text-white rounded-lg font-semibold shadow hover:bg-red-700 disabled:bg-gray-400"
                  disabled={cancelingId === b.id}
                  onClick={() => handleCancel(b.id)}
                >
                  {cancelingId === b.id ? (getCancelButtonText(b.departure_time) === 'Refund' ? 'Refunding...' : 'Canceling...') : getCancelButtonText(b.departure_time)}
                </button>
              )}
            </div>
          </div>
        ))}
        {message && <div className="mt-4 text-center text-green-600 font-semibold">{message}</div>}
      </div>
    </main>
  );
}
