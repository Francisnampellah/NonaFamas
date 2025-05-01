import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import ExcelJS from 'exceljs';

// Add type for file upload
interface MulterRequest extends Request {
  file?: {
    buffer: Buffer;
    originalname: string;
    mimetype: string;
    size: number;
  };
}

const prisma = new PrismaClient();

export const createMedicine = async (req: Request, res: Response) => {
  const { name, manufacturer, unit, category, sellPrice, quantity, dosage } = req.body;

  try {
    // Handle manufacturer (create if not exists)
    let manufacturerId;
    if (isNaN(Number(manufacturer))) { // Check if manufacturer is a name (not an ID)
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
      manufacturerId = parseInt(manufacturer); // Convert string ID to number
    }

    // Check if medicine with same name and manufacturer already exists
    const existingMedicine = await prisma.medicine.findFirst({
      where: {
        name,
        manufacturerId,
      },
    });

    if (existingMedicine) {
      return res.status(400).json({ 
        error: 'Medicine already exists', 
        details: 'A medicine with this name and manufacturer combination already exists' 
      });
    }

    // Handle unit (create if not exists)
    let unitId;
    if (isNaN(Number(unit))) { // Check if unit is a name (not an ID)
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
      unitId = parseInt(unit); // Convert string ID to number
    }

    // Handle category (create if not exists)
    let categoryId;
    if (isNaN(Number(category))) { // Check if category is a name (not an ID)
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
      categoryId = parseInt(category); // Convert string ID to number
    }

    // Create the medicine
    const medicine = await prisma.medicine.create({
      data: {
        name,
        manufacturerId,
        unitId,
        categoryId,
        sellPrice,
        dosage,
      },
      include: {
        manufacturer: true,
        unit: true,
        category: true,
      },
    });

    // Create stock entry for the medicine
    const stock = await prisma.stock.create({
      data: {
        medicineId: medicine.id,
        quantity: +quantity || 0
      }
    });

    // Fetch the complete medicine with stock
    const medicineWithStock = await prisma.medicine.findUnique({
      where: { id: medicine.id },
      include: {
        manufacturer: true,
        unit: true,
        category: true,
        stock: true,
      },
    });

    res.status(201).json({ message: 'Medicine created successfully', medicine: medicineWithStock });
  } catch (error) {
    console.log("Error creating medicine", error)
    res.status(500).json({ error: 'Error creating medicine', details: error });
  }
};



export const getMedicineTemplate = async (req: Request, res: Response) => {
  console.log("Fetching template")  
  try {
    // Fetch existing values

    const [manufacturers, categories, units] = await Promise.all([
      prisma.manufacturer.findMany(),
      prisma.category.findMany(),
      prisma.unit.findMany(),
    ]);

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Medicines');

    // Add headers
    sheet.addRow(['Name', 'Manufacturer (ID or Name)', 'Category (ID or Name)', 'Unit (ID or Name)', 'Sell Price', 'Quantity', 'Dosage']);
    
    // Set column definitions
    sheet.columns = [
      { key: 'name', width: 30 },
      { key: 'manufacturer', width: 30 },
      { key: 'category', width: 30 },
      { key: 'unit', width: 20 },
      { key: 'sellPrice', width: 15 },
      { key: 'quantity', width: 15 },
      { key: 'dosage', width: 20 },
    ];

    // Style the header row
    const headerRow = sheet.getRow(1);
    headerRow.font = { bold: true };
    headerRow.commit();

    // Create hidden sheet for dropdown data
    const hiddenSheet = workbook.addWorksheet('Data');
    hiddenSheet.state = 'veryHidden';

    const addDropdownData = (items: any[], label: string, column: number) => {
      items.forEach((item, i) => {
        hiddenSheet.getCell(i + 1, column).value = `${item.id} - ${item.name}`;
      });

      // Reference string (e.g., 'Data!$A$1:$A$10')
      const ref = String.fromCharCode(65 + column - 1); // Convert column number to letter (A=1, B=2, etc.)
      const range = `Data!$${ref}$1:$${ref}$${items.length}`;

      (sheet as any).dataValidations.add(`${label}2:${label}1000`, {
        type: 'list',
        allowBlank: true,
        formulae: [range],
        showErrorMessage: false, // Allow manual input
      });
    };

    addDropdownData(manufacturers, 'B', 1); // Manufacturer → column B
    addDropdownData(categories, 'C', 2);     // Category → column C
    addDropdownData(units, 'D', 3);          // Unit → column D

    // Send as download
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=medicine_template.xlsx');

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('Error generating template:', error);
    res.status(500).json({ error: 'Failed to generate Excel template' });
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
    console.log("Error deleting medicine", error)
    res.status(500).json({ error: 'Error deleting medicine', details: error });
  }
};

