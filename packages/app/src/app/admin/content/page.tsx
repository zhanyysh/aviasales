"use client";

import { useEffect, useState } from "react";

interface Airline {
  id: number;
  name: string;
}

interface Offer {
  id: number;
  title: string;
  description: string;
  flight_id: number;
  discount_price: number;
  is_active: number;
  created_at: string;
}

interface Banner {
  id: number;
  title: string;
  image_url: string;
  airline_id: number;
  is_active: number;
  created_at: string;
}

export default function AdminContent() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [editOffer, setEditOffer] = useState<Offer | null>(null);
  const [offerForm, setOfferForm] = useState<{ title: string; description: string; flight_id: number; discount_price: number }>({ title: '', description: '', flight_id: 0, discount_price: 0 });
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionId, setActionId] = useState<number | null>(null);
  const [editBanner, setEditBanner] = useState<Banner | null>(null);
  const [editForm, setEditForm] = useState<{ title: string; image_url: string; airline_id: number }>({ title: '', image_url: '', airline_id: 0 });
  const [airlines, setAirlines] = useState<Airline[]>([]);
  const [flights, setFlights] = useState<{ id: number; flight_number: string }[]>([]);

  const fetchBanners = () => {
    setLoading(true);
  fetch("https://aviasales-api-xi.vercel.app/api/banners")
      .then(res => res.json())
      .then(data => {
        setBanners(data);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load banners");
        setLoading(false);
      });
  };

  const fetchOffers = () => {
  fetch("https://aviasales-api-xi.vercel.app/api/featured_offers")
      .then(res => res.json())
      .then(data => setOffers(Array.isArray(data) ? data : []));
  };

  useEffect(() => {
    fetchBanners();
    fetchOffers();
  fetch("https://aviasales-api-xi.vercel.app/api/airlines")
      .then(res => res.json())
      .then(data => setAirlines(Array.isArray(data) ? data : []));
  fetch("https://aviasales-api-xi.vercel.app/api/flights/all")
      .then(res => res.json())
      .then(data => setFlights(Array.isArray(data) ? data.map(f => ({ id: f.id, flight_number: f.flight_number })) : []));
  }, []);
  const handleOfferActivate = async (id: number) => {
    setActionId(id);
  await fetch(`https://aviasales-api-xi.vercel.app/api/featured_offers/${id}/activate`, { method: "POST" });
    fetchOffers();
    setActionId(null);
  };
  const handleOfferDeactivate = async (id: number) => {
    setActionId(id);
  await fetch(`https://aviasales-api-xi.vercel.app/api/featured_offers/${id}/deactivate`, { method: "POST" });
    fetchOffers();
    setActionId(null);
  };
  const handleOfferDelete = async (id: number) => {
    setActionId(id);
  await fetch(`https://aviasales-api-xi.vercel.app/api/featured_offers/${id}`, { method: "DELETE" });
    fetchOffers();
    setActionId(null);
  };
  const openEditOffer = (offer: Offer) => {
    setEditOffer(offer);
    setOfferForm({
      title: offer.title,
      description: offer.description,
      flight_id: offer.flight_id,
      discount_price: offer.discount_price
    });
  };
  const handleOfferFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setOfferForm(f => ({
      ...f,
      [name]: name === 'flight_id' ? Number(value) : name === 'discount_price' ? Number(value) : value
    }));
  };
  const handleOfferEditSave = async () => {
    if (!editOffer) return;
    setActionId(editOffer.id);
  await fetch(`https://aviasales-api-xi.vercel.app/api/featured_offers/${editOffer.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(offerForm)
    });
    setEditOffer(null);
    fetchOffers();
    setActionId(null);
  };

  const handleActivate = async (id: number) => {
    setActionId(id);
  await fetch(`https://aviasales-api-xi.vercel.app/api/banners/${id}/activate`, { method: "POST" });
    fetchBanners();
    setActionId(null);
  };
  const handleDeactivate = async (id: number) => {
    setActionId(id);
  await fetch(`https://aviasales-api-xi.vercel.app/api/banners/${id}/deactivate`, { method: "POST" });
    fetchBanners();
    setActionId(null);
  };
  const handleDelete = async (id: number) => {
    setActionId(id);
  await fetch(`https://aviasales-api-xi.vercel.app/api/banners/${id}`, { method: "DELETE" });
    fetchBanners();
    setActionId(null);
  };

  const openEdit = (banner: Banner) => {
    setEditBanner(banner);
    setEditForm({ title: banner.title, image_url: banner.image_url, airline_id: banner.airline_id });
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditForm(f => ({ ...f, [name]: name === 'airline_id' ? Number(value) : value }));
  };

  const handleEditSave = async () => {
    if (!editBanner) return;
    setActionId(editBanner.id);
  await fetch(`https://aviasales-api-xi.vercel.app/api/banners/${editBanner.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editForm)
    });
    setEditBanner(null);
    fetchBanners();
    setActionId(null);
  };

  return (
    <main className="max-w-4xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Content Management</h1>
      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}
      <h2 className="text-xl font-bold mt-8 mb-4">Banners</h2>
      {/* Форма добавления баннера */}
      <form className="mb-8 bg-white rounded-xl shadow-lg p-6 flex flex-col gap-4 border border-indigo-100" onSubmit={async e => {
        e.preventDefault();
        const form = e.target as typeof e.target & {
          title: { value: string };
          image: { files: FileList };
          airline_id: { value: string };
        };
        const formData = new FormData();
        formData.append('title', form.title.value);
        formData.append('airline_id', form.airline_id.value);
        if (form.image.files[0]) {
          formData.append('image', form.image.files[0]);
        }
  await fetch('https://aviasales-api-xi.vercel.app/api/banners', {
          method: 'POST',
          body: formData
        });
        fetchBanners();
  form.title.value = '';
  (form.image as HTMLInputElement).value = '';
  form.airline_id.value = '';
      }}>
        <div className="font-bold mb-4 text-lg text-indigo-700">Add Banner</div>
        <label className="block mb-2 text-sm font-medium text-gray-700">Title
          <input name="title" placeholder="Enter banner title" className="border rounded-lg px-3 py-2 w-full mt-1 focus:outline-none focus:ring-2 focus:ring-indigo-200" required />
        </label>
        <label className="block mb-2 text-sm font-medium text-gray-700">Image
          <input name="image" type="file" accept="image/*" className="border rounded-lg px-3 py-2 w-full mt-1 focus:outline-none focus:ring-2 focus:ring-indigo-200" required />
        </label>
        <label className="block mb-2 text-sm font-medium text-gray-700">Company
          <select name="airline_id" className="border rounded-lg px-3 py-2 w-full mt-1 focus:outline-none focus:ring-2 focus:ring-indigo-200" required>
            <option value="">Select company</option>
            {airlines.map(a => (
              <option key={a.id} value={a.id}>{a.name}</option>
            ))}
          </select>
        </label>
        <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition">Add Banner</button>
      </form>
  <table className="w-full table-auto bg-white rounded-xl shadow-lg mb-8 border border-indigo-100">
        <thead>
          <tr className="bg-gray-100">
            <th className="px-4 py-2">Title</th>
            <th className="px-4 py-2">Image</th>
            <th className="px-4 py-2">Company</th>
            <th className="px-4 py-2">Status</th>
            <th className="px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {banners.map(b => (
            <tr key={b.id}>
              <td className="px-4 py-2 font-semibold">{b.title}</td>
              <td className="px-4 py-2">
                <img
                  src={b.image_url.startsWith('/banners/')
                    ? `https://aviasales-api-xi.vercel.app${b.image_url}`
                    : b.image_url}
                  alt={b.title}
                  className="h-12"
                />
              </td>
              <td className="px-4 py-2">
                <a href={`/airline/${b.airline_id}`} className="text-blue-600 underline">View Company</a>
              </td>
              <td className="px-4 py-2">{b.is_active === 1 ? <span className="text-green-600 font-bold">Active</span> : <span className="text-gray-500 font-bold">Inactive</span>}</td>
              <td className="px-4 py-2 flex gap-2">
                {b.is_active === 1 ? (
                  <button className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600" disabled={actionId === b.id} onClick={() => handleDeactivate(b.id)}>Deactivate</button>
                ) : (
                  <button className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700" disabled={actionId === b.id} onClick={() => handleActivate(b.id)}>Activate</button>
                )}
                <button className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700" onClick={() => openEdit(b)}>Edit</button>
                <button className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700" disabled={actionId === b.id} onClick={() => handleDelete(b.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2 className="text-xl font-bold mt-8 mb-4">Featured Offers</h2>
      {/* Форма добавления спецпредложения */}
  <form className="mb-8 bg-white rounded-xl shadow-lg p-6 flex flex-col gap-4 border border-indigo-100" onSubmit={async e => {
        e.preventDefault();
        const form = e.target as typeof e.target & {
          title: { value: string };
          description: { value: string };
          flight_id: { value: string };
          discount_price: { value: string };
        };
  await fetch('https://aviasales-api-xi.vercel.app/api/featured_offers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: form.title.value,
            description: form.description.value,
            flight_id: Number(form.flight_id.value),
            discount_price: Number(form.discount_price.value)
          })
        });
        fetchOffers();
        form.title.value = '';
        form.description.value = '';
        form.flight_id.value = '';
        form.discount_price.value = '';
      }}>
        <div className="font-bold mb-4 text-lg text-indigo-700">Add Featured Offer</div>
        <label className="block mb-2 text-sm font-medium text-gray-700">Title
          <input name="title" placeholder="Enter offer title" className="border rounded-lg px-3 py-2 w-full mt-1 focus:outline-none focus:ring-2 focus:ring-indigo-200" required />
        </label>
        <label className="block mb-2 text-sm font-medium text-gray-700">Description
          <textarea name="description" placeholder="Enter offer description" className="border rounded-lg px-3 py-2 w-full mt-1 focus:outline-none focus:ring-2 focus:ring-indigo-200" required />
        </label>
        <label className="block mb-2 text-sm font-medium text-gray-700">Flight
          <select name="flight_id" className="border rounded-lg px-3 py-2 w-full mt-1 focus:outline-none focus:ring-2 focus:ring-indigo-200" required>
            <option value="">Select flight</option>
            {flights.map(f => (
              <option key={f.id} value={f.id}>{f.flight_number}</option>
            ))}
          </select>
        </label>
        <label className="block mb-2 text-sm font-medium text-gray-700">Discount Price
          <input name="discount_price" type="number" step="0.01" placeholder="Enter discount price" className="border rounded-lg px-3 py-2 w-full mt-1 focus:outline-none focus:ring-2 focus:ring-indigo-200" required />
        </label>
        <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition">Add Offer</button>
      </form>
  <table className="w-full table-auto bg-white rounded-xl shadow-lg mb-8 border border-indigo-100">
        <thead>
          <tr className="bg-gray-100">
            <th className="px-4 py-2">Title</th>
            <th className="px-4 py-2">Description</th>
            <th className="px-4 py-2">Company</th>
            <th className="px-4 py-2">Status</th>
            <th className="px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {offers.map(o => (
            <tr key={o.id}>
              <td className="px-4 py-2 font-semibold">{o.title}</td>
              <td className="px-4 py-2">{o.description}</td>
              <td className="px-4 py-2">
                {/* Получаем airline_id из o.airline_id если есть, иначе из o.flight.airline_id */}
                {o.flight_id && (
                  (() => {
                    // Найти flight по id (если flight данные приходят с API)
                    // Найти airline_id через flights и airlines
                    // Для простоты: если o.airline_name есть, показываем её
                    if ((o as any).airline_name) {
                      return <span>{(o as any).airline_name}</span>;
                    }
                    return <span>Flight #{o.flight_id}</span>;
                  })()
                )}
              </td>
              <td className="px-4 py-2">{o.is_active === 1 ? <span className="text-green-600 font-bold">Active</span> : <span className="text-gray-500 font-bold">Inactive</span>}</td>
              <td className="px-4 py-2 flex gap-2">
                {o.is_active === 1 ? (
                  <button className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600" disabled={actionId === o.id} onClick={() => handleOfferDeactivate(o.id)}>Deactivate</button>
                ) : (
                  <button className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700" disabled={actionId === o.id} onClick={() => handleOfferActivate(o.id)}>Activate</button>
                )}
                <button className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700" onClick={() => openEditOffer(o)}>Edit</button>
                <button className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700" disabled={actionId === o.id} onClick={() => handleOfferDelete(o.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Модалка редактирования предложения */}
      {editOffer && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Edit Offer</h2>
            <label className="block mb-2">Title
              <input name="title" value={offerForm.title} onChange={handleOfferFormChange} className="border rounded px-2 py-1 w-full" />
            </label>
            <label className="block mb-2">Description
              <textarea name="description" value={offerForm.description} onChange={handleOfferFormChange} className="border rounded px-2 py-1 w-full" />
            </label>
            <label className="block mb-2">Flight Number
              <select name="flight_id" value={offerForm.flight_id} onChange={handleOfferFormChange} className="border rounded px-2 py-1 w-full">
                <option value="">Select flight</option>
                {flights.map(f => (
                  <option key={f.id} value={f.id}>{f.flight_number}</option>
                ))}
              </select>
            </label>
            <label className="block mb-2">Discount Price
              <input name="discount_price" type="number" step="0.01" value={offerForm.discount_price} onChange={handleOfferFormChange} className="border rounded px-2 py-1 w-full" />
            </label>
            <div className="flex gap-2 justify-end">
              <button className="px-4 py-2 bg-blue-600 text-white rounded" onClick={handleOfferEditSave} disabled={actionId === editOffer.id}>Save</button>
              <button className="px-4 py-2 bg-gray-400 text-white rounded" onClick={() => setEditOffer(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Модалка редактирования баннера */}
      {editBanner && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Edit Banner</h2>
            <label className="block mb-2">Title
              <input name="title" value={editForm.title} onChange={handleEditChange} className="border rounded px-2 py-1 w-full" />
            </label>
            <label className="block mb-2">Image URL
              <input name="image_url" value={editForm.image_url} onChange={handleEditChange} className="border rounded px-2 py-1 w-full" />
            </label>
            <label className="block mb-4">Airline
              <select name="airline_id" value={editForm.airline_id} onChange={handleEditChange} className="border rounded px-2 py-1 w-full">
                <option value="">Select company</option>
                {airlines.map(a => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
            </label>
            <div className="flex gap-2 justify-end">
              <button className="px-4 py-2 bg-blue-600 text-white rounded" onClick={handleEditSave} disabled={actionId === editBanner.id}>Save</button>
              <button className="px-4 py-2 bg-gray-400 text-white rounded" onClick={() => setEditBanner(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
