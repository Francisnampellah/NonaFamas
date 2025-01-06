import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { validateMedicine } from '../validators/medicine.validator';

const prisma = new PrismaClient();

export const medicineController = {
  async create(req: Request, res: Response) {
    try {
      const { name, description, packageType, unitPrice, stockCount, supplierId, supplier } = req.body;
      const validationError = validateMedicine(req.body);
      if (validationError) {
        return res.status(400).json({ error: validationError });
      }

      let finalSupplierId = supplierId;

      // If supplierId is not provided but supplier details are
      if (!supplierId && supplier) {
        // Check if supplier exists by name
        let existingSupplier = await prisma.supplier.findFirst({
          where: { name: supplier.name }
        });

        if (!existingSupplier) {
          // Create new supplier if doesn't exist
          existingSupplier = await prisma.supplier.create({
            data: {
              name: supplier.name,
              contactInfo: supplier.contact,
              email: supplier.email,
              address: supplier.address
            }
          });
        }
        finalSupplierId = existingSupplier.id;
      }

      const medicine = await prisma.medicine.create({
        data: {
          name,
          description,
          packageType,
          unitPrice,
          stockCount,
          supplierId: finalSupplierId
        },
        include: {
          supplier: true
        }
      });

      res.status(201).json(medicine);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create medicine' });
    }
  },

  async getAll(req: Request, res: Response) {
    try {
      const medicines = await prisma.medicine.findMany({
        include: { supplier: true }
      });
      res.json(medicines);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch medicines' });
    }
  },

  async getOne(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const medicine = await prisma.medicine.findUnique({
        where: { id: Number(id) },
        include: { supplier: true }
      });

      if (!medicine) {
        return res.status(404).json({ error: 'Medicine not found' });
      }

      res.json(medicine);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch medicine' });
    }
  },

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      const validationError = validateMedicine(updateData);
      if (validationError) {
        return res.status(400).json({ error: validationError });
      }

      const medicine = await prisma.medicine.update({
        where: { id: Number(id) },
        data: updateData
      });

      res.json(medicine);
    } catch (error) {
      res.status(500).json({ error: 'Failed to update medicine' });
    }
  },

  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await prisma.medicine.delete({
        where: { id: Number(id) }
      });

      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete medicine' });
    }
  }
};