export const bulkUploadMedicines = async (req: MulterRequest, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  try {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(req.file.buffer);
    const worksheet = workbook.getWorksheet('Medicines');

    if (!worksheet) {
      return res.status(400).json({ error: 'Invalid Excel file format. Please use the provided template.' });
    }

    const medicines = [];
    const errors = [];

    // Start from row 2 to skip headers
    for (let i = 2; i <= worksheet.rowCount; i++) {
      const row = worksheet.getRow(i);
      const values = row.values as any[];
      console.log('Row', i, 'values:', values);

      // Only skip if the row is truly empty (no name)
      if (!values || values.length < 2 || !values[1] || String(values[1]).trim() === '') continue;

      const name = String(values[1]).trim();
      const manufacturer = String(values[2] ?? '').trim();
      const category = String(values[3] ?? '').trim();
      const unit = String(values[4] ?? '').trim();
      const sellPrice = String(values[5] ?? '').trim();
      const quantity = String(values[6] ?? '').trim();
      const dosage = String(values[7] ?? '').trim();

      try {
        // Helper function to extract ID from "ID - Name" format
        const extractId = (value: string): number | null => {
          if (!value) return null;
          const match = value.match(/^(\d+)\s*-\s*/);
          return match ? parseInt(match[1]) : null;
        };

        // Handle manufacturer (create if not exists)
        let manufacturerId;
        const manufacturerIdFromValue = extractId(manufacturer);
        if (manufacturerIdFromValue) {
          manufacturerId = manufacturerIdFromValue;
        } else {
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
        }

        // Check if medicine with same name and manufacturer already exists
        const existingMedicine = await prisma.medicine.findFirst({
          where: {
            name,
            manufacturerId,
          },
        });

        if (existingMedicine) {
          errors.push({
            row: i,
            error: 'Medicine already exists',
            details: 'A medicine with this name and manufacturer combination already exists'
          });
          continue;
        }

        // Handle unit (create if not exists)
        let unitId;
        const unitIdFromValue = extractId(unit);
        if (unitIdFromValue) {
          unitId = unitIdFromValue;
        } else {
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
        }

        // Handle category (create if not exists)
        let categoryId;
        const categoryIdFromValue = extractId(category);
        if (categoryIdFromValue) {
          categoryId = categoryIdFromValue;
        } else {
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
        }

        // Create the medicine
        const medicine = await prisma.medicine.create({
          data: {
            name,
            manufacturerId,
            unitId,
            categoryId,
            sellPrice: parseFloat(sellPrice),
            dosage,
          },
          include: {
            manufacturer: true,
            unit: true,
            category: true,
          },
        });

        // Create stock entry
        await prisma.stock.create({
          data: {
            medicineId: medicine.id,
            quantity: parseInt(quantity) || 0,
          },
        });

        medicines.push(medicine);
      } catch (error) {
        errors.push({
          row: i,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    res.status(201).json({
      message: 'Bulk upload completed',
      successCount: medicines.length,
      errorCount: errors.length,
      medicines,
      errors,
    });
  } catch (error) {
    console.error('Error processing bulk upload:', error);
    res.status(500).json({ error: 'Error processing bulk upload', details: error });
  }
};