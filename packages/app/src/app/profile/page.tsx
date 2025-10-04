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
      <h1 className="text-3xl font-bold mb-6">My Tickets</h1>
      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}
      {!loading && bookings.length === 0 && <p>No tickets found.</p>}
      <div className="w-full max-w-2xl">
        {bookings.map(b => (
          <div key={b.id} className="bg-white shadow rounded p-4 mb-4">
            {b.status === 'CONFIRMED' && (
              <div className="flex justify-between">
                <span className="font-bold">Confirmation:</span>
                <span>{b.confirmation_id}</span>
              </div>
            )}
            {b.status === 'NOT_PAID' && (
              <div className="flex justify-end mt-2">
                <button
                  className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 disabled:bg-gray-400"
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
                      // Обновить список билетов
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
              </div>
            )}
            <div className="flex justify-between">
              <span>Status:</span>
              <span>{b.status}</span>
            </div>
            <div className="flex justify-between">
              <span>Flight:</span>
              <span>{b.flight_number}</span>
            </div>
            <div className="flex justify-between">
              <span>Airline:</span>
              <span>{b.airline_name} {b.airline_iata ? `(${b.airline_iata})` : ''}</span>
            </div>
            <div className="flex justify-between">
              <span>Route:</span>
              <span>{b.departure_city} ({b.departure_airport_name}, {b.departure_iata}) → {b.arrival_city} ({b.arrival_airport_name}, {b.arrival_iata})</span>
            </div>
            <div className="flex justify-between">
              <span>Departure:</span>
              <span>{new Date(b.departure_time).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Arrival:</span>
              <span>{new Date(b.arrival_time).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Stops:</span>
              <span>{typeof b.stops !== 'undefined' ? b.stops : 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span>Passengers:</span>
              <span>{Array.isArray(b.passenger_details) ? b.passenger_details.length : (b.passenger_details ? 1 : 'N/A')}</span>
            </div>
            <div className="flex justify-between">
              <span>Price:</span>
              <span>${b.total_price}</span>
            </div>
            <div className="flex justify-between">
              <span>Created:</span>
              <span>{new Date(b.created_at).toLocaleString()}</span>
            </div>
            <div className="flex justify-end mt-2">
              <a href={`/flight/${b.flight_id}`} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 mr-2">Details</a>
              {b.status === 'CONFIRMED' && (
                <button
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:bg-gray-400"
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
