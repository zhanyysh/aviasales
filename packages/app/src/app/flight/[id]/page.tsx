
'use client';
import { useEffect, useState } from 'react';
import { notFound } from 'next/navigation';
import { Flight } from '../../../types';

export default function FlightDetailPage({ params }: { params: { id: string } }) {
  const [flight, setFlight] = useState<Flight | null>(null);
  const [loading, setLoading] = useState(true);

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
  }, [params.id]);

  if (loading) return <div className="max-w-2xl mx-auto p-8">Loading...</div>;
  if (!flight) return notFound();

  return (
    <main className="max-w-2xl mx-auto p-8 bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-4">Flight Details</h1>
      <div className="mb-2"><b>From:</b> {flight.departure_city} ({flight.departure_airport_name})</div>
      <div className="mb-2"><b>To:</b> {flight.arrival_city} ({flight.arrival_airport_name})</div>
      <div className="mb-2"><b>Airline:</b> {flight.airline_name}</div>
      <div className="mb-2"><b>Departure:</b> {flight.departure_time}</div>
      <div className="mb-2"><b>Arrival:</b> {flight.arrival_time}</div>
      <div className="mb-2"><b>Price:</b> ${flight.base_price}</div>
      {/* TODO: Add special offers and buy button */}
    </main>
  );
}
