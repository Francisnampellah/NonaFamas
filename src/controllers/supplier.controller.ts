import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const createSupplier = async (req: Request, res: Response) => {
  try {
    const { name, contactInfo, email, address } = req.body;

    const existingSupplier = await prisma.supplier.findFirst({
      where: { email }
    });

    if (existingSupplier) {
      return res.status(400).json({ message: 'Supplier with this email already exists' });
    }

    const supplier = await prisma.supplier.create({
      data: {
        name,
        contactInfo,
        email,
        address
      }
    });

    res.status(201).json(supplier);
  } catch (error) {
    res.status(400).json({ message: 'Error creating supplier', error });
  }
};

export const getSuppliers = async (_req: Request, res: Response) => {
  try {
    const suppliers = await prisma.supplier.findMany({
      include: {
        medicines: true
      }
    });
    res.json(suppliers);
  } catch (error) {
    res.status(400).json({ message: 'Error fetching suppliers', error });
  }
};

export const getSupplierById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const supplier = await prisma.supplier.findUnique({
      where: { id: Number(id) },
      include: {
        medicines: true
      }
    });

    if (!supplier) {
      return res.status(404).json({ message: 'Supplier not found' });
    }

    res.json(supplier);
  } catch (error) {
    res.status(400).json({ message: 'Error fetching supplier', error });
  }
};

export const updateSupplier = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, contactInfo, email, address } = req.body;

    const supplier = await prisma.supplier.update({
      where: { id: Number(id) },
      data: {
        name,
        contactInfo,
        email,
        address
      }
    });

    res.json(supplier);
  } catch (error) {
    res.status(400).json({ message: 'Error updating supplier', error });
  }
};

export const deleteSupplier = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const hasMedicines = await prisma.medicine.findFirst({
      where: { supplierId: Number(id) }
    });

    if (hasMedicines) {
      return res.status(400).json({ 
        message: 'Cannot delete supplier with associated medicines' 
      });
    }

    await prisma.supplier.delete({
      where: { id: Number(id) }
    });

    res.json({ message: 'Supplier deleted successfully' });
  } catch (error) {
    res.status(400).json({ message: 'Error deleting supplier', error });
  }
};
