import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { sellSchema } from '../validations/schemas.js';
import { validate } from '../middleware/validate.js';

const prisma = new PrismaClient();

interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    role: string;
  };
}

interface SellWithMedicine {
  id: number;
  medicineId: number;
  userId: number;
  quantity: number;
  totalPrice: number;
  createdAt: Date;
  medicine: {
    name: string;
    sellPrice: number;
  };
}

export const createSells = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { medicineId, quantity } = req.body;
      const userId = req.user?.id;

      console.log('Creating sell:', { medicineId, quantity, userId });

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized'
        });
      }

      // Check if medicine exists
      console.log('Checking medicine with ID:', medicineId);
      const medicine = await prisma.medicine.findUnique({
        where: { id: medicineId },
        include: { stock: true }
      });

      console.log('Found medicine:', medicine);

      if (!medicine) {
        console.log('Medicine not found for ID:', medicineId);
        return res.status(404).json({
          success: false,
          message: 'Medicine not found'
        });
      }

      // Check if there's enough stock
      console.log('Checking stock:', medicine.stock);
      if (!medicine.stock || medicine.stock.quantity < quantity) {
        console.log('Insufficient stock:', { 
          available: medicine.stock?.quantity, 
          requested: quantity 
        });
        return res.status(400).json({
          success: false,
          message: 'Insufficient stock'
        });
      }

      // Calculate total price
      const totalPrice = medicine.sellPrice.mul(quantity);

      // Start a transaction to ensure data consistency
      const result = await prisma.$transaction(async (tx) => {
        // Create the sell record
        const sell = await (tx as any).sell.create({
          data: {
            medicineId,
            userId,
            quantity,
            totalPrice
          }
        });

        // Update stock quantity
        await tx.stock.update({
          where: { medicineId },
          data: {
            quantity: {
              decrement: quantity
            }
          }
        });

        return sell;
      });

      res.status(201).json({
        success: true,
        message: 'Sale recorded successfully',
        data: {
          sell: {
            id: result.id,
            medicineId: result.medicineId,
            quantity: result.quantity,
            totalPrice: result.totalPrice,
            createdAt: result.createdAt
          }
        }
      });
    } catch (error) {
      console.error('Sell creation error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  }
;

export const getSells = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { startDate, endDate, medicineId } = req.query;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    // Build filter conditions
    const where: any = { userId };
    
    if (startDate && endDate) {
      where.createdAt = {
        gte: new Date(startDate as string),
        lte: new Date(endDate as string)
      };
    }

    if (medicineId) {
      where.medicineId = parseInt(medicineId as string);
    }

    // Get sells with related data
    const sells = await (prisma as any).sell.findMany({
      where,
      include: {
        medicine: {
          select: {
            name: true,
            sellPrice: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json({
      success: true,
      data: {
        sells: sells.map((sell: SellWithMedicine) => ({
          id: sell.id,
          medicine: {
            id: sell.medicineId,
            name: sell.medicine.name,
            price: sell.medicine.sellPrice
          },
          quantity: sell.quantity,
          totalPrice: sell.totalPrice,
          createdAt: sell.createdAt
        }))
      }
    });
  } catch (error) {
    console.error('Get sells error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

export const getSellById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    const sell = await (prisma as any).sell.findFirst({
      where: {
        id: parseInt(id),
        userId
      },
      include: {
        medicine: {
          select: {
            name: true,
            sellPrice: true
          }
        }
      }
    });

    if (!sell) {
      return res.status(404).json({
        success: false,
        message: 'Sell record not found'
      });
    }

    res.json({
      success: true,
      data: {
        sell: {
          id: sell.id,
          medicine: {
            id: sell.medicineId,
            name: sell.medicine.name,
            price: sell.medicine.sellPrice
          },
          quantity: sell.quantity,
          totalPrice: sell.totalPrice,
          createdAt: sell.createdAt
        }
      }
    });
  } catch (error) {
    console.error('Get sell by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};