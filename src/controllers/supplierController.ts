import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const createSupplier = async (req: Request, res: Response) => {
  const { name, contact } = req.body;

  try {
    const supplier = await prisma.supplier.create({
      data: { name, contact },
    });
    res.status(201).json({ message: 'Supplier created successfully', supplier });
  } catch (error) {
    res.status(500).json({ error: 'Error creating supplier', details: error });
  }
};

export const getSuppliers = async (req: Request, res: Response) => {
  try {
    const suppliers = await prisma.supplier.findMany();
    res.status(200).json(suppliers);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching suppliers', details: error });
  }
};

export const getSupplierById = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const supplier = await prisma.supplier.findUnique({
      where: { id: parseInt(id) },
    });

    if (!supplier) {
      return res.status(404).json({ error: 'Supplier not found' });
    }

    res.status(200).json(supplier);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching supplier', details: error });
  }
};

export const updateSupplier = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, contact } = req.body;

  try {
    const supplier = await prisma.supplier.update({
      where: { id: parseInt(id) },
      data: { name, contact },
    });

    res.status(200).json({ message: 'Supplier updated successfully', supplier });
  } catch (error) {
    res.status(500).json({ error: 'Error updating supplier', details: error });
  }
};

export const deleteSupplier = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    await prisma.supplier.delete({
      where: { id: parseInt(id) },
    });

    res.status(200).json({ message: 'Supplier deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting supplier', details: error });
  }
}; 