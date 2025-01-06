import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const createTransaction = async (req: Request, res: Response) => {
  try {
    const { saleId, paymentType, amountPaid } = req.body;

    const sale = await prisma.sale.findUnique({
      where: { id: saleId },
      include: { transactions: true }
    });

    if (!sale) {
      return res.status(404).json({ message: 'Sale not found' });
    }

    const transaction = await prisma.transaction.create({
      data: {
        saleId,
        paymentType,
        amountPaid
      },
      include: {
        sale: true
      }
    });

    res.status(201).json(transaction);
  } catch (error) {
    res.status(400).json({ message: 'Error creating transaction', error });
  }
};

export const getTransactionsBySale = async (req: Request, res: Response) => {
  try {
    const { saleId } = req.params;
    
    const transactions = await prisma.transaction.findMany({
      where: { saleId: Number(saleId) },
      include: {
        sale: true
      }
    });

    res.json(transactions);
  } catch (error) {
    res.status(400).json({ message: 'Error fetching transactions', error });
  }
};

export const getAllTransactions = async (req: Request, res: Response) => {
  try {
    const transactions = await prisma.transaction.findMany({
      include: {
        sale: {
          include: {
            medicine: true,
            user: true
          }
        }
      }
    });
    
    res.json(transactions);
  } catch (error) {
    res.status(400).json({ message: 'Error fetching transactions', error });
  }
};
