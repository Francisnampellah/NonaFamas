import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    role: string;
  };
}

export const createSell = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { medicineId, quantity, price } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    // Validate required fields
    if (!medicineId || !quantity) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Check if medicine exists
    const medicine = await prisma.medicine.findUnique({
      where: { id: medicineId },
      include: { stock: true }
    });

    if (!medicine) {
      return res.status(404).json({
        success: false,
        message: 'Medicine not found'
      });
    }

    // Check if there's enough stock
    if (!medicine.stock || medicine.stock.quantity < quantity) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient stock',
        data: {
          available: medicine.stock?.quantity,
          requested: quantity
        }
      });
    }

    // Calculate total price
    const totalPrice = price ? price : medicine.sellPrice.mul(quantity);

    // Start a transaction to ensure data consistency
    const result = await prisma.$transaction(async (tx) => {
      // Create the sell record
      const sell = await tx.sell.create({
        data: {
          medicineId,
          userId,
          quantity,
          totalPrice: price ? price : totalPrice
        },
        include: {
          medicine: {
            include: {
              manufacturer: true,
              unit: true,
              category: true,
            }
          },
          user: true
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

      // Create transaction record
      const lastTransaction = await tx.transaction.findFirst({
        where: { type: 'SALE' },
        orderBy: { id: 'desc' }
      });
      const nextId = (lastTransaction?.id || 0) + 1;
      const referenceNumber = `SALE-${nextId}`;

      await tx.transaction.create({
        data: {
          referenceNumber,
          type: 'SALE',
          amount: Number(totalPrice),
          userId,
          note: `Sale of ${medicine.name} x ${quantity}`,
          sellId: sell.id
        }
      });

      return sell;
    });

    res.status(201).json({
      success: true,
      message: 'Sale recorded successfully',
      data: result
    });
  } catch (error) {
    console.error('Sell creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

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
    const where: any = {  };
    
    if (startDate && endDate) {
      where.createdAt = {
        gte: new Date(startDate as string),
        lte: new Date(endDate as string)
      };
    }

    if (medicineId) {
      where.medicineId = parseInt(medicineId as string);
    }

    const sells = await prisma.sell.findMany({
      where,
      include: {
        medicine: {
          include: {
            manufacturer: true,
            unit: true,
            category: true,
          }
        },
        user: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json({
      success: true,
      sells
    });
  } catch (error) {
    console.error('Get sells error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error instanceof Error ? error.message : 'Unknown error'
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

    const sell = await prisma.sell.findFirst({
      where: {
        id: parseInt(id),
        userId
      },
      include: {
        medicine: {
          include: {
            manufacturer: true,
            unit: true,
            category: true,
          }
        },
        user: true
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
      data: sell
    });
  } catch (error) {
    console.error('Get sell by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};