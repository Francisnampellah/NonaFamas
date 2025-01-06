import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const createSale = async (req: Request, res: Response) => {
  try {
    const { medicineId, quantity, userId } = req.body;

    // Get medicine to check price and stock
    const medicine = await prisma.medicine.findUnique({
      where: { id: medicineId }
    });

    if (!medicine) {
      return res.status(404).json({ message: 'Medicine not found' });
    }

    if (medicine.stockCount < quantity) {
      return res.status(400).json({ message: 'Insufficient stock' });
    }

    const totalPrice = medicine.unitPrice * quantity;

    const sale = await prisma.sale.create({
      data: {
        medicineId,
        quantity,
        totalPrice,
        userId
      },
      include: {
        medicine: true,
        user: true
      }
    });

    // Update medicine stock
    await prisma.medicine.update({
      where: { id: medicineId },
      data: {
        stockCount: {
          decrement: quantity
        }
      }
    });

    res.status(201).json(sale);
  } catch (error) {
    res.status(400).json({ message: 'Error creating sale', error });
  }
};

export const getSales = async (req: Request, res: Response) => {
  try {
    const sales = await prisma.sale.findMany({
      include: {
        medicine: true,
        user: true,
        transactions: true
      }
    });
    res.json(sales);
  } catch (error) {
    res.status(400).json({ message: 'Error fetching sales', error });
  }
};

export const getSaleById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const sale = await prisma.sale.findUnique({
      where: { id: Number(id) },
      include: {
        medicine: true,
        user: true,
        transactions: true
      }
    });
    
    if (!sale) {
      return res.status(404).json({ message: 'Sale not found' });
    }
    
    res.json(sale);
  } catch (error) {
    res.status(400).json({ message: 'Error fetching sale', error });
  }
};
