'use client';

import { useState } from 'react';

interface SearchFormProps {
    onSearch: (params: { from: string; to: string; date: string }) => void;
    loading: boolean;
}

export default function SearchForm({ onSearch, loading }: SearchFormProps) {
    const [from, setFrom] = useState('New York');
    const [to, setTo] = useState('Los Angeles');
    const [date, setDate] = useState('2025-11-15');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSearch({ from, to, date });
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md w-full max-w-2xl mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <label htmlFor="from" className="block text-sm font-medium text-gray-700">From (City)</label>
                    <input
                        type="text"
                        id="from"
                        value={from}
                        onChange={(e) => setFrom(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        placeholder="New York"
                    />
                </div>
                <div>
                    <label htmlFor="to" className="block text-sm font-medium text-gray-700">To (City)</label>
                    <input
                        type="text"
                        id="to"
                        value={to}
                        onChange={(e) => setTo(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        placeholder="Los Angeles"
                    />
                </div>
                <div>
                    <label htmlFor="date" className="block text-sm font-medium text-gray-700">Date</label>
                    <input
                        type="date"
                        id="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                </div>
            </div>
            <div className="mt-6 text-center">
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full md:w-auto inline-flex justify-center py-2 px-8 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400"
                >
                    {loading ? 'Searching...' : 'Search'}
                </button>
            </div>
        </form>
    );
}
