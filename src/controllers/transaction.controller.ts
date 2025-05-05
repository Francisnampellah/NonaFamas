import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    role: string;
  };
}

enum TransactionType {
  SALE = 'SALE',
  PURCHASE = 'PURCHASE',
  EXPENSE = 'EXPENSE',
  FINANCE = 'FINANCE'
}

export const createTransaction = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { type, amount, note, taxApplied, sellId, purchaseId } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    // Get the last transaction of the same type to generate sequential number
    const lastTransaction = await prisma.transaction.findFirst({
      where: { type },
      orderBy: { id: 'desc' }
    });

    // Extract the number from the last reference or start from 1
    const lastNumber = lastTransaction?.referenceNumber 
      ? parseInt(lastTransaction.referenceNumber.split('-')[1])
      : 0;
    const nextNumber = lastNumber + 1;
    const referenceNumber = `${type}-${nextNumber}`;

    const transaction = await prisma.$transaction(async (tx) => {
      return tx.transaction.create({
        data: {
          referenceNumber,
          type,
          amount,
          userId,
          note,
          taxApplied,
          sellId,
          purchaseId
        },
        include: {
          user: true,
          sell: {
            include: {
              medicine: true
            }
          },
          purchase: {
            include: {
              medicine: true
            }
          }
        }
      });
    });

    res.status(201).json({
      success: true,
      message: 'Transaction created successfully',
      data: transaction
    });
  } catch (error: any) {
    console.error('Create transaction error:', error);
    if (error.code === 'P2002') {
      return res.status(400).json({
        success: false,
        message: 'Reference number already exists. Please try again.',
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message || 'Unknown error'
    });
  }
};

export const getTransactions = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { startDate, endDate, type } = req.query;
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

    if (type) {
      where.type = type;
    }

    const transactions = await prisma.transaction.findMany({
      where,
      include: {
        user: true,
        sell: {
          include: {
            medicine: true
          }
        },
        purchase: {
          include: {
            medicine: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json({
      success: true,
      data: transactions
    });
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const getTransactionById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    const transaction = await prisma.transaction.findFirst({
      where: {
        id: parseInt(id),
        userId
      },
      include: {
        user: true,
        sell: {
          include: {
            medicine: true
          }
        },
        purchase: {
          include: {
            medicine: true
          }
        }
      }
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    res.json({
      success: true,
      data: transaction
    });
  } catch (error) {
    console.error('Get transaction by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const updateTransaction = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const updateData = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    const transaction = await prisma.transaction.findFirst({
      where: {
        id: parseInt(id),
        userId
      }
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    const updatedTransaction = await prisma.transaction.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        user: true,
        sell: {
          include: {
            medicine: true
          }
        },
        purchase: {
          include: {
            medicine: true
          }
        }
      }
    });

    res.json({
      success: true,
      message: 'Transaction updated successfully',
      data: updatedTransaction
    });
  } catch (error) {
    console.error('Update transaction error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const deleteTransaction = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    const transaction = await prisma.transaction.findFirst({
      where: {
        id: parseInt(id),
        userId
      }
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    await prisma.transaction.delete({
      where: { id: parseInt(id) }
    });

    res.json({
      success: true,
      message: 'Transaction deleted successfully'
    });
  } catch (error) {
    console.error('Delete transaction error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}; 

