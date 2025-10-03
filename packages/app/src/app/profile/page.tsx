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
}

export default function ProfilePage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelingId, setCancelingId] = useState<number | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const fetchBookings = () => {
    const user = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (!user || !token) {
      setError('Not logged in');
      setLoading(false);
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
  };

  useEffect(() => {
    fetchBookings();
    // eslint-disable-next-line
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
      fetchBookings();
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
            <div className="flex justify-between">
              <span className="font-bold">Confirmation:</span>
              <span>{b.confirmation_id}</span>
            </div>
            <div className="flex justify-between">
              <span>Status:</span>
              <span>{b.status}</span>
            </div>
            <div className="flex justify-between">
              <span>Flight:</span>
              <span>{b.flight_number}</span>
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
              <span>Price:</span>
              <span>${b.total_price}</span>
            </div>
            <div className="flex justify-between">
              <span>Created:</span>
              <span>{new Date(b.created_at).toLocaleString()}</span>
            </div>
            <div className="flex justify-end mt-2">
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
