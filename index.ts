import express from 'express';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import authRoutes from './src/routes/authRoutes';

dotenv.config();

const prisma = new PrismaClient();

// Test database connection
async function testConnection() {
  try {
    await prisma.$connect();
    console.log('Database connection successful');
  } catch (error) {
    console.error('Database connection failed:', error);
    process.exit(1);
  }
}

const app = express();

// Initialize database connection
testConnection();

// Middleware
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);

// Medicine routes


// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
