import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const createUnit = async (req: Request, res: Response) => {
  const { name } = req.body;

  try {
    const unit = await prisma.unit.create({
      data: { name },
    });
    res.status(201).json({ message: 'Unit created successfully', unit });
  } catch (error) {
    res.status(500).json({ error: 'Error creating unit', details: error });
  }
};

export const getUnits = async (req: Request, res: Response) => {
  try {
    const units = await prisma.unit.findMany();
    res.status(200).json(units);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching units', details: error });
  }
};

export const getUnitById = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const unit = await prisma.unit.findUnique({
      where: { id: parseInt(id) },
    });

    if (!unit) {
      return res.status(404).json({ error: 'Unit not found' });
    }

    res.status(200).json(unit);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching unit', details: error });
  }
};

export const updateUnit = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name } = req.body;

  try {
    const unit = await prisma.unit.update({
      where: { id: parseInt(id) },
      data: { name },
    });

    res.status(200).json({ message: 'Unit updated successfully', unit });
  } catch (error) {
    res.status(500).json({ error: 'Error updating unit', details: error });
  }
};

export const deleteUnit = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    await prisma.unit.delete({
      where: { id: parseInt(id) },
    });

    res.status(200).json({ message: 'Unit deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting unit', details: error });
  }
}; 