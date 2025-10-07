"use client";
import { useEffect, useState } from "react";

interface Airline {
  id: number;
  name: string;
  iata_code: string;
  is_active: number;
  manager_id?: number;
}

interface Manager {
  id: number;
  full_name: string;
}

export default function AdminAirlines() {
  const [airlines, setAirlines] = useState<Airline[]>([]);
  const [managers, setManagers] = useState<Manager[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [iata, setIata] = useState("");
  const [actionId, setActionId] = useState<number | null>(null);
  const [selectedManager, setSelectedManager] = useState<{ [key: number]: number }>({});
  const [showAssign, setShowAssign] = useState<{ [key: number]: boolean }>({});

  useEffect(() => {
  fetch("https://aviasales-api-xi.vercel.app/api/airlines")
      .then(res => res.json())
      .then(data => {
        setAirlines(data);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load airlines");
        setLoading(false);
      });
    // Получаем список менеджеров
  fetch("https://aviasales-api-xi.vercel.app/api/users", {
      headers: localStorage.getItem('token') ? { Authorization: `Bearer ${localStorage.getItem('token')}` } : {}
    })
      .then(res => res.json())
      .then(data => {
        setManagers(data.filter((u: any) => u.role === "MANAGER"));
      });
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
  const res = await fetch("https://aviasales-api-xi.vercel.app/api/airlines", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: JSON.stringify({ name, iata_code: iata })
    });
    if (res.ok) {
      setName("");
      setIata("");
  const updated = await fetch("https://aviasales-api-xi.vercel.app/api/airlines").then(r => r.json());
      setAirlines(updated);
    }
  };

  const handleDeactivate = async (id: number) => {
    setActionId(id);
    const token = localStorage.getItem('token');
  await fetch(`https://aviasales-api-xi.vercel.app/api/airlines/${id}/deactivate`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
  const updated = await fetch("https://aviasales-api-xi.vercel.app/api/airlines").then(r => r.json());
    setAirlines(updated);
    setActionId(null);
  };

  const handleDelete = async (id: number) => {
    setActionId(id);
    const token = localStorage.getItem('token');
  await fetch(`https://aviasales-api-xi.vercel.app/api/airlines/${id}`, {
      method: "DELETE",
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
  const updated = await fetch("https://aviasales-api-xi.vercel.app/api/airlines").then(r => r.json());
    setAirlines(updated);
    setActionId(null);
  };

  return (
    <main className="max-w-4xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Airline Company Management</h1>
      <form onSubmit={handleAdd} className="flex gap-4 mb-8">
        <input
          type="text"
          placeholder="Company Name"
          value={name}
          onChange={e => setName(e.target.value)}
          className="px-3 py-2 border rounded w-1/2"
          required
        />
        <input
          type="text"
          placeholder="IATA Code"
          value={iata}
          onChange={e => setIata(e.target.value)}
          className="px-3 py-2 border rounded w-1/4"
          required
        />
        <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">Add</button>
      </form>
      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}
      <table className="w-full table-auto bg-white rounded shadow">
        <thead>
          <tr className="bg-gray-100">
            <th className="px-4 py-2">Name</th>
            <th className="px-4 py-2">IATA</th>
            <th className="px-4 py-2">Status</th>
            <th className="px-4 py-2">Manager</th>
            <th className="px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {airlines.map(a => (
            <tr key={a.id} className={a.is_active ? "" : "bg-gray-100"}>
              <td className="px-4 py-2 font-semibold">{a.name}</td>
              <td className="px-4 py-2">{a.iata_code}</td>
              <td className="px-4 py-2">
                {a.is_active === 1 ? (
                  <span className="text-green-600 font-bold">Active</span>
                ) : (
                  <span className="text-gray-500 font-bold">Inactive</span>
                )}
              </td>
              <td className="px-4 py-2">
                {a.manager_id
                  ? managers.find(m => m.id === a.manager_id)?.full_name || `Manager #${a.manager_id}`
                  : <span className="text-gray-400">Not assigned</span>}
              </td>
              <td className="px-4 py-2 flex gap-2">
                {a.is_active === 1 ? (
                  <button
                    className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                    disabled={actionId === a.id}
                    onClick={() => handleDeactivate(a.id)}
                  >Deactivate</button>
                ) : (
                  <button
                    className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                    disabled={actionId === a.id}
                    onClick={async () => {
                      setActionId(a.id);
                      const token = localStorage.getItem('token');
                      await fetch(`https://aviasales-api-xi.vercel.app/api/airlines/${a.id}/activate`, {
                        method: "POST",
                        headers: token ? { Authorization: `Bearer ${token}` } : {}
                      });
                      const updated = await fetch("https://aviasales-api-xi.vercel.app/api/airlines").then(r => r.json());
                      setAirlines(updated);
                      setActionId(null);
                    }}
                  >Activate</button>
                )}
                <button
                  className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                  disabled={actionId === a.id}
                  onClick={() => handleDelete(a.id)}
                >Delete</button>
                <button
                  className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                  onClick={() => setShowAssign(prev => ({ ...prev, [a.id]: !prev[a.id] }))}
                >Assign</button>
                {showAssign && showAssign[a.id] && (
                  <div className="absolute bg-white border rounded shadow p-4 mt-2 z-10">
                    <select
                      className="px-2 py-1 border rounded mb-2"
                      value={selectedManager[a.id] || ""}
                      onChange={e => setSelectedManager(sm => ({ ...sm, [a.id]: Number(e.target.value) }))}
                    >
                      <option value="">Select manager</option>
                      {managers.map(m => (
                        <option key={m.id} value={m.id}>{m.full_name}</option>
                      ))}
                    </select>
                    <button
                      className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                      disabled={!selectedManager[a.id] || actionId === a.id}
                      onClick={async () => {
                        setActionId(a.id);
                        const token = localStorage.getItem('token');
                        await fetch(`https://aviasales-api-xi.vercel.app/api/airlines/${a.id}/assign-manager`, {
                          method: "POST",
                          headers: {
                            "Content-Type": "application/json",
                            ...(token ? { Authorization: `Bearer ${token}` } : {})
                          },
                          body: JSON.stringify({ manager_id: selectedManager[a.id] })
                        });
                        const updated = await fetch("https://aviasales-api-xi.vercel.app/api/airlines").then(r => r.json());
                        setAirlines(updated);
                        setActionId(null);
                        setShowAssign(prev => ({ ...prev, [a.id]: false }));
                      }}
                    >Confirm</button>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
