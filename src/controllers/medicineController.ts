import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const createMedicine = async (req: Request, res: Response) => {
  const { name, manufacturer, unit, category, sellPrice } = req.body;

  try {
    // Handle manufacturer (create if not exists)
    let manufacturerId;
    if (typeof manufacturer === 'string') {
      const existingManufacturer = await prisma.manufacturer.findUnique({
        where: { name: manufacturer },
      });
      if (!existingManufacturer) {
        const newManufacturer = await prisma.manufacturer.create({
          data: { name: manufacturer },
        });
        manufacturerId = newManufacturer.id;
      } else {
        manufacturerId = existingManufacturer.id;
      }
    } else {
      manufacturerId = manufacturer;
    }

    // Handle unit (create if not exists)
    let unitId;
    if (typeof unit === 'string') {
      const existingUnit = await prisma.unit.findUnique({
        where: { name: unit },
      });
      if (!existingUnit) {
        const newUnit = await prisma.unit.create({
          data: { name: unit },
        });
        unitId = newUnit.id;
      } else {
        unitId = existingUnit.id;
      }
    } else {
      unitId = unit;
    }

    // Handle category (create if not exists)
    let categoryId;
    if (typeof category === 'string') {
      const existingCategory = await prisma.category.findUnique({
        where: { name: category },
      });
      if (!existingCategory) {
        const newCategory = await prisma.category.create({
          data: { name: category },
        });
        categoryId = newCategory.id;
      } else {
        categoryId = existingCategory.id;
      }
    } else {
      categoryId = category;
    }

    // Create the medicine
    const medicine = await prisma.medicine.create({
      data: {
        name,
        manufacturerId,
        unitId,
        categoryId,
        sellPrice,
      },
      include: {
        manufacturer: true,
        unit: true,
        category: true,
        stock: true,
      },
    });

    res.status(201).json({ message: 'Medicine created successfully', medicine });
  } catch (error) {
    res.status(500).json({ error: 'Error creating medicine', details: error });
  }
};

export const getMedicines = async (req: Request, res: Response) => {
  try {
    const medicines = await prisma.medicine.findMany({
      include: {
        manufacturer: true,
        unit: true,
        category: true,
        stock: true,
      },
    });
    res.status(200).json(medicines);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching medicines', details: error });
  }
};

export const getMedicineById = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const medicine = await prisma.medicine.findUnique({
      where: { id: parseInt(id) },
      include: {
        manufacturer: true,
        unit: true,
        category: true,
        stock: true,
      },
    });

    if (!medicine) {
      return res.status(404).json({ error: 'Medicine not found' });
    }

    res.status(200).json(medicine);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching medicine', details: error });
  }
};

export const updateMedicine = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, manufacturerId, unitId, categoryId, sellPrice } = req.body;

  try {
    const medicine = await prisma.medicine.update({
      where: { id: parseInt(id) },
      data: {
        name,
        manufacturerId,
        unitId,
        categoryId,
        sellPrice,
      },
      include: {
        manufacturer: true,
        unit: true,
        category: true,
      },
    });

    res.status(200).json({ message: 'Medicine updated successfully', medicine });
  } catch (error) {
    res.status(500).json({ error: 'Error updating medicine', details: error });
  }
};

export const deleteMedicine = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    await prisma.medicine.delete({
      where: { id: parseInt(id) },
    });

    res.status(200).json({ message: 'Medicine deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting medicine', details: error });
  }
}; 