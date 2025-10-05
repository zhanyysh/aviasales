import { useEffect, useState } from 'react';

interface Banner {
  id: number;
  title: string;
  image_url: string;
  airline_id: number;
  is_active: number;
}

export default function BannerSlider() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    fetch('/api/banners')
      .then(res => {
        if (!res.ok) {
          console.error('Ошибка загрузки баннеров:', res.status);
          return [];
        }
        return res.json();
      })
      .then(data => {
        // Показываем только активные баннеры
        const activeBanners = Array.isArray(data) ? data.filter(b => b.is_active === 1) : [];
        setBanners(activeBanners);
      })
      .catch(err => {
        console.error('Ошибка запроса баннеров:', err);
      });
  }, []);

  useEffect(() => {
    if (banners.length > 1) {
      const interval = setInterval(() => {
        setCurrent((prev) => (prev + 1) % banners.length);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [banners]);

  if (banners.length === 0) return null;

  const banner = banners[current];

  return (
  <div className="w-full max-w-5xl mx-auto mb-8">
      <a href={`/airline/${banner.airline_id}`}>
        <div className="relative rounded-lg overflow-hidden shadow-lg cursor-pointer">
          <img
            src={
              banner.image_url.startsWith('/banners/')
                ? `http://localhost:3001${banner.image_url}`
                : banner.image_url
            }
            alt={banner.title}
            className="w-full h-64 object-cover"
          />
          <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-4">
            <h2 className="text-xl font-bold">{banner.title}</h2>
          </div>
        </div>
      </a>
      <div className="flex justify-center mt-2">
        {banners.map((_, idx) => (
          <span key={idx} className={`mx-1 w-2 h-2 rounded-full ${idx === current ? 'bg-indigo-600' : 'bg-gray-300'} inline-block`}></span>
        ))}
      </div>
    </div>
  );
}
