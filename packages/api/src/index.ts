import express from 'express';
import dotenv from 'dotenv';
import { initDb } from './db';
import flightRoutes from './routes/flights';
import authRoutes from './routes/auth';
import bookingRoutes from './routes/bookings';
import bannersRoutes from './routes/banners';
import featuredOffersRoutes from './routes/featured_offers';

dotenv.config();

// Initialize database connection pool
initDb();

const app = express();
const port = process.env.PORT || 3001;

app.use(express.json());

app.get('/', (req, res) => {
  res.send('API is running!');
});

// Flight search route
app.use('/api/flights', flightRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/banners', bannersRoutes);
app.use('/api/featured_offers', featuredOffersRoutes);

app.listen(port, () => {
  console.log(`API server listening at http://localhost:${port}`);
});
