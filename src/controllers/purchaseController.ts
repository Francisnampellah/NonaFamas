import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const createPurchase = async (req: Request, res: Response) => {
  const { medicineId, batchId, supplierId, userId, quantity, costPerUnit } = req.body;

  try {
    // Create the purchase
    const purchase = await prisma.purchase.create({
      data: {
        medicineId,
        batchId,
        supplierId,
        userId,
        quantity,
        costPerUnit,
      },
      include: {
        medicine: true,
        batch: true,
        supplier: true,
        user: true,
      },
    });

    // Update or create stock
    const existingStock = await prisma.stock.findUnique({
      where: { medicineId },
    });

    if (existingStock) {
      await prisma.stock.update({
        where: { medicineId },
        data: {
          quantity: existingStock.quantity + quantity,
        },
      });
    } else {
      await prisma.stock.create({
        data: {
          medicineId,
          quantity,
        },
      });
    }

    res.status(201).json({ message: 'Purchase created successfully', purchase });
  } catch (error) {
    res.status(500).json({ error: 'Error creating purchase', details: error });
  }
};

export const getPurchases = async (req: Request, res: Response) => {
  try {
    const purchases = await prisma.purchase.findMany({
      include: {
        medicine: true,
        batch: true,
        supplier: true,
        user: true,
      },
    });
    res.status(200).json(purchases);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching purchases', details: error });
  }
};

export const getPurchaseById = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const purchase = await prisma.purchase.findUnique({
      where: { id: parseInt(id) },
      include: {
        medicine: true,
        batch: true,
        supplier: true,
        user: true,
      },
    });

    if (!purchase) {
      return res.status(404).json({ error: 'Purchase not found' });
    }

    res.status(200).json(purchase);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching purchase', details: error });
  }
};

export const getPurchasesByMedicine = async (req: Request, res: Response) => {
  const { medicineId } = req.params;

  try {
    const purchases = await prisma.purchase.findMany({
      where: { medicineId: parseInt(medicineId) },
      include: {
        medicine: true,
        batch: true,
        supplier: true,
        user: true,
      },
    });

    res.status(200).json(purchases);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching purchases', details: error });
  }
}; 