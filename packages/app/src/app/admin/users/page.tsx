"use client";
import { useEffect, useState } from "react";

interface User {
  id: number;
  email: string;
  full_name: string;
  role: string;
  is_blocked: number;
  created_at: string;
}

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionId, setActionId] = useState<number | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch("/api/users", {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to load users');
        return res.json();
      })
      .then(data => {
        setUsers(data);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load users");
        setLoading(false);
      });
  }, []);

  const handleBlockToggle = async (id: number, block: boolean) => {
    setActionId(id);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/users/${id}/${block ? "block" : "unblock"}`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      if (!res.ok) throw new Error('Failed to update user status');
      // После успешного запроса обновляем список пользователей
      const usersRes = await fetch("/api/users", {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      const usersData = await usersRes.json();
      setUsers(usersData);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setActionId(null);
    }
  };

  return (
    <main className="max-w-4xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">User Management</h1>
      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}
      <table className="w-full table-auto bg-white rounded shadow">
        <thead>
          <tr className="bg-gray-100">
            <th className="px-4 py-2">Email</th>
            <th className="px-4 py-2">Name</th>
            <th className="px-4 py-2">Role</th>
            <th className="px-4 py-2">Status</th>
            <th className="px-4 py-2">Registered</th>
            <th className="px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u.id} className={u.is_blocked ? "bg-red-50" : ""}>
              <td className="px-4 py-2 font-mono">{u.email}</td>
              <td className="px-4 py-2">{u.full_name}</td>
              <td className="px-4 py-2">
                <span className={`px-2 py-1 rounded text-xs font-semibold ${u.role === "ADMIN" ? "bg-yellow-100 text-yellow-700" : u.role === "MANAGER" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-700"}`}>{u.role}</span>
              </td>
              <td className="px-4 py-2">
                {u.is_blocked ? <span className="text-red-600 font-bold">Blocked</span> : <span className="text-green-600 font-bold">Active</span>}
              </td>
              <td className="px-4 py-2">{new Date(u.created_at).toLocaleString()}</td>
              <td className="px-4 py-2 flex gap-2">
                {u.role !== "ADMIN" && (
                  <>
                    <button
                      className={`px-3 py-1 rounded font-semibold shadow ${u.is_blocked ? "bg-green-600 text-white hover:bg-green-700" : "bg-red-600 text-white hover:bg-red-700"}`}
                      disabled={actionId === u.id}
                      onClick={() => handleBlockToggle(u.id, !u.is_blocked)}
                    >
                      {actionId === u.id ? "Processing..." : u.is_blocked ? "Unblock" : "Block"}
                    </button>
                    {u.role === "USER" && (
                      <button
                        className="px-3 py-1 rounded font-semibold shadow bg-blue-600 text-white hover:bg-blue-700"
                        onClick={async () => {
                          setActionId(u.id);
                          try {
                            const token = localStorage.getItem('token');
                            await fetch(`/api/users/${u.id}/make-manager`, {
                              method: "POST",
                              headers: token ? { Authorization: `Bearer ${token}` } : {}
                            });
                            const usersRes = await fetch("/api/users", {
                              headers: token ? { Authorization: `Bearer ${token}` } : {}
                            });
                            const usersData = await usersRes.json();
                            setUsers(usersData);
                          } catch (err) {
                            setError((err as Error).message);
                          } finally {
                            setActionId(null);
                          }
                        }}
                        disabled={actionId === u.id}
                      >
                        Make Manager
                      </button>
                    )}
                    {u.role === "MANAGER" && (
                      <button
                        className="px-3 py-1 rounded font-semibold shadow bg-gray-600 text-white hover:bg-gray-700"
                        onClick={async () => {
                          setActionId(u.id);
                          try {
                            const token = localStorage.getItem('token');
                            await fetch(`/api/users/${u.id}/make-user`, {
                              method: "POST",
                              headers: token ? { Authorization: `Bearer ${token}` } : {}
                            });
                            const usersRes = await fetch("/api/users", {
                              headers: token ? { Authorization: `Bearer ${token}` } : {}
                            });
                            const usersData = await usersRes.json();
                            setUsers(usersData);
                          } catch (err) {
                            setError((err as Error).message);
                          } finally {
                            setActionId(null);
                          }
                        }}
                        disabled={actionId === u.id}
                      >
                        Make User
                      </button>
                    )}
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
