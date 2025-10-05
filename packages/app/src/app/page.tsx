
'use client';

import { useState, useEffect } from 'react';
import SearchForm from '../components/SearchForm';
import FlightResults from '../components/FlightResults';
import BannerSlider from '../components/BannerSlider';
import FeaturedOffers from '../components/FeaturedOffers';
import FlightTable from '../components/FlightTable';
import { Flight } from '../types';
import Link from 'next/link';

export default function Home() {
  const [flights, setFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);
  const [isAuth, setIsAuth] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const handleSearch = async (params: { from: string; to: string; date: string; minPrice?: string; maxPrice?: string; airline?: string; stops?: string }) => {
    setLoading(true);
    setError(null);
    setSearched(true);
    try {
      const paramsObj = {
        from: params.from,
        to: params.to,
        date: params.date,
        minPrice: params.minPrice,
        maxPrice: params.maxPrice,
        airline: params.airline,
        stops: params.stops
      };
      const query = Object.entries(paramsObj)
        .filter(([_, v]) => v !== undefined && v !== '')
        .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v as string)}`)
        .join('&');
      const response = await fetch(`/api/flights/search?${query}`);
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

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuth(false);
    window.location.reload();
  };

  // Проверяем авторизацию только на клиенте
  // и рендерим навигацию только после монтирования
  useEffect(() => {
    setIsMounted(true);
    setIsAuth(!!localStorage.getItem('token'));
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center p-12 bg-gray-50">
      <BannerSlider />
      <h1 className="text-4xl font-bold mb-8">Find Your Next Flight</h1>
      <SearchForm onSearch={handleSearch} loading={loading} />
      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">Error: {error}</p>}
      {searched && !loading && !error && (
        <FlightResults flights={flights} />
      )}
        {/* Таблица вылетов на сегодня */}
        <FlightTable />
      <FeaturedOffers />
    </main>
  );
}
