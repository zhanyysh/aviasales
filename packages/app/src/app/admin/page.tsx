"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useContext } from "react";
import AuthContext from "../../context/AuthContext";

export default function AdminPanel() {
  const { user } = useContext(AuthContext);
  const router = useRouter();

  useEffect(() => {
    if (!user || user.role !== "ADMIN") {
      router.replace("/");
    }
  }, [user, router]);

  if (!user || user.role !== "ADMIN") {
    return null;
  }

  return (
    <main className="max-w-5xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Admin Panel</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <a href="/admin/users" className="block bg-white shadow rounded-lg p-6 hover:bg-indigo-50 transition">
          <h2 className="text-xl font-semibold mb-2">User Management</h2>
          <p>View, block/unblock users</p>
        </a>
        <a href="/admin/airlines" className="block bg-white shadow rounded-lg p-6 hover:bg-indigo-50 transition">
          <h2 className="text-xl font-semibold mb-2">Airline Company Management</h2>
          <p>Add, assign managers, remove companies</p>
        </a>
        <a href="/admin/content" className="block bg-white shadow rounded-lg p-6 hover:bg-indigo-50 transition">
          <h2 className="text-xl font-semibold mb-2">Content Management</h2>
          <p>Update banners and featured offers</p>
        </a>
        <a href="/admin/statistics" className="block bg-white shadow rounded-lg p-6 hover:bg-indigo-50 transition">
          <h2 className="text-xl font-semibold mb-2">Statistics</h2>
          <p>View flights, passengers, revenue, filters</p>
        </a>
      </div>
    </main>
  );
}
