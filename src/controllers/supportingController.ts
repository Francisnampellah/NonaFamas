import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Manufacturer CRUD
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

// Unit CRUD
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

// Category CRUD
export const createCategory = async (req: Request, res: Response) => {
  const { name } = req.body;

  try {
    const category = await prisma.category.create({
      data: { name },
    });
    res.status(201).json({ message: 'Category created successfully', category });
  } catch (error) {
    res.status(500).json({ error: 'Error creating category', details: error });
  }
};

export const getCategories = async (req: Request, res: Response) => {
  try {
    const categories = await prisma.category.findMany();
    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching categories', details: error });
  }
};

// Supplier CRUD
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