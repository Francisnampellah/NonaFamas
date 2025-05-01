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
import sellRoutes from './routes/sell.routes.js';
import excelRoutes from './routes/excelRoutes.js';

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const port = process.env.PORT || 3001;

app.use(express.json());

// Configure CORS
app.use(cors({
  origin: '*', // Your frontend URL
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS','PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Routes middleware
app.use('/api/auth', authRoutes);
app.use('/api/medicine', medicineRoutes);
app.use('/api/category', categoryRoutes);
app.use('/api/manufacture', manufacturerRoutes);
app.use('/api/purchase', purchaseRoutes);
app.use('/api/supplier', supplierRoutes);
app.use('/api/unit', unitRoutes);
app.use('/api/stock', stockRoutes);
app.use('/api/sell', sellRoutes);
app.use('/api/excel', excelRoutes);

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
