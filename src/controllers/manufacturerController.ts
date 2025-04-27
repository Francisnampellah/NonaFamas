import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const createManufacturer = async (req: Request, res: Response) => {
  const { name } = req.body;

  try {
    const manufacturer = await prisma.manufacturer.create({
      data: { name },
    });
    res.status(201).json({ message: 'Manufacturer created successfully', manufacturer });
  } catch (error) {
    res.status(500).json({ error: 'Error creating manufacturer', details: error });
  }
};

export const getManufacturers = async (req: Request, res: Response) => {
  try {
    const manufacturers = await prisma.manufacturer.findMany();
    res.status(200).json(manufacturers);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching manufacturers', details: error });
  }
};

export const getManufacturerById = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const manufacturer = await prisma.manufacturer.findUnique({
      where: { id: parseInt(id) },
    });

    if (!manufacturer) {
      return res.status(404).json({ error: 'Manufacturer not found' });
    }

    res.status(200).json(manufacturer);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching manufacturer', details: error });
  }
};

export const updateManufacturer = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name } = req.body;

  try {
    const manufacturer = await prisma.manufacturer.update({
      where: { id: parseInt(id) },
      data: { name },
    });

    res.status(200).json({ message: 'Manufacturer updated successfully', manufacturer });
  } catch (error) {
    res.status(500).json({ error: 'Error updating manufacturer', details: error });
  }
};

export const deleteManufacturer = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    await prisma.manufacturer.delete({
      where: { id: parseInt(id) },
    });

    res.status(200).json({ message: 'Manufacturer deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting manufacturer', details: error });
  }
}; 