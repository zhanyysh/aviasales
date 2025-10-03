'use client';

import { useState } from 'react';
import SearchForm from '../components/SearchForm';
import FlightResults from '../components/FlightResults';
import BannerSlider from '../components/BannerSlider';
import FeaturedOffers from '../components/FeaturedOffers';
import { Flight } from '../types';
import Link from 'next/link';

export default function Home() {
  const [flights, setFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (params: { from: string; to: string; date: string }) => {
    setLoading(true);
    setError(null);
    setSearched(true);
    try {
      // NOTE: This proxy is needed for development to avoid CORS issues.
      // In a real production environment, you would configure your server (e.g., Nginx)
      // to handle this, or have the API and App on the same domain.
      const response = await fetch(`/api/flights/search?from=${params.from}&to=${params.to}&date=${params.date}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch flights');
      }
      
      const data: Flight[] = await response.json();
      setFlights(data);

    } catch (err) {
      setError((err as Error).message);
      setFlights([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-12 bg-gray-50">
      <nav className="w-full flex justify-end mb-8">
        <Link href="/profile" className="mr-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">My Tickets</Link>
        <Link href="/login" className="mr-4 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">Login</Link>
        <Link href="/register" className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300">Sign Up</Link>
      </nav>
      <BannerSlider />
      <h1 className="text-4xl font-bold mb-8">Find Your Next Flight</h1>
      <SearchForm onSearch={handleSearch} loading={loading} />
      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">Error: {error}</p>}
      {searched && !loading && !error && (
        <FlightResults flights={flights} />
      )}
      <FeaturedOffers />
    </main>
  );
}
