import express from 'express';
import cors from 'cors';
import { corsOptions } from './middleware/corsOptions';
import dotenv from 'dotenv';
import { initDb } from './db';
import flightRoutes from './routes/flights';
import authRoutes from './routes/auth';
import bookingRoutes from './routes/bookings';
import bannersRoutes from './routes/banners';
import featuredOffersRoutes from './routes/featured_offers';
import managerRoutes from './routes/manager';
import { authMiddleware } from './middleware/authMiddleware';
import statisticsRoutes from './routes/statistics';
import usersRoutes from './routes/users';
import airlinesRoutes from './routes/airlines';

dotenv.config();

// Initialize database connection pool
initDb();


const app = express();
// CORS должен быть до всех роутов
app.use(cors(corsOptions));
const port = process.env.PORT || 3001;

app.use(express.json());

// Статические файлы для баннеров
import path from 'path';
app.use('/banners', express.static(path.join(__dirname, '../public/banners')));

app.get('/', (req, res) => {
  res.send('API is running!');
});

// Flight search route
app.use('/api/flights', flightRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/banners', bannersRoutes);
app.use('/api/featured_offers', featuredOffersRoutes);
app.use('/api/manager', authMiddleware, managerRoutes);
app.use('/api/statistics', statisticsRoutes);
app.use('/api/users', usersRoutes);

import airportsRoutes from './routes/airports';
app.use('/api/airports', airportsRoutes);
app.use('/api/airlines', airlinesRoutes);

app.listen(port, () => {
  console.log(`API server listening at http://localhost:${port}`);
});
