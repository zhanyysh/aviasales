"use client";

import { useEffect, useState } from "react";

interface Stats {
  totalFlights: number;
  activeFlights: number;
  completedFlights: number;
  totalPassengers: number;
  totalRevenue: number;
}

const timeFilters = [
  { label: "Today", value: "today" },
  { label: "This Week", value: "week" },
  { label: "This Month", value: "month" },
  { label: "All Time", value: "all" },
];

export default function AdminStatistics() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/statistics?period=${filter}`)
      .then(res => res.json())
      .then(data => {
        setStats(data);
        setLoading(false);
      });
  }, [filter]);

  return (
    <main className="max-w-2xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Statistics of the Service</h1>
      <div className="mb-4 flex gap-2">
        {timeFilters.map(f => (
          <button
            key={f.value}
            className={`px-4 py-2 rounded ${filter === f.value ? "bg-indigo-600 text-white" : "bg-gray-200"}`}
            onClick={() => setFilter(f.value)}
          >
            {f.label}
          </button>
        ))}
      </div>
      {loading && <p>Loading...</p>}
      {stats && (
        <div className="bg-white rounded shadow p-6">
          <div className="mb-2 text-lg">Total flights created: <span className="font-bold">{stats.totalFlights}</span></div>
          <div className="mb-2 text-lg">Active (upcoming) flights: <span className="font-bold text-green-600">{stats.activeFlights}</span></div>
          <div className="mb-2 text-lg">Completed flights: <span className="font-bold text-gray-600">{stats.completedFlights}</span></div>
          <div className="mb-2 text-lg">Total passengers booked: <span className="font-bold">{stats.totalPassengers}</span></div>
          <div className="mb-2 text-lg">Total revenue: <span className="font-bold text-indigo-700">${stats.totalRevenue.toLocaleString()}</span></div>
        </div>
      )}
    </main>
  );
}
