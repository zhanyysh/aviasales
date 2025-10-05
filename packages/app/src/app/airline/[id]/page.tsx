"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

interface Airline {
  id: number;
  name: string;
  iata_code: string;
  is_active: number;
  manager_id?: number;
}

export default function AirlinePage() {
  const params = useParams();
  const id = params?.id;
  const [airline, setAirline] = useState<Airline | null>(null);
  const [flights, setFlights] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/airlines/${id}`)
      .then(res => res.json())
      .then(data => {
        setAirline(data);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load airline");
        setLoading(false);
      });
    // Получить все рейсы этой авиакомпании
    fetch(`/api/flights/all`)
      .then(res => res.json())
      .then(data => {
        setFlights(Array.isArray(data) ? data.filter(f => String(f.airline_id) === String(id)) : []);
      });
  }, [id]);

  if (loading) return <main className="max-w-2xl mx-auto p-8"><p>Loading...</p></main>;
  if (error || !airline) return <main className="max-w-2xl mx-auto p-8"><p className="text-red-500">{error || "Airline not found"}</p></main>;

  return (
    <main className="max-w-4xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">{airline.name}</h1>
      <p className="mb-2">IATA: <span className="font-semibold">{airline.iata_code}</span></p>
      <p>Status: {airline.is_active === 1 ? <span className="text-green-600 font-bold">Active</span> : <span className="text-gray-500 font-bold">Inactive</span>}</p>
      <h2 className="text-xl font-bold mt-8 mb-4">Flights</h2>
      <table className="w-full table-auto bg-white rounded-xl shadow-lg mb-8 border border-indigo-100">
        <thead>
          <tr className="bg-gray-100">
            <th className="px-4 py-2">Flight Number</th>
            <th className="px-4 py-2">From</th>
            <th className="px-4 py-2">To</th>
            <th className="px-4 py-2">Departure</th>
            <th className="px-4 py-2">Arrival</th>
            <th className="px-4 py-2">Price</th>
          </tr>
        </thead>
        <tbody>
          {flights.length === 0 ? (
            <tr><td colSpan={6} className="text-center py-4">No flights found for this airline.</td></tr>
          ) : flights.map(f => (
            <tr key={f.id}>
              <td className="px-4 py-2 font-semibold">{f.flight_number}</td>
              <td className="px-4 py-2">{f.departure_city} ({f.departure_iata})</td>
              <td className="px-4 py-2">{f.arrival_city} ({f.arrival_iata})</td>
              <td className="px-4 py-2">{f.departure_time}</td>
              <td className="px-4 py-2">{f.arrival_time}</td>
              <td className="px-4 py-2">${f.base_price}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
