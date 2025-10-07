// Позволяет разрешить CORS для локального фронта и Vercel-домена
import cors, { CorsOptions } from 'cors';

const allowedOrigins = [
  'http://localhost:3000',
  'https://aviasales-app-wheat.vercel.app'
];

export const corsOptions: CorsOptions = {
  origin: function (
    origin: string | undefined,
    callback: (err: Error | null, allow?: boolean) => void
  ) {
    // Разрешить запросы без Origin (например, curl, Postman)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error('Not allowed by CORS'));
    }
  },
  optionsSuccessStatus: 200
};
