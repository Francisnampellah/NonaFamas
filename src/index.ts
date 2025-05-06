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
import excelRoutes from './routes/excelMedicineRoutes.js';
import excelStockRoutes from './routes/excelStockRoute.js';
import batchRoutes from './routes/batch.routes.js';
import userRoutes from "./routes/userRoutes.js"
import transactionRoute from "./routes/transaction.routes.js"
import { cleanupExpiredTokens } from './utils/tokenCleanup.js';
import { exec, execSync } from 'child_process';

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const port = process.env.PORT || 3000;

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
app.use('/api/excel-stock', excelStockRoutes);
app.use('/api/batch', batchRoutes);
app.use("/api/users",userRoutes)
app.use("/api/transactions",transactionRoute)

// Basic health check route
app.get('/health', (req:any, res:any) => {
  res.json({ status: 'ok' });
});

// Run token cleanup every 24 hours
setInterval(cleanupExpiredTokens, 24 * 60 * 60 * 1000);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);

  // Ensure start.sh is executable
  try {
    execSync('chmod +x ./start.sh');
    console.log('start.sh is now executable');
  } catch (error) {
    console.error(`Error setting permissions for start.sh: ${error}`);
  }

  exec('./start.sh', (error: Error | null, stdout: string, stderr: string) => {
    if (error) {
      console.error(`Error executing start.sh: ${error.message}`);
      return;
    }
    if (stderr) {
      console.error(`stderr: ${stderr}`);
      return;
    }
    console.log(`stdout: ${stdout}`);
  });
});

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});
