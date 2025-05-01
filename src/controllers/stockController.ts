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

export const getStock = async (req: Request, res: Response) => {
  try {
    const stock = await prisma.stock.findMany({
      include: {
        medicine: {
          include: {
            manufacturer: true,
            unit: true,
            category: true,
          },
        },
      },
    });
    res.status(200).json(stock);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching stock', details: error });
  }
};

export const getStockByMedicineId = async (req: Request, res: Response) => {
  const { medicineId } = req.params;

  try {
    const stock = await prisma.stock.findUnique({
      where: { medicineId: parseInt(medicineId) },
      include: {
        medicine: {
          include: {
            manufacturer: true,
            unit: true,
            category: true,
          },
        },
      },
    });

    if (!stock) {
      return res.status(404).json({ error: 'Stock not found for this medicine' });
    }

    res.status(200).json(stock);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching stock', details: error });
  }
};

export const updateStock = async (req: Request, res: Response) => {
  const { medicineId } = req.params;
  const { quantity } = req.body;

  try {
    const stock = await prisma.stock.upsert({
      where: { medicineId: parseInt(medicineId) },
      update: { quantity },
      create: {
        medicineId: parseInt(medicineId),
        quantity,
      },
      include: {
        medicine: {
          include: {
            manufacturer: true,
            unit: true,
            category: true,
          },
        },
      },
    });

    res.status(200).json({ message: 'Stock updated successfully', stock });
  } catch (error) {
    res.status(500).json({ error: 'Error updating stock', details: error });
  }
};

export const adjustStock = async (req: Request, res: Response) => {
  const { medicineId } = req.params;
  const { quantity } = req.body; // Positive number for addition, negative for subtraction

  try {
    const currentStock = await prisma.stock.findUnique({
      where: { medicineId: parseInt(medicineId) },
    });

    if (!currentStock) {
      return res.status(404).json({ error: 'Stock not found for this medicine' });
    }

    const newQuantity = currentStock.quantity + quantity;
    if (newQuantity < 0) {
      return res.status(400).json({ error: 'Insufficient stock for this adjustment' });
    }

    const updatedStock = await prisma.stock.update({
      where: { medicineId: parseInt(medicineId) },
      data: { quantity: newQuantity },
      include: {
        medicine: {
          include: {
            manufacturer: true,
            unit: true,
            category: true,
          },
        },
      },
    });

    res.status(200).json({ message: 'Stock adjusted successfully', stock: updatedStock });
  } catch (error) {
    res.status(500).json({ error: 'Error adjusting stock', details: error });
  }
};

export const getStockUpdateTemplate = async (req: Request, res: Response) => {
  try {
    // Fetch existing medicines for dropdown
    const medicines = await prisma.medicine.findMany({
      include: {
        manufacturer: true,
      },
    });

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Stock Update');

    // Add headers
    sheet.addRow(['Medicine (ID or Name)', 'Quantity']);
    
    // Set column definitions
    sheet.columns = [
      { key: 'medicine', width: 40 },
      { key: 'quantity', width: 15 },
    ];

    // Style the header row
    const headerRow = sheet.getRow(1);
    headerRow.font = { bold: true };
    headerRow.commit();

    // Create hidden sheet for dropdown data
    const hiddenSheet = workbook.addWorksheet('Data');
    hiddenSheet.state = 'veryHidden';

    // Add medicine dropdown data
    medicines.forEach((medicine, i) => {
      hiddenSheet.getCell(i + 1, 1).value = `${medicine.id} - ${medicine.name} (${medicine.manufacturer.name})`;
    });

    // Add dropdown validation for medicine column
    const range = `Data!$A$1:$A$${medicines.length}`;
    (sheet as any).dataValidations.add('A2:A1000', {
      type: 'list',
      allowBlank: true,
      formulae: [range],
      showErrorMessage: false, // Allow manual input
    });

    // Send as download
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=stock_update_template.xlsx');

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('Error generating template:', error);
    res.status(500).json({ error: 'Failed to generate Excel template' });
  }
};

export const bulkUpdateStock = async (req: MulterRequest, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  try {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(req.file.buffer);
    const worksheet = workbook.getWorksheet('Stock Update');

    if (!worksheet) {
      return res.status(400).json({ error: 'Invalid template format' });
    }

    const results = {
      success: 0,
      failed: 0,
      errors: [] as string[],
    };

    // Skip header row and process each row
    for (let i = 2; i <= worksheet.rowCount; i++) {
      const row = worksheet.getRow(i);
      const medicineValue = row.getCell(1).value;
      const quantity = row.getCell(2).value;

      if (!medicineValue || !quantity) {
        results.failed++;
        results.errors.push(`Row ${i}: Missing required fields`);
        continue;
      }

      try {
        // Extract medicine ID or find by name
        let medicineId: number;
        if (typeof medicineValue === 'string') {
          const match = medicineValue.match(/^(\d+)/);
          if (match) {
            medicineId = parseInt(match[1]);
          } else {
            // Try to find by name
            const medicine = await prisma.medicine.findFirst({
              where: {
                name: medicineValue,
              },
            });
            if (!medicine) {
              throw new Error(`Medicine not found: ${medicineValue}`);
            }
            medicineId = medicine.id;
          }
        } else if (typeof medicineValue === 'number') {
          medicineId = medicineValue;
        } else {
          throw new Error(`Invalid medicine value: ${medicineValue}`);
        }

        // Get current stock
        const currentStock = await prisma.stock.findUnique({
          where: { medicineId },
        });

        const newQuantity = Number(quantity) + (currentStock?.quantity || 0);

        // Update or create stock with the new total quantity
        await prisma.stock.upsert({
          where: { medicineId },
          update: { quantity: newQuantity },
          create: {
            medicineId,
            quantity: Number(quantity),
          },
        });

        results.success++;
      } catch (error) {
        results.failed++;
        results.errors.push(`Row ${i}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    res.status(200).json({
      message: 'Bulk stock update completed',
      results,
    });
  } catch (error) {
    console.error('Error processing bulk stock update:', error);
    res.status(500).json({ error: 'Error processing bulk stock update', details: error });
  }
}; 