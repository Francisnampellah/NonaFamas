import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const createBatch = async (req: Request, res: Response) => {
  const { note } = req.body;

  try {
    // Create the batch
    const batch = await prisma.batch.create({
      data: {
        note,
      },
      include: {
        purchases: {
          include: {
            medicine: {
              include: {
                manufacturer: true,
                unit: true,
                category: true,
              },
            },
            user: true,
          },
        },
      },
    });

    res.status(201).json({
      success: true,
      message: 'Batch created successfully',
      data: batch,
    });
  } catch (error) {
    console.error('Batch creation error:', error);
    res.status(500).json({
      success: false,
      error: 'Error creating batch',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const getBatches = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;

    // Build filter conditions
    const where: any = {};
    
    if (startDate && endDate) {
      where.purchaseDate = {
        gte: new Date(startDate as string),
        lte: new Date(endDate as string),
      };
    }

    const batches = await prisma.batch.findMany({
      where,
      include: {
        purchases: {
          include: {
            medicine: {
              include: {
                manufacturer: true,
                unit: true,
                category: true,
              },
            },
            user: true,
          },
        },
      },
      orderBy: {
        purchaseDate: 'desc',
      },
    });

    res.status(200).json({
      success: true,
      data: batches,
    });
  } catch (error) {
    console.error('Get batches error:', error);
    res.status(500).json({
      success: false,
      error: 'Error fetching batches',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const getBatchById = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const batch = await prisma.batch.findUnique({
      where: { id: parseInt(id) },
      include: {
        purchases: {
          include: {
            medicine: {
              include: {
                manufacturer: true,
                unit: true,
                category: true,
              },
            },
            user: true,
          },
        },
      },
    });

    if (!batch) {
      return res.status(404).json({
        success: false,
        error: 'Batch not found',
      });
    }

    res.status(200).json({
      success: true,
      data: batch,
    });
  } catch (error) {
    console.error('Get batch by ID error:', error);
    res.status(500).json({
      success: false,
      error: 'Error fetching batch',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const updateBatch = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { note } = req.body;

  try {
    const batch = await prisma.batch.update({
      where: { id: parseInt(id) },
      data: {
        note,
      },
      include: {
        purchases: {
          include: {
            medicine: {
              include: {
                manufacturer: true,
                unit: true,
                category: true,
              },
            },
            user: true,
          },
        },
      },
    });

    res.status(200).json({
      success: true,
      message: 'Batch updated successfully',
      data: batch,
    });
  } catch (error) {
    console.error('Update batch error:', error);
    res.status(500).json({
      success: false,
      error: 'Error updating batch',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const deleteBatch = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    // Check if batch exists
    const batch = await prisma.batch.findUnique({
      where: { id: parseInt(id) },
      include: {
        purchases: true,
      },
    });

    if (!batch) {
      return res.status(404).json({
        success: false,
        error: 'Batch not found',
      });
    }

    // Check if batch has any purchases
    if (batch.purchases.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete batch with associated purchases',
      });
    }

    // Delete the batch
    await prisma.batch.delete({
      where: { id: parseInt(id) },
    });

    res.status(200).json({
      success: true,
      message: 'Batch deleted successfully',
    });
  } catch (error) {
    console.error('Delete batch error:', error);
    res.status(500).json({
      success: false,
      error: 'Error deleting batch',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const getBatchSummary = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const batch = await prisma.batch.findUnique({
      where: { id: parseInt(id) },
      include: {
        purchases: {
          include: {
            medicine: {
              include: {
                manufacturer: true,
                unit: true,
                category: true,
              },
            },
          },
        },
      },
    });

    if (!batch) {
      return res.status(404).json({
        success: false,
        error: 'Batch not found',
      });
    }

    // Calculate summary statistics
    const totalPurchases = batch.purchases.length;
    const totalQuantity = batch.purchases.reduce((sum, purchase) => sum + purchase.quantity, 0);
    const totalCost = batch.purchases.reduce(
      (sum, purchase) => sum + purchase.costPerUnit.mul(purchase.quantity).toNumber(),
      0
    );

    const summary = {
      batchId: batch.id,
      purchaseDate: batch.purchaseDate,
      totalPurchases,
      totalQuantity,
      totalCost,
      purchases: batch.purchases.map(purchase => ({
        medicineId: purchase.medicineId,
        medicineName: purchase.medicine.name,
        quantity: purchase.quantity,
        costPerUnit: purchase.costPerUnit,
        totalCost: purchase.costPerUnit.mul(purchase.quantity),
      })),
    };

    res.status(200).json({
      success: true,
      data: summary,
    });
  } catch (error) {
    console.error('Get batch summary error:', error);
    res.status(500).json({
      success: false,
      error: 'Error fetching batch summary',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}; 