
'use client';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { notFound } from 'next/navigation';
import { Flight } from '../../../types';

export default function FlightDetailPage({ params }: { params: { id: string } }) {
  const searchParams = useSearchParams();
  const offerId = searchParams.get('offerId');
  const [flight, setFlight] = useState<Flight | null>(null);
  const [loading, setLoading] = useState(true);
  const [offer, setOffer] = useState<{ discount_price: string } | null>(null);
  const [buying, setBuying] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!localStorage.getItem('token')) {
      window.location.href = '/login';
      return;
    }
    fetch(`/api/flights/${params.id}`)
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        setFlight(data);
        setLoading(false);
      });
    // Получаем предложение по id рейса
    fetch(`/api/featured_offers?flight_id=${params.id}`)
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data && data.discount_price) setOffer({ discount_price: data.discount_price });
      });
  }, [params.id]);

  if (loading) return <div className="max-w-2xl mx-auto p-8">Loading...</div>;
  if (!flight) return notFound();

  // Рассчитываем длительность рейса
  const duration = (() => {
    const dep = new Date(flight.departure_time);
    const arr = new Date(flight.arrival_time);
    const diffMs = arr.getTime() - dep.getTime();
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs / (1000 * 60)) % 60);
    return `${hours}h ${minutes}m`;
  })();

  const handleBuy = async () => {
    setBuying(true);
    setMessage(null);
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    if (!token || !user) {
      setMessage('Please login to buy tickets.');
      setBuying(false);
      return;
    }
    const passenger_details = { fullName: JSON.parse(user).full_name || 'Passenger' };
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          flight_id: flight.id,
          passenger_details,
          total_price: offer && offer.discount_price ? offer.discount_price : flight.base_price
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Booking failed');
      setMessage(`Booking successful! Confirmation: ${data.confirmation_id}`);
    } catch (err) {
      setMessage((err as Error).message);
    } finally {
      setBuying(false);
    }
  };

  return (
    <main className="max-w-2xl mx-auto p-8 bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-4">Flight Details</h1>
      <div className="mb-2"><b>Flight Number:</b> {flight.flight_number}</div>
      <div className="mb-2"><b>Airline:</b> {flight.airline_name} ({flight.airline_iata})</div>
      <div className="mb-2"><b>From:</b> {flight.departure_city} ({flight.departure_airport_name}, {flight.departure_iata})</div>
      <div className="mb-2"><b>To:</b> {flight.arrival_city} ({flight.arrival_airport_name}, {flight.arrival_iata})</div>
      <div className="mb-2"><b>Departure:</b> {new Date(flight.departure_time).toLocaleString()}</div>
      <div className="mb-2"><b>Arrival:</b> {new Date(flight.arrival_time).toLocaleString()}</div>
      <div className="mb-2"><b>Duration:</b> {duration}</div>
      <div className="mb-2"><b>Stops:</b> {typeof flight.stops !== 'undefined' ? flight.stops : 'N/A'}</div>
      <div className="mb-2"><b>Available Seats:</b> {flight.seats_available}</div>
      <div className="mb-2">
        <b>Price:</b>
        {offer && offer.discount_price ? (
          <>
            <span style={{ textDecoration: 'line-through', color: '#888', marginRight: 8 }}>${flight.base_price}</span>
            <span style={{ color: '#d97706', fontWeight: 'bold' }}>${offer.discount_price}</span>
          </>
        ) : (
          <> ${flight.base_price}</>
        )}
      </div>
      <button
        className="mt-4 px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400"
        disabled={buying}
        onClick={handleBuy}
      >
        {buying ? 'Buying...' : 'Buy Ticket'}
      </button>
      {message && <div className="mt-4 text-center text-indigo-700 font-semibold">{message}</div>}
    </main>
  );
}
