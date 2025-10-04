import { useEffect, useState } from 'react';
import { Flight } from '../types';
import Link from 'next/link';

interface Offer {
  id: number;
  flight_id: number;
  discount_price: string;
  description: string;
  flight: Flight | null;
}

export default function FeaturedOffers() {
  const [offers, setOffers] = useState<Offer[]>([]);

  useEffect(() => {
    fetch('/api/featured_offers')
      .then(res => res.json())
      .then(data => setOffers(data));
  }, []);

  if (offers.length === 0) return null;

  return (
    <div className="w-full max-w-4xl mx-auto mb-8">
      <h2 className="text-2xl font-bold mb-4">Special Offers</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {offers.map(offer => (
          <Link
            key={offer.id}
            href={offer.flight_id ? `/flight/${offer.flight_id}?offerId=${offer.id}` : '#'}
            className="bg-white rounded-lg shadow p-6 block hover:bg-gray-100 transition"
          >
            <div className="mb-2 text-lg font-semibold text-indigo-700">{offer.description}</div>
            <div className="mb-2">Discount Price: <span className="font-bold">${offer.discount_price}</span></div>
            {offer.flight && (
              <div className="text-sm text-gray-600">
                {offer.flight.departure_city} → {offer.flight.arrival_city} | {offer.flight.departure_time}
              </div>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
