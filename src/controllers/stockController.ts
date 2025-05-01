import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getStock = async (req: Request, res: Response) => {
  try {
    const stock = await prisma.stock.findMany({
      include: {
        medicine: {
          include: {
            manufacturer: true,
            unit: true,
            category: true,
          },
        },
      },
    });
    res.status(200).json(stock);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching stock', details: error });
  }
};

export const getStockByMedicineId = async (req: Request, res: Response) => {
  const { medicineId } = req.params;

  try {
    const stock = await prisma.stock.findUnique({
      where: { medicineId: parseInt(medicineId) },
      include: {
        medicine: {
          include: {
            manufacturer: true,
            unit: true,
            category: true,
          },
        },
      },
    });

    if (!stock) {
      return res.status(404).json({ error: 'Stock not found for this medicine' });
    }

    res.status(200).json(stock);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching stock', details: error });
  }
};

export const updateStock = async (req: Request, res: Response) => {
  const { medicineId } = req.params;
  const { quantity } = req.body;

  try {
    const stock = await prisma.stock.upsert({
      where: { medicineId: parseInt(medicineId) },
      update: { quantity },
      create: {
        medicineId: parseInt(medicineId),
        quantity,
      },
      include: {
        medicine: {
          include: {
            manufacturer: true,
            unit: true,
            category: true,
          },
        },
      },
    });

    res.status(200).json({ message: 'Stock updated successfully', stock });
  } catch (error) {
    res.status(500).json({ error: 'Error updating stock', details: error });
  }
};

export const adjustStock = async (req: Request, res: Response) => {
  const { medicineId } = req.params;
  const { quantity } = req.body; // Positive number for addition, negative for subtraction

  try {
    const currentStock = await prisma.stock.findUnique({
      where: { medicineId: parseInt(medicineId) },
    });

    if (!currentStock) {
      return res.status(404).json({ error: 'Stock not found for this medicine' });
    }

    const newQuantity = currentStock.quantity + quantity;
    if (newQuantity < 0) {
      return res.status(400).json({ error: 'Insufficient stock for this adjustment' });
    }

    const updatedStock = await prisma.stock.update({
      where: { medicineId: parseInt(medicineId) },
      data: { quantity: newQuantity },
      include: {
        medicine: {
          include: {
            manufacturer: true,
            unit: true,
            category: true,
          },
        },
      },
    });

    res.status(200).json({ message: 'Stock adjusted successfully', stock: updatedStock });
  } catch (error) {
    res.status(500).json({ error: 'Error adjusting stock', details: error });
  }
}; 