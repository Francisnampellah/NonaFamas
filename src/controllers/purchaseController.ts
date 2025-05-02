import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const createPurchase = async (req: Request, res: Response) => {
  const { medicineId, batchId, userId, quantity, costPerUnit } = req.body;

  try {
    // Validate required fields
    if (!medicineId || !batchId || !userId || !quantity || !costPerUnit) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if medicine exists
    const medicine = await prisma.medicine.findUnique({
      where: { id: medicineId },
    });

    if (!medicine) {
      return res.status(404).json({ error: 'Medicine not found' });
    }

    // Check if batch exists
    const batch = await prisma.batch.findUnique({
      where: { id: batchId },
    });

    if (!batch) {
      return res.status(404).json({ error: 'Batch not found' });
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Start a transaction to ensure data consistency
    const result = await prisma.$transaction(async (tx) => {
      // Create the purchase
      const purchase = await tx.purchase.create({
        data: {
          medicineId,
          batchId,
          userId,
          quantity,
          costPerUnit,
        },
        include: {
          medicine: true,
          batch: true,
          user: true,
        },
      });

      // Update or create stock
      const existingStock = await tx.stock.findUnique({
        where: { medicineId },
      });

      if (existingStock) {
        await tx.stock.update({
          where: { medicineId },
          data: {
            quantity: existingStock.quantity + quantity,
          },
        });
      } else {
        await tx.stock.create({
          data: {
            medicineId,
            quantity,
          },
        });
      }

      return purchase;
    });

    res.status(201).json({ 
      success: true,
      message: 'Purchase created successfully', 
      data: result 
    });
  } catch (error) {
    console.error('Purchase creation error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Error creating purchase', 
      details: error 
    });
  }
};

export const getPurchases = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate, medicineId, batchId } = req.query;

    // Build filter conditions
    const where: any = {};
    
    if (startDate && endDate) {
      where.createdAt = {
        gte: new Date(startDate as string),
        lte: new Date(endDate as string)
      };
    }

    if (medicineId) {
      where.medicineId = parseInt(medicineId as string);
    }

    if (batchId) {
      where.batchId = parseInt(batchId as string);
    }

    const purchases = await prisma.purchase.findMany({
      where,
      include: {
        medicine: {
          include: {
            manufacturer: true,
            unit: true,
            category: true,
          },
        },
        batch: true,
        user: true,

      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.status(200).json({
      success: true,
      data: purchases
    });
  } catch (error) {
    console.error('Get purchases error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Error fetching purchases', 
      details: error 
    });
  }
};

export const getPurchaseById = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const purchase = await prisma.purchase.findUnique({
      where: { id: parseInt(id) },
      include: {
        medicine: {
          include: {
            manufacturer: true,
            unit: true,
            category: true,
          },
        },
        batch: true,
        user: true,
      },
    });

    if (!purchase) {
      return res.status(404).json({ 
        success: false,
        error: 'Purchase not found' 
      });
    }

    res.status(200).json({
      success: true,
      data: purchase
    });
  } catch (error) {
    console.error('Get purchase by ID error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Error fetching purchase', 
      details: error 
    });
  }
};

export const getPurchasesByMedicine = async (req: Request, res: Response) => {
  const { medicineId } = req.params;

  try {
    const purchases = await prisma.purchase.findMany({
      where: { medicineId: parseInt(medicineId) },
      include: {
        medicine: {
          include: {
            manufacturer: true,
            unit: true,
            category: true,
          },
        },
        batch: true,
        user: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.status(200).json({
      success: true,
      data: purchases
    });
  } catch (error) {
    console.error('Get purchases by medicine error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Error fetching purchases', 
      details: error 
    });
  }
};

export const deletePurchase = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    // Start a transaction to ensure data consistency
    const result = await prisma.$transaction(async (tx) => {
      // Get the purchase details first
      const purchase = await tx.purchase.findUnique({
        where: { id: parseInt(id) },
        include: {
          medicine: true,
        },
      });

      if (!purchase) {
        throw new Error('Purchase not found here');
      }

      // Delete the purchase
      await tx.purchase.delete({
        where: { id: parseInt(id) },  
      });

      // Update the stock by removing the quantity
      const existingStock = await tx.stock.findUnique({
        where: { medicineId: purchase.medicine.id },
      });

      if (existingStock) {
        await tx.stock.update({
          where: { medicineId: purchase.medicine.id },
          data: {
            quantity: existingStock.quantity - purchase.quantity,
          },
        });
      }

      return purchase;
    });

    res.status(200).json({
      success: true,
      message: 'Purchase deleted successfully',
      data: result,
    });
  } catch (error) {
    console.error('Delete purchase error:', error);
    res.status(500).json({
      success: false,
      error: 'Error deleting purchase',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const updatePurchase = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { medicineId, batchId, userId, quantity, costPerUnit } = req.body;

  try {
    // Start a transaction to ensure data consistency
    const result = await prisma.$transaction(async (tx) => {
      // Get the current purchase details
      const currentPurchase = await tx.purchase.findUnique({
        where: { id: parseInt(id) },
        include: {
          medicine: true,
        },
      });

      if (!currentPurchase) {
        throw new Error('Purchase not found');
      }

      // Update the purchase
      const updatedPurchase = await tx.purchase.update({
        where: { id: parseInt(id) },
        data: {
          medicineId,
          batchId,
          userId,
          quantity,
          costPerUnit,
        },
        include: {
          medicine: {
            include: {
              manufacturer: true,
              unit: true,
              category: true,
            },
          },
          batch: true,
          user: true,
        },
      });

      // Calculate the difference in quantity
      const quantityDiff = quantity - currentPurchase.quantity;

      // Update the stock if there's a difference
      if (quantityDiff !== 0) {
        const existingStock = await tx.stock.findUnique({
          where: { medicineId: updatedPurchase.medicine.id },
        });

        if (existingStock) {
          await tx.stock.update({
            where: { medicineId: updatedPurchase.medicine.id },
            data: {
              quantity: existingStock.quantity + quantityDiff,
            },
          });
        }
      }

      return updatedPurchase;
    });

    res.status(200).json({
      success: true,
      message: 'Purchase updated successfully',
      data: result,
    });
  } catch (error) {
    console.error('Update purchase error:', error);
    res.status(500).json({
      success: false,
      error: 'Error updating purchase',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}; 

