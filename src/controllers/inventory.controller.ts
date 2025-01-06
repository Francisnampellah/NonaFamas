import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { validateInventory } from '../validators/inventory.validator';
import multer from 'multer';
import { parse } from 'csv-parse';

const prisma = new PrismaClient();
const upload = multer();

export const inventoryController = {
  async addStock(req: Request, res: Response) {
    try {
      const { medicineId, quantity, userId } = req.body;
      const validationError = validateInventory(req.body);
      if (validationError) {
        return res.status(400).json({ error: validationError });
      }

      const medicine = await prisma.medicine.findUnique({
        where: { id: medicineId }
      });

      if (!medicine) {
        return res.status(404).json({ error: 'Medicine not found' });
      }

      await prisma.$transaction([
        prisma.inventory.create({
          data: {
            medicineId,
            quantity,
            userId,
            actionType: 'ADD'
          }
        }),
        prisma.medicine.update({
          where: { id: medicineId },
          data: { stockCount: medicine.stockCount + quantity }
        })
      ]);

      res.status(201).json({ message: 'Stock added successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to add stock' });
    }
  },

  async removeStock(req: Request, res: Response) {
    try {
      const { medicineId, quantity, userId } = req.body;
      const validationError = validateInventory(req.body);
      if (validationError) {
        return res.status(400).json({ error: validationError });
      }

      const medicine = await prisma.medicine.findUnique({
        where: { id: medicineId }
      });

      if (!medicine) {
        return res.status(404).json({ error: 'Medicine not found' });
      }

      if (medicine.stockCount < quantity) {
        return res.status(400).json({ error: 'Insufficient stock' });
      }

      await prisma.$transaction([
        prisma.inventory.create({
          data: {
            medicineId,
            quantity,
            userId,
            actionType: 'REMOVE'
          }
        }),
        prisma.medicine.update({
          where: { id: medicineId },
          data: { stockCount: medicine.stockCount - quantity }
        })
      ]);

      res.status(201).json({ message: 'Stock removed successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to remove stock' });
    }
  },

  async getHistory(req: Request, res: Response) {
    try {
      const { medicineId } = req.params;
      const history = await prisma.inventory.findMany({
        where: { medicineId: Number(medicineId) },
        include: {
          medicine: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      res.json(history);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch inventory history' });
    }
  },

  async bulkAddStock(req: Request, res: Response) {
    if (!req.file) {
      return res.status(400).json({ error: 'No CSV file provided' });
    }

    try {
      const records: any[] = [];
      const parser = parse({
        columns: true,
        skip_empty_lines: true
      });

      parser.on('readable', function() {
        let record;
        while ((record = parser.read()) !== null) {
          records.push({
            medicineId: parseInt(record.medicineId),
            quantity: parseInt(record.quantity),
            userId: parseInt(record.userId)
          });
        }
      });

      parser.on('error', function(err:any) {
        throw err;
      });

      parser.write(req.file.buffer.toString());
      parser.end();

      await new Promise((resolve) => parser.on('end', resolve));

      const results = {
        successful: 0,
        failed: 0,
        errors: [] as string[]
      };

      await prisma.$transaction(async (tx) => {
        for (const record of records) {
          try {
            const validationError = validateInventory(record);
            if (validationError) {
              throw new Error(`Validation error: ${validationError}`);
            }

            const medicine = await tx.medicine.findUnique({
              where: { id: record.medicineId }
            });

            if (!medicine) {
              throw new Error(`Medicine with ID ${record.medicineId} not found`);
            }

            await tx.inventory.create({
              data: {
                medicineId: record.medicineId,
                quantity: record.quantity,
                userId: record.userId,
                actionType: 'ADD'
              }
            });

            await tx.medicine.update({
              where: { id: record.medicineId },
              data: { stockCount: medicine.stockCount + record.quantity }
            });

            results.successful++;
          } catch (error: any) {
            results.failed++;
            results.errors.push(`Row failed: ${error.message}`);
          }
        }
      });

      res.status(200).json({
        message: 'Bulk upload processed',
        results
      });
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to process bulk upload', details: error.message });
    }
  },

  getAllInventory: async (req: Request, res: Response) => {
    try {
      const inventory = await prisma.inventory.findMany({
        include: {
          medicine: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      });
      res.json(inventory);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch inventory' });
    }
  }
};

export const uploadMiddleware = upload.single('file');
