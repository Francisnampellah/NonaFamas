import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import authRoutes from './routes/authRoute.js';
import medicineRoutes from './routes/medicineRoute.js';
import categoryRoutes from './routes/categoryRoute.js';
import manufacturerRoutes from './routes/manufacturerRoute.js';
import purchaseRoutes from './routes/purchaseRoute.js';
import supplierRoutes from './routes/supplierRoute.js';
import unitRoutes from './routes/unitRoute.js';
import stockRoutes from './routes/stockRoute.js'

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const port = process.env.PORT || 3001;

app.use(express.json());

// Configure CORS
app.use(cors({
  origin: '*', // Your frontend URL
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Routes middleware
app.use('/api/auth', authRoutes);
app.use('/api/medicines', medicineRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/manufacturers', manufacturerRoutes);
app.use('/api/purchases', purchaseRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/units', unitRoutes);
app.use('/api/stocks', stockRoutes);


// Basic health check route
app.get('/health', (req:any, res:any) => {
  res.json({ status: 'ok' });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});
