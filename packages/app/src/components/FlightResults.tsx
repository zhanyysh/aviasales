import { Flight } from '../types';
import { useState } from 'react';
import Link from 'next/link';

interface FlightResultsProps {
    flights: Flight[];
}

export default function FlightResults({ flights }: FlightResultsProps) {
    const [buyingId, setBuyingId] = useState<number | null>(null);
    const [message, setMessage] = useState<string | null>(null);

    const handleBuy = async (flight: Flight) => {
        setBuyingId(flight.id);
        setMessage(null);
        const token = localStorage.getItem('token');
        const user = localStorage.getItem('user');
        if (!token || !user) {
            setMessage('Please login to buy tickets.');
            setBuyingId(null);
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
                    total_price: flight.base_price
                })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Booking failed');
            setMessage(`Booking successful! Confirmation: ${data.confirmation_id}`);
        } catch (err) {
            setMessage((err as Error).message);
        } finally {
            setBuyingId(null);
        }
    };

    if (flights.length === 0) {
        return <p className="text-gray-500">No flights found.</p>;
    }

    return (
        <div className="w-full max-w-4xl">
            {flights.map((flight) => (
                <div key={flight.id} className="bg-white shadow-md rounded-lg p-6 mb-4">
                    <div className="grid grid-cols-3 items-center">
                        <div className="text-left">
                            <p className="text-2xl font-bold">{new Date(flight.departure_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                            <p className="text-lg text-gray-600">{flight.departure_iata}</p>
                        </div>
                        <div className="text-center">
                            <p className="text-sm text-gray-500">{flight.airline_name}</p>
                            <div className="border-t border-gray-300 my-1"></div>
                            <p className="text-sm text-gray-500">{flight.flight_number}</p>
                            {/* Количество пересадок */}
                            <p className="text-sm text-gray-700 mt-2">Stops: {typeof flight.stops === 'number' ? flight.stops : (flight.stops === 0 ? 0 : 'N/A')}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-2xl font-bold">{new Date(flight.arrival_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                            <p className="text-lg text-gray-600">{flight.arrival_iata}</p>
                        </div>
                    </div>
                    <div className="text-center mt-4">
                        <p className="text-xl font-semibold text-indigo-600">${flight.base_price}</p>
                        <div className="flex justify-center gap-4 mt-4">
                            <button
                                className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400"
                                disabled={buyingId === flight.id}
                                onClick={() => {
                                    if (typeof window !== 'undefined' && !localStorage.getItem('token')) {
                                        window.location.href = '/login';
                                        return;
                                    }
                                    handleBuy(flight);
                                }}
                            >
                                {buyingId === flight.id ? 'Buying...' : 'Buy'}
                            </button>
                            <Link
                                href={`/flight/${flight.id}`}
                                className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                            >
                                Подробнее
                            </Link>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
